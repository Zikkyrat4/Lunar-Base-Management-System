// frontend/src/components/Map/MapUpload.js
import React, { useState } from 'react';
import { Upload, Button, message, Modal, Form, Input, Select, Card, Progress, List } from 'antd';
import { UploadOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import api from '../../api/axios';

const { Option } = Select;

const MapUpload = ({ onUploadSuccess }) => {
  const [form] = Form.useForm();
  const [visible, setVisible] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fileList, setFileList] = useState([]);
  const [uploadProgress, setUploadProgress] = useState(0);
  const token = useSelector(state => state.auth.token);

  const beforeUpload = (file) => {
    const isShapefile = file.name.toLowerCase().endsWith('.shp');
    const isGeoTIFF = file.name.toLowerCase().endsWith('.tif') || 
                     file.name.toLowerCase().endsWith('.tiff');
    
    if (!isShapefile && !isGeoTIFF) {
      message.error('Можно загружать только Shapefile (.shp) или GeoTIFF (.tif, .tiff)');
      return Upload.LIST_IGNORE;
    }
    
    return false;
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
      
      const formData = new FormData();
      formData.append('file', fileList[0].originFileObj);
      formData.append('name', values.name);
      formData.append('file_type', 
        fileList[0].name.toLowerCase().endsWith('.shp') ? 'shapefile' : 'geotiff');
      formData.append('is_public', values.is_public);
      
      if (values.description) {
        formData.append('description', values.description);
      }
  
      try {
        await api.post('/maps/upload', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
            'Authorization': `Bearer ${token}`
          },
          onUploadProgress: (progressEvent) => {
            const percent = Math.round(
              (progressEvent.loaded / progressEvent.total * 100)
            );
            setUploadProgress(percent);
          }
        });
  
        message.success('Файл успешно загружен и опубликован в GeoServer');
        setVisible(false);
        form.resetFields();
        setFileList([]);
        setUploadProgress(0);
        onUploadSuccess();
      } catch (error) {
        let errorMessage = 'Ошибка загрузки';
        if (error.response?.data?.detail) {
          errorMessage = error.response.data.detail;
        }
        message.error(errorMessage);
        console.error('Upload error:', error);
      }
    } catch (validationError) {
      message.error('Пожалуйста, заполните все обязательные поля');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Загрузка карт" style={{ marginBottom: 20 }}>
      <Button 
        type="primary" 
        icon={<UploadOutlined />} 
        onClick={() => setVisible(true)}
        style={{ 
          marginBottom: 16,
          background: '#1890ff',
          borderColor: '#1890ff'
        }}
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
            label="Файл карты"
            required
          >
            <Upload
              beforeUpload={beforeUpload}
              fileList={fileList}
              onChange={({ fileList }) => setFileList(fileList)}
              accept=".shp,.tif,.tiff"
              maxCount={1}
            >
              <Button icon={<UploadOutlined />}>Выбрать файл</Button>
              <div style={{ marginTop: 8 }}>
                Поддерживаемые форматы: GeoTIFF (.tif, .tiff) или Shapefile (.shp)
                <br />
                Максимальный размер: 50GB
              </div>
            </Upload>
          </Form.Item>

          {uploadProgress > 0 && (
            <Progress percent={uploadProgress} status="active" />
          )}
        </Form>
      </Modal>
    </Card>
  );
};

export default MapUpload;