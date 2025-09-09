import axios from 'axios';

// 从环境变量中获取配置
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:8080';
const TIMEOUT = process.env.REACT_APP_TIMEOUT ? parseInt(process.env.REACT_APP_TIMEOUT) : 30000;

// 创建axios实例
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: TIMEOUT,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器
apiClient.interceptors.request.use(
  (config) => {
    // 可以在这里添加token等认证信息
    // const token = localStorage.getItem('token');
    // if (token) {
    //   config.headers.Authorization = `Bearer ${token}`;
    // }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器
apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    // 统一错误处理
    if (error.response) {
      // 服务器返回了错误状态码
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // 请求发送了但没有收到响应
      console.error('Network Error:', error.request);
    } else {
      // 设置请求时发生了错误
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default apiClient;