import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? '/api'  // 生产环境使用相对路径
  : 'http://localhost:4000/api';  // 开发环境使用本地地址

export const getArticles = async ({ page = 1, pageSize = 10 } = {}) => {
  const response = await axios.get(`${API_URL}/articles`, {
    params: { page, pageSize }
  });
  return response.data;
};

export const likeArticle = async (articleId) => {
  const response = await axios.post(`${API_URL}/articles/${articleId}/like`);
  return response.data;
};

export const saveArticle = async (articleId) => {
  const response = await axios.post(`${API_URL}/articles/${articleId}/save`);
  return response.data;
};

// 添加管理相关的 API
export const getSettings = async (password) => {
  const response = await axios.post(`${API_URL}/admin/settings/check`, { password });
  return response.data;
};

export const updateSettings = async (data) => {
  const response = await axios.post(`${API_URL}/admin/settings`, data);
  return response.data;
};

export const setPassword = async (password) => {
  const response = await axios.post(`${API_URL}/admin/password`, { password });
  return response.data;
};

export const manualCrawl = async (password) => {
  const response = await axios.post(`${API_URL}/admin/crawl`, { password });
  return response.data;
};

// 获取所有关键词
export const getKeywords = async () => {
  const response = await axios.get(`${API_URL}/admin/keywords`);
  return response.data;
};

// 添加关键词
export const addKeyword = async (category, keyword, password) => {
  const response = await axios.post(`${API_URL}/admin/keywords`, { 
    category, 
    keyword,
    password 
  });
  return response.data;
};

// 删除关键词
export const removeKeyword = async (category, keyword, password) => {
  const response = await axios.delete(`${API_URL}/admin/keywords`, { 
    data: { 
      category, 
      keyword,
      password 
    } 
  });
  return response.data;
};

// 修改密码
export const updatePassword = async (oldPassword, newPassword) => {
  const response = await axios.put(`${API_URL}/admin/password`, {
    oldPassword,
    newPassword
  });
  return response.data;
};

// 获取文章总数
export const getArticleCount = async () => {
  const response = await axios.get(`${API_URL}/articles/count`);
  return response.data;
};