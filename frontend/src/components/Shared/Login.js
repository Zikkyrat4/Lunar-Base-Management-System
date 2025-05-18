import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import api from '../../api/axios';
import { loginSuccess, loginFailure } from '../../store/authSlice';
import { message } from 'antd';

// Импортируем стили
import styles from './login_module.css';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setCredentials({
      ...credentials,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await api.post(
        '/auth/login',
        new URLSearchParams({
          username: credentials.username,
          password: credentials.password
        }),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        }
      );

      dispatch(loginSuccess({
        user: { username: credentials.username },
        token: response.data.access_token
      }));
      navigate('/');
    } catch (error) {
      dispatch(loginFailure(error.response?.data?.detail || 'Ошибка входа'));
      message.error('Неверные учетные данные');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.stars}></div>
      <Container className={styles.loginWrapper}>
        <Box className={styles.card}>
          <Typography component="h1" variant="h5" className={styles.title}>
            Вход в систему
          </Typography>
          <form onSubmit={handleSubmit}>
            <TextField
              className={styles.textField}
              margin="normal"
              required
              fullWidth
              label="Имя пользователя"
              name="username"
              value={credentials.username}
              onChange={handleChange}
              autoComplete="username"
              autoFocus
              disabled={loading}
              InputLabelProps={{
                style: { color: '#ccc' },
              }}
            />
            <TextField
              className={styles.textField}
              margin="normal"
              required
              fullWidth
              name="password"
              label="Пароль"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              autoComplete="current-password"
              disabled={loading}
              InputLabelProps={{
                style: { color: '#ccc' },
              }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              className={styles.button}
              disabled={loading}
            >
              {loading ? 'Подключение...' : 'Войти'}
            </Button>
          </form>
        </Box>
      </Container>
    </div>
  );
};

export default Login;