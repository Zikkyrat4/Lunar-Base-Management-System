import React, { useState } from 'react';
import { Upload, Button, message, Modal, Form, Input, Select, Card, Progress, List } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const { Option } = Select;
const CHUNK_SIZE = 500 * 1024 * 1024;

const MapUpload = ({ onUploadSuccess }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentFileIndex, setCurrentFileIndex] = useState(0);
  const token = useSelector(state => state.auth.token);

  const generateFileId = () => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  };

  const uploadFileInChunks = async (file, formValues) => {
    const fileSize = file.size;
    const chunks = Math.ceil(fileSize / CHUNK_SIZE);
    const fileId = generateFileId();
  
    for (let chunkIndex = 0; chunkIndex < chunks; chunkIndex++) {
      const start = chunkIndex * CHUNK_SIZE;
      const end = Math.min(start + CHUNK_SIZE, fileSize);
      const chunk = file.slice(start, end);
  
      const formData = new FormData();
      formData.append('file', chunk);
      formData.append('fileId', fileId);
      formData.append('chunkIndex', chunkIndex);
      formData.append('totalChunks', chunks);
      formData.append('originalName', file.name);
      formData.append('file_type', formValues.file_type);
      formData.append('name', formValues.name);
      if (formValues.description) {
        formData.append('description', formValues.description);
      }
      formData.append('is_public', formValues.is_public);
  
      await api.post('/maps/upload-chunk', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            ((chunkIndex * CHUNK_SIZE + progressEvent.loaded) / fileSize * 100)
          );
          setUploadProgress(percent);
        }
      });
    }
    return fileId;
  };

  const handleUpload = async () => {
    try {
      const values = await form.validateFields();
      
      if (!token) {
        message.error('Требуется авторизация');
        return;
      }

      if (fileList.length === 0) {
        message.error('Пожалуйста, выберите файл');
        return;
      }
  
      setLoading(true);
      setUploadProgress(0);
  
      const isGeoTIFF = fileList.some(file => 
        file.name.toLowerCase().endsWith('.tif') || 
        file.name.toLowerCase().endsWith('.tiff')
      );
  
      // Загружаем файлы по одному
      for (let i = 0; i < fileList.length; i++) {
        setCurrentFileIndex(i);
        
        const formData = new FormData();
        formData.append('file', fileList[i].originFileObj);
        formData.append('name', values.name);
        formData.append('file_type', isGeoTIFF ? 'geotiff' : 'shapefile');
        formData.append('is_public', values.is_public);
        
        if (values.description) {
          formData.append('description', values.description);
        }
  
        try {
          await api.post('/maps/upload-chunk', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
              'Authorization': `Bearer ${token}`
            },
            timeout: 3600000, // Увеличиваем таймаут для этого запроса
            onUploadProgress: (progressEvent) => {
              const percent = Math.round(
                (progressEvent.loaded / progressEvent.total * 100)
              );
              setUploadProgress(percent);
            }
          });
        } catch (error) {
          if (error.code === 'ECONNABORTED') {
            message.error('Время загрузки истекло. Попробуйте уменьшить размер файла.');
          } else {
            throw error;
          }
        }
      }
  
      message.success('Файлы успешно загружены');
      setVisible(false);
      form.resetFields();
      setFileList([]);
      setUploadProgress(0);
      onUploadSuccess();
    } catch (error) {
      console.error('Upload error:', error);
      message.error(error.response?.data?.detail || 'Ошибка загрузки');
    } finally {
      setLoading(false);
    }
  };
  

  const beforeUpload = (file) => {
    const isShapefile = file.name.toLowerCase().endsWith('.shp') || 
                       file.name.toLowerCase().endsWith('.shx') || 
                       file.name.toLowerCase().endsWith('.dbf') ||
                       file.name.toLowerCase().endsWith('.prj');
    
    const isGeoTIFF = file.name.toLowerCase().endsWith('.tif') || 
                      file.name.toLowerCase().endsWith('.tiff');
    
    if (!isShapefile && !isGeoTIFF) {
      message.error('Можно загружать только Shapefile (.shp, .shx, .dbf, .prj) или GeoTIFF (.tif, .tiff)');
      return Upload.LIST_IGNORE;
    }
    
    return false;
  };

  const onFileChange = ({ fileList }) => {
    const isGeoTIFF = fileList.some(file => 
      file.name.toLowerCase().endsWith('.tif') || 
      file.name.toLowerCase().endsWith('.tiff')
    );
    
    if (isGeoTIFF && fileList.length > 1) {
      message.error('Для GeoTIFF выберите только один файл');
      return;
    }
    
    if (!isGeoTIFF) {
      const hasShp = fileList.some(file => file.name.toLowerCase().endsWith('.shp'));
      if (!hasShp && fileList.length > 0) {
        message.error('Для Shapefile обязателен .shp файл');
        return;
      }
    }
    
    setFileList(fileList);
  };

  return (
    <Card title="Загрузка карт" style={{ marginBottom: 20 }}>
      <Button 
        type="primary" 
        icon={<UploadOutlined />} 
        onClick={() => setVisible(true)}
        style={{ marginBottom: 16 }}
      >
        Загрузить карту
      </Button>

      <Modal
        title="Загрузка новой карты"
        visible={visible}
        onOk={handleUpload}
        onCancel={() => {
          setVisible(false);
          setFileList([]);
          setUploadProgress(0);
        }}
        confirmLoading={loading}
        width={800}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Название карты"
            rules={[{ required: true, message: 'Укажите название карты!' }]}
          >
            <Input />
          </Form.Item>
          
          <Form.Item
            name="description"
            label="Описание"
          >
            <Input.TextArea />
          </Form.Item>
          
          <Form.Item
            name="is_public"
            label="Видимость"
            initialValue={false}
          >
            <Select>
              <Option value={false}>Приватная</Option>
              <Option value={true}>Публичная</Option>
            </Select>
          </Form.Item>
          
          <Form.Item
            label="Файлы карты"
            required
          >
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={onFileChange}
              accept=".shp,.shx,.dbf,.prj,.tif,.tiff"
              multiple
            >
              <Button icon={<UploadOutlined />}>Выбрать файлы</Button>
              <div style={{ marginTop: 8 }}>
                Поддерживаемые форматы: 
                <ul>
                  <li>Shapefile: .shp (обязательно), .shx, .dbf, .prj</li>
                  <li>GeoTIFF: .tif или .tiff (один файл)</li>
                </ul>
                Максимальный размер: 50GB
              </div>
            </Upload>
          </Form.Item>

          {fileList.length > 0 && (
            <List
              dataSource={fileList}
              renderItem={(file, index) => (
                <List.Item>
                  <List.Item.Meta
                    title={
                      <div style={{ 
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        maxWidth: '250px'
                      }}>
                        {file.name}
                      </div>
                    }
                    description={`${(file.size / (1024 * 1024)).toFixed(2)} MB`}
                  />
                  {index === currentFileIndex && uploadProgress > 0 && (
                    <Progress percent={uploadProgress} status="active" />
                  )}
                </List.Item>
              )}
            />
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default MapUpload;