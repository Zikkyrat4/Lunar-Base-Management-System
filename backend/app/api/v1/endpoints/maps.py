import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form, status, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.orm import Session
from typing import Optional, List
from pathlib import Path
from osgeo import gdal
import shutil

from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.map import create_user_map, get_user_maps
from app.schemas.map import MapCreate, Map
from app.models.map import UserMap
from app.core.config import settings

router = APIRouter(prefix="/maps", tags=["maps"])

UPLOAD_DIR = "/app/uploads/maps"
CHUNKS_DIR = "/app/uploads/chunks"

def ensure_dirs():
    """Создает необходимые директории"""
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    os.makedirs(CHUNKS_DIR, exist_ok=True)
    os.chmod(UPLOAD_DIR, 0o777)
    os.chmod(CHUNKS_DIR, 0o777)

def validate_geotiff(file_path: Path):
    try:
        ds = gdal.Open(str(file_path))
        if not ds:
            raise ValueError("Invalid GeoTIFF format")
        
        transform = ds.GetGeoTransform()
        if transform == (0.0, 1.0, 0.0, 0.0, 0.0, 1.0):
            raise ValueError("Missing georeferencing")
            
        if ds.RasterXSize > 10000 or ds.RasterYSize > 10000:
            raise ValueError("Image dimensions too large (max 10000x10000)")
            
        return True
    except Exception as e:
        raise HTTPException(
            status_code=400,
            detail=f"GeoTIFF validation failed: {str(e)}"
        )
    finally:
        if 'ds' in locals():
            ds = None

@router.post("/upload-chunk", status_code=status.HTTP_201_CREATED)
async def upload_chunk(
    file: UploadFile = File(...),
    name: str = Form(...),
    file_type: str = Form(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        ensure_dirs()
        
        max_size = 50 * 1024 * 1024 * 1024
        file.file.seek(0, 2)  # Переходим в конец файла
        file_size = file.file.tell()
        file.file.seek(0)  # Возвращаемся в начало
        
        if file_size > max_size:
            raise HTTPException(
                status_code=413,
                detail=f"File too large. Max size is {max_size/(1024*1024)}MB"
            )
        
        # Проверка расширения файла
        valid_extensions = {
            'geotiff': ['.tif', '.tiff'],
            'shapefile': ['.shp', '.shx', '.dbf', '.prj']
        }
        
        file_ext = Path(file.filename).suffix.lower()
        if file_ext not in valid_extensions.get(file_type, []):
            raise HTTPException(
                status_code=400,
                detail=f"Invalid file extension for {file_type}"
            )
        
        # Сохраняем файл
        file_id = str(uuid.uuid4())
        file_ext = Path(file.filename).suffix 
        file_path = Path(UPLOAD_DIR) / f"{file_id}{file_ext}"
        
        with open(file_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):  # Читаем по 1MB
                buffer.write(content)
        
        # Создаем запись в БД
        db_map = create_user_map(
            db,
            MapCreate(
                name=name,
                description=description,
                file_type=file_type,
                is_public=is_public
            ),
            current_user.id,
            str(file_path)
        )
        
        return db_map
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Error uploading file: {str(e)}"
        )
    

@router.post("/complete-upload", response_model=Map)
async def complete_upload(
    map_data: MapCreate,  # Используем Pydantic модель
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    try:
        ensure_dirs()
        
        # Проверяем существование всех чанков
        for file_id in map_data.fileIds:
            chunk_dir = Path(CHUNKS_DIR) / file_id
            if not chunk_dir.exists():
                raise HTTPException(
                    status_code=400,
                    detail=f"Chunks not found for fileId: {file_id}"
                )
            
        form_data = await request.form()  # Получаем данные формы
        fileIds = form_data.getlist("fileIds")
        name = form_data.get("name")
        file_type = form_data.get("file_type")
        description = form_data.get("description", None)
        is_public = form_data.get("is_public", "false").lower() == "true"

        final_files = []
        
        for fileId in fileIds:
            chunk_dir = Path(CHUNKS_DIR) / fileId
            if not chunk_dir.exists():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"Chunks directory not found for fileId: {fileId}"
                )
            
            # Получаем оригинальное имя из первого чанка
            chunk_files = sorted(chunk_dir.glob("*.part"), key=lambda x: int(x.stem))
            if not chunk_files:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="No chunks found"
                )
            
            # Определяем расширение файла
            ext = Path(file_type).suffix if file_type == 'geotiff' else '.shp'
            final_filename = f"{uuid.uuid4()}{ext}"
            final_path = Path(UPLOAD_DIR) / final_filename
            
            # Собираем файл из чанков
            with open(final_path, "wb") as output:
                for chunk_path in chunk_files:
                    with open(chunk_path, "rb") as chunk:
                        output.write(chunk.read())
            
            # Очищаем чанки
            shutil.rmtree(chunk_dir)
            final_files.append(str(final_path))
        
        # Создаем запись в базе данных
        map_data = MapCreate(
            name=name,
            description=description,
            file_type=file_type,
            is_public=is_public
        )

        relative_path = f"maps/{file_id}" 

        db_map = create_user_map(
            db,
            MapCreate(
                name=name,
                description=description,
                file_type=file_type,
                is_public=is_public
            ),
            current_user.id,
            relative_path
        )
        return db_map
    except Exception as e:
        # Удаляем частично собранные файлы
        for file_path in final_files:
            try:
                Path(file_path).unlink()
            except:
                pass
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error completing upload: {str(e)}"
        )

@router.get("", response_model=List[Map])
def get_maps(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    maps = get_user_maps(db, user_id=current_user.id, skip=skip, limit=limit)
    return maps

@router.get("/shapefile/{map_id}")
async def get_shapefile(
    map_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    map_data = db.query(UserMap).filter(UserMap.id == map_id).first()
    if not map_data or map_data.file_type != 'shapefile':
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shapefile not found"
        )
    
    base_path = Path(map_data.file_path).parent
    base_name = Path(map_data.file_path).stem
    
    # Проверяем существование файлов
    required_files = [
        base_path / f"{base_name}.shp",
        base_path / f"{base_name}.shx",
        base_path / f"{base_name}.dbf"
    ]
    
    if not all(f.exists() for f in required_files):
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Shapefile components missing"
        )
    
    # Создаем временный zip-архив
    from io import BytesIO
    import zipfile
    
    zip_buffer = BytesIO()
    with zipfile.ZipFile(zip_buffer, 'w', zipfile.ZIP_DEFLATED) as zip_file:
        for ext in ['.shp', '.shx', '.dbf', '.prj']:
            file_path = base_path / f"{base_name}{ext}"
            if file_path.exists():
                zip_file.write(file_path, f"{base_name}{ext}")
    
    zip_buffer.seek(0)
    return StreamingResponse(
        zip_buffer,
        media_type="application/zip",
        headers={
            "Content-Disposition": f"attachment; filename={base_name}.zip"
        }
    )

@router.delete("/{map_id}", status_code=status.HTTP_200_OK)
async def delete_map(
    map_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    db_map = db.query(UserMap).filter(UserMap.id == map_id).first()
    if not db_map:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Map not found"
        )
    
    # Проверяем права
    if db_map.created_by != current_user.id and not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to delete this map"
        )
    
    try:
        # Удаляем связанные файлы
        base_path = Path(db_map.file_path).parent
        base_name = Path(db_map.file_path).stem
        
        for ext in ['.shp', '.shx', '.dbf', '.prj', '.tif', '.tiff']:
            file_path = base_path / f"{base_name}{ext}"
            if file_path.exists():
                try:
                    file_path.unlink()
                except Exception as e:
                    print(f"Error deleting file {file_path}: {str(e)}")
        
        # Удаляем запись из БД
        db.delete(db_map)
        db.commit()
        
        return {"message": "Map deleted successfully"}
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting map: {str(e)}"
        )
    

@router.get("/uploads/maps/{filename}")
async def serve_uploaded_file(filename: str):
    file_location = Path(UPLOAD_DIR) / filename
    if not file_location.exists():
        raise HTTPException(status_code=404, detail="File not found")
    return FileResponse(file_location)