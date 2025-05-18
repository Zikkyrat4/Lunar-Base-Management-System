import React from 'react';
import { CheckCircleOutlined, RocketOutlined } from '@ant-design/icons';
import './../../styles/main.css';
import './profile.css';

const Profile = () => {
  const profileData = {
    name: "Алексей Петров",
    title: "Командир миссии",
    organization: "Роскосмос",
    mission: "Луна-2124",
    status: "Активен",
    stats: {
      missions: 3,
      experience: "8 лет",
      rating: "4.9"
    },
    details: {
      birthDate: "15.03.2085",
      specialization: "Геология",
      location: "Байконур, Казахстан",
      equipment: "Скафандр 'Орлан-МКС'"
    },
    goals: [
      "Исследование лунных пород",
      "Проведение геологических экспериментов",
      "Мониторинг атмосферных условий",
      "Тестирование нового оборудования"
    ]
  };

  return (
    <div className="profile-container">
      {/* Шапка профиля */}
      <div className="profile-card">
        <div className="profile-avatar">
        </div>
        <h1 className="profile-name">{profileData.name}</h1>
        <p className="profile-position">
          <RocketOutlined style={{ marginRight: 8 }} />
          {profileData.title}
        </p>

        <div className="profile-stats">
          <div className="profile-item">
            <span className="profile-label">Миссии</span>
            <span className="profile-value">{profileData.stats.missions}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Опыт</span>
            <span className="profile-value">{profileData.stats.experience}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Рейтинг</span>
            <span className="profile-value">{profileData.stats.rating}</span>
          </div>
        </div>

        <h2>Личная информация</h2>
        <div className="profile-section">
          <div className="profile-item">
            <span className="profile-label"> Дата рождения</span>
            <span className="profile-value">{profileData.details.birthDate}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Специализация</span>
            <span className="profile-value">{profileData.details.specialization}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Местоположение</span>
            <span className="profile-value">{profileData.details.location}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Оборудование</span>
            <span className="profile-value">{profileData.details.equipment}</span>
          </div>
        </div>

        <h2>Текущая миссия</h2>
        <div className="profile-section">
          <div className="profile-item">
            <span className="profile-label">Название</span>
            <span className="profile-value">{profileData.mission}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Статус</span>
            <span className="profile-value">{profileData.status}</span>
          </div>
          <div className="profile-item">
            <span className="profile-label">Организация</span>
            <span className="profile-value">{profileData.organization}</span>
          </div>
        </div>

        <h3 style={{ marginTop: '2rem' }}>
          Цели миссии
        </h3>
        <div className="mission-goals">
          {profileData.goals.map((goal, index) => (
            <div key={index} className="mission-goal-item">
              <CheckCircleOutlined className="mission-goal-icon" />
              {goal}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;