// src/components/Profile/Profile.js
import React from 'react';
import { Card, Descriptions, Typography } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const { Title } = Typography;

const Profile = () => {
  // Пример данных пользователя (в реальном приложении получаем из store/API)
  const userData = {
    name: "Алексей Петров",
    birthDate: "15.03.1985",
    position: "Командир миссии",
    organization: "Роскосмос",
    specialization: "Геология"
  };

  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>
        <UserOutlined /> Профиль
      </Title>
      <Card>
        <Descriptions bordered column={1}>
          <Descriptions.Item label="ФИО">{userData.name}</Descriptions.Item>
          <Descriptions.Item label="Дата рождения">{userData.birthDate}</Descriptions.Item>
          <Descriptions.Item label="Должность">{userData.position}</Descriptions.Item>
          <Descriptions.Item label="Организация">{userData.organization}</Descriptions.Item>
          <Descriptions.Item label="Специализация">{userData.specialization}</Descriptions.Item>
        </Descriptions>
      </Card>
    </div>
  );
};

export default Profile;