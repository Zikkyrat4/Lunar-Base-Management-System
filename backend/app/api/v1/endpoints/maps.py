# backend/app/api/v1/endpoints/maps.py
import os
import uuid
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
import zipfile
import requests
from requests.auth import HTTPBasicAuth
from app.core.config import settings
from app.db.session import get_db
from app.api.deps import get_current_user
from app.crud.map import create_user_map, get_user_maps
from app.schemas.map import MapCreate, Map

router = APIRouter(prefix="/maps", tags=["maps"])

GEOSERVER_AUTH = HTTPBasicAuth(settings.GEOSERVER_USER, settings.GEOSERVER_PASSWORD)


async def publish_to_geoserver(file_path: str, file_type: str, workspace: str = "lunar"):
    """Publish file to GeoServer with proper workspace handling"""
    layer_name = os.path.splitext(os.path.basename(file_path))[0]
    layer_name = layer_name.replace(" ", "_").lower()
    
    # 1. Check/create workspace and namespace (остается без изменений)
    
    if file_type == "geotiff":
        # Create coverage store
        cs_url = f"{settings.GEOSERVER_URL}/rest/workspaces/{workspace}/coveragestores/{layer_name}/file.geotiff?configure=first&coverageName={layer_name}"
        
        try:
            with open(file_path, "rb") as f:
                response = requests.put(
                    cs_url,
                    data=f,
                    headers={"Content-type": "image/geotiff"},
                    auth=GEOSERVER_AUTH
                )
                
            if not response.ok:
                raise HTTPException(
                    status_code=500,
                    detail=f"Failed to create coverage store: {response.text}"
                )
            
            # Enable layer and set SRS
            layer_url = f"{settings.GEOSERVER_URL}/rest/layers/{workspace}:{layer_name}"
            layer_config = {
                "layer": {
                    "defaultStyle": {
                        "name": "raster"
                    },
                    "enabled": True
                }
            }
            
            response = requests.put(
                layer_url,
                json=layer_config,
                auth=GEOSERVER_AUTH,
                headers={"Content-type": "application/json"}
            )
            
            # Set SRS for the coverage
            coverage_url = f"{settings.GEOSERVER_URL}/rest/workspaces/{workspace}/coveragestores/{layer_name}/coverages/{layer_name}"
            coverage_config = {
                "coverage": {
                    "srs": "EPSG:4326",
                    "projectionPolicy": "FORCE_DECLARED",
                    "enabled": True
                }
            }
            
            response = requests.put(
                coverage_url,
                json=coverage_config,
                auth=GEOSERVER_AUTH,
                headers={"Content-type": "application/json"}
            )
            
            return layer_name
            
        except Exception as e:
            raise HTTPException(
                status_code=500,
                detail=f"GeoServer GeoTIFF upload failed: {str(e)}"
            )

    elif file_type == "shapefile":
        # For shapefile, we need to upload a zip containing all required files
        try:
            # Create temporary zip file
            zip_path = f"{file_path}.zip"
            base_name = os.path.splitext(file_path)[0]
            
            with zipfile.ZipFile(zip_path, 'w') as zipf:
                for ext in ['.shp', '.shx', '.dbf', '.prj']:
                    if os.path.exists(f"{base_name}{ext}"):
                        zipf.write(f"{base_name}{ext}", arcname=f"{layer_name}{ext}")

            # Upload to GeoServer
            ds_url = f"{settings.GEOSERVER_URL}/rest/workspaces/{workspace}/datastores/{layer_name}/file.shp?configure=first"
            
            with open(zip_path, "rb") as f:
                response = requests.put(
                    ds_url,
                    data=f,
                    headers={"Content-type": "application/zip"},
                    auth=GEOSERVER_AUTH
                )
            
            # Clean up temp file
            os.remove(zip_path)
            
            if not response.ok:
                raise HTTPException(
                    status_code=500,
                    detail=f"GeoServer Shapefile upload failed: {response.text}"
                )
                
            return layer_name
            
        except Exception as e:
            if os.path.exists(zip_path):
                os.remove(zip_path)
            raise HTTPException(
                status_code=500,
                detail=f"Shapefile processing failed: {str(e)}"
            )
    else:
        raise HTTPException(
            status_code=400,
            detail="Unsupported file type"
        )

@router.post("/upload", response_model=Map)
async def upload_map(
    file: UploadFile = File(...),
    name: str = Form(...),
    file_type: str = Form(...),
    description: Optional[str] = Form(None),
    is_public: bool = Form(False),
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Validate file type
    if file_type not in ["geotiff", "shapefile"]:
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    # Create uploads directory if not exists
    upload_dir = settings.GEOSERVER_UPLOAD_PATH
    os.makedirs(upload_dir, exist_ok=True)
    
    # Generate unique filename
    file_id = str(uuid.uuid4())
    file_ext = ".tif" if file_type == "geotiff" else ".shp"
    file_path = os.path.join(upload_dir, f"{file_id}{file_ext}")
    
    try:
        # Save file
        with open(file_path, "wb") as buffer:
            while content := await file.read(1024 * 1024):  # 1MB chunks
                buffer.write(content)
        
        # Publish to GeoServer
        try:
            layer_name = await publish_to_geoserver(file_path, file_type)
        except Exception as e:
            os.remove(file_path)
            raise HTTPException(
                status_code=500,
                detail=f"GeoServer publish failed: {str(e)}"
            )
        
        # Create DB record
        db_map = create_user_map(
            db,
            MapCreate(
                name=name,
                description=description,
                file_type=file_type,
                is_public=is_public
            ),
            current_user.id,
            layer_name  # Store the layer name instead of file path
        )
        
        return db_map
        
    except Exception as e:
        # Clean up if error occurs
        if os.path.exists(file_path):
            os.remove(file_path)
        raise HTTPException(
            status_code=500,
            detail=f"File upload failed: {str(e)}"
        )
    
@router.get("", response_model=list[Map])
def get_maps(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    return get_user_maps(db, user_id=current_user.id, skip=skip, limit=limit)

@router.delete("/{map_id}")
def delete_map(
    map_id: int,
    db: Session = Depends(get_db),
    current_user: dict = Depends(get_current_user)
):
    # Implementation to delete from GeoServer and DB
    pass