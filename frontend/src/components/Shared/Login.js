import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { TextField, Button, Container, Typography, Box } from '@mui/material';
import api from '../../api/axios';
import { loginSuccess, loginFailure } from '../../store/authSlice';
import { message } from 'antd';

const Login = () => {
  const [credentials, setCredentials] = useState({
    username: '',
    password: ''
  });
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
      dispatch(loginFailure(error.response?.data?.detail || 'Login failed'));
      message.error('Неверные учетные данные');
    }
  };

  return (
    <Container maxWidth="xs">
      <Box sx={{ mt: 8, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <Typography component="h1" variant="h5">
          Вход в систему
        </Typography>
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            label="Имя пользователя"
            name="username"
            value={credentials.username}
            onChange={handleChange}
            autoComplete="username"
            autoFocus
          />
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Пароль"
            type="password"
            value={credentials.password}
            onChange={handleChange}
            autoComplete="current-password"
          />
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{ mt: 3, mb: 2 }}
          >
            Войти
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Login;