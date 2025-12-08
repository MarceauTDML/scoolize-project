const API_URL = 'http://localhost:5000/api';

const getHeaders = () => {
  const headers = {
    'Content-Type': 'application/json',
  };
  const token = localStorage.getItem('token');
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  return headers;
};

const request = async (endpoint, method = 'GET', body = null) => {
  const config = {
    method,
    headers: getHeaders(),
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(`${API_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Une erreur est survenue');
    }

    return data;
  } catch (error) {
    throw error;
  }
};

export const login = (credentials) => {
  return request('/auth/login', 'POST', credentials);
};

export const register = (userData) => {
  return request('/auth/register', 'POST', userData);
};

export const getSchools = () => {
  return request('/schools', 'GET');
};