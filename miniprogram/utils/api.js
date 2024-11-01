const BASE_URL = 'https://rss.kids-coder.cn/api';

const request = (url, options = {}) => {
  console.log('请求URL:', `${BASE_URL}${url}`);
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      ...options,
      success: (res) => {
        console.log('API响应:', res);
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(res.data);
        } else {
          reject(new Error(res.data?.message || '请求失败'));
        }
      },
      fail: (error) => {
        console.error('API请求失败:', error);
        reject(error);
      }
    });
  });
};

export const getArticles = async (page = 1, pageSize = 10) => {
  return request('/articles', {
    method: 'GET',
    data: { page, pageSize }
  });
};

export const likeArticle = async (articleId) => {
  return request(`/articles/${articleId}/like`, {
    method: 'POST'
  });
};

export const getArticleCount = async () => {
  return request('/articles/count', {
    method: 'GET'
  });
};

export const getSettings = async () => {
  return request('/admin/settings', {
    method: 'GET'
  });
};

export const updateSettings = async (settings) => {
  return request('/admin/settings', {
    method: 'POST',
    data: settings
  });
};

export const manualCrawl = async () => {
  return request('/admin/crawl', {
    method: 'POST'
  });
};

export const verifyPassword = async (password) => {
  return request('/admin/password/verify', {
    method: 'POST',
    data: { password }
  });
}; 