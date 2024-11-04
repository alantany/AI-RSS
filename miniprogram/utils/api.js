const BASE_URL = 'https://rss.kids-coder.cn/api';

const request = (url, options = {}) => {
  return new Promise((resolve, reject) => {
    wx.request({
      url: `${BASE_URL}${url}`,
      ...options,
      success: (res) => {
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

// 获取文章列表
export const getArticles = async () => {
  try {
    console.log('请求文章列表');
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/articles`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200) {
            console.log('获取到文章数量:', res.data?.length || 0);
            resolve(res.data);
          } else {
            reject(new Error(res.data?.message || '获取文章列表失败'));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });

    return result;
  } catch (error) {
    console.error('获取文章列表失败:', error);
    throw error;
  }
};

// 获取文章详情
export const getArticleDetail = async (id) => {
  try {
    console.log('请求文章详情:', id);
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/articles/${id}`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.message || '获取文章失败'));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });

    console.log('文章详情获取成功，内容长度:', result.content?.length || 0);
    return result;
  } catch (error) {
    console.error('获取文章详情失败:', error);
    throw error;
  }
};

const likeArticle = async (articleId) => {
  return request(`/articles/${articleId}/like`, {
    method: 'POST'
  });
};

// 获取文章总数
export const getArticleCount = async () => {
  try {
    console.log('请求文章数量');
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/articles/count`,
        method: 'GET',
        success: (res) => {
          if (res.statusCode === 200 && res.data?.count !== undefined) {
            console.log('获取到文章总数:', res.data.count);
            resolve(res.data.count);
          } else {
            console.error('获取文章数量响应异常:', res);
            reject(new Error('获取文章数量失败'));
          }
        },
        fail: (error) => {
          console.error('获取文章数量请求失败:', error);
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });

    return result;
  } catch (error) {
    console.error('获取文章数量失败:', error);
    throw error;
  }
};

// 管理员相关接口
const getSettings = async () => {
  return request('/admin/settings', {
    method: 'GET'
  });
};

const updateSettings = async (settings) => {
  return request('/admin/settings', {
    method: 'POST',
    data: settings
  });
};

const manualCrawl = async () => {
  return request('/admin/crawl', {
    method: 'POST'
  });
};

const verifyPassword = async (password) => {
  return request('/admin/password/verify', {
    method: 'POST',
    data: { password }
  });
};

// 翻译文章
export const translateArticle = async (id) => {
  try {
    console.log('请求翻译文章:', id);
    const result = await new Promise((resolve, reject) => {
      wx.request({
        url: `${BASE_URL}/articles/${id}/translate`,
        method: 'POST',
        success: (res) => {
          if (res.statusCode === 200 && res.data) {
            resolve(res.data);
          } else {
            reject(new Error(res.data?.message || '翻译失败'));
          }
        },
        fail: (error) => {
          reject(new Error(error.errMsg || '网络请求失败'));
        }
      });
    });

    return result;
  } catch (error) {
    console.error('翻译文章失败:', error);
    throw error;
  }
};

// 统一导出所有接口
module.exports = {
  getArticles,
  getArticleDetail,
  likeArticle,
  getArticleCount,
  getSettings,
  updateSettings,
  manualCrawl,
  verifyPassword,
  translateArticle
}; 