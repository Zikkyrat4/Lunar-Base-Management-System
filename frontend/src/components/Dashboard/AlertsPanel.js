/* eslint-disable no-unused-vars */
import React, { useState, useRef, useEffect } from 'react';
import {
  WarningOutlined,
  InfoOutlined,
  CloseOutlined,
  BellOutlined,
  CaretDownOutlined
} from '@ant-design/icons';
import { CSSTransition } from 'react-transition-group';

import './../../styles/main.css';
import './AlertsPanel.css';

const AlertsPanel = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [alerts, setAlerts] = useState([
    {
      id: 1,
      type: 'warning',
      title: 'Низкий уровень кислорода',
      description: 'Критически низкий уровень (30%). Необходимо пополнить запасы.',
      time: '2 мин назад'
    },
    {
      id: 2,
      type: 'info',
      title: 'Запланировано ТО',
      description: 'Техническое обслуживание запланировано на 15:00 по лунному времени',
      time: '1 час назад'
    },
    {
      id: 3,
      type: 'critical',
      title: 'Сбой системы',
      description: 'Обнаружена неисправность в модуле жизнеобеспечения. Требуется немедленное вмешательство.',
      time: '5 мин назад'
    }
  ]);

  const panelRef = useRef(null);

  const handleTogglePanel = () => {
    setIsOpen(!isOpen);
  };

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const handleCloseAlert = (id, e) => {
    e.stopPropagation();
    setAlerts(prev => prev.filter(alert => alert.id !== id));
  };

  const getIcon = (type) => {
    const icons = {
      warning: <WarningOutlined className="alert-icon warning" />,
      critical: <WarningOutlined className="alert-icon critical" />,
      info: <InfoOutlined className="alert-icon info" />
    };
    return icons[type] || icons.info;
  };

  useEffect(() => {
    if (alerts.length === 0) {
      setIsOpen(false);
    }
  }, [alerts]);

  return (
    <CSSTransition
      in={isOpen}
      nodeRef={panelRef}
      timeout={300}
      classNames="alerts-panel"
      unmountOnExit
      onExited={() => setIsCollapsed(false)}
    >
      <div className="alerts-panel" ref={panelRef}>
        <div className="alert-card">
          <div 
            className="alert-card-header" 
            onClick={handleToggleCollapse}
          >
            <div className="alert-header-content">
              <h3 className="alert-title">
                <BellOutlined />
                СИСТЕМНЫЕ УВЕДОМЛЕНИЯ
              </h3>
              <div className="alert-header-right">
                {alerts.length > 0 && (
                  <span className="alert-count">{alerts.length}</span>
                )}
                <CaretDownOutlined className={`collapse-icon ${isCollapsed ? 'collapsed' : ''}`} />
                <CloseOutlined 
                  className="panel-close-icon" 
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTogglePanel();
                  }} 
                />
              </div>
            </div>
          </div>

          <CSSTransition
            in={!isCollapsed}
            timeout={250}
            classNames="alert-list"
            unmountOnExit
          >
            <div className="alert-list">
              {alerts.map((alert) => (
                <div key={alert.id} className={`alert-item ${alert.type}`}>
                  <div className="alert-message">
                    {getIcon(alert.type)}
                    <div className="alert-details">
                      <div className="alert-header">
                        <h4 className="alert-item-title">{alert.title}</h4>
                        <CloseOutlined 
                          className="alert-close" 
                          onClick={(e) => handleCloseAlert(alert.id, e)} 
                        />
                      </div>
                      <p className="alert-description">{alert.description}</p>
                      <p className="alert-time">{alert.time}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CSSTransition>
        </div>
      </div>
    </CSSTransition>
  );
};

export default AlertsPanel;