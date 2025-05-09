import React from 'react';
import './profile.css';

const Profile = () => {
  const userData = {
    name: 'Алексей Петров',
    birthDate: '15.03.1985',
    position: 'Командир миссии',
    organization: 'Россия (Роскосмос)',
    specialization: 'Геология'
  };

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-avatar"></div>
        <div className="profile-name">{userData.name}</div>

        <div className="profile-item">
          <div className="profile-label">дата рождения</div>
          <div className="profile-value">{userData.birthDate}</div>
        </div>
        <div className="profile-item">
          <div className="profile-label">должность</div>
          <div className="profile-value">{userData.position}</div>
        </div>
        <div className="profile-item">
          <div className="profile-label">страна</div>
          <div className="profile-value">{userData.organization}</div>
        </div>
        <div className="profile-item">
          <div className="profile-label">специализация</div>
          <div className="profile-value">{userData.specialization}</div>
        </div>
        <div className="profile-item">
          <div className="profile-label">Цели миссии</div>
        </div>
      </div>
    </div>
  );
};

export default Profile;