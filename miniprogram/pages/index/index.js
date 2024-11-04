const { getArticles, likeArticle, getArticleCount } = require('../../utils/api.js');

Page({
  data: {
    articles: [],
    currentPage: 1,
    totalPages: 1,
    totalArticles: 0,
    loading: false,
    categories: {
      'RAG': 'RAG技术',
      'LLM_DEV': '模型开发',
      'LLM_NEWS': '模型新闻',
      'GENERAL_AI': '通用AI'
    },
    totalCount: 0
  },

  onLoad() {
    this.loadArticles();
    this.startAutoRefresh();
  },

  onUnload() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  },

  // 启动定时刷新
  startAutoRefresh() {
    // 每30秒更新一次文章数量
    this.refreshTimer = setInterval(() => {
      this.updateArticleCount();
    }, 30000);
  },

  // 更新文章数量
  async updateArticleCount() {
    try {
      const count = await getArticleCount();
      this.setData({ totalCount: count });
    } catch (error) {
      console.error('更新文章数量失败:', error);
    }
  },

  async loadArticleCount() {
    try {
      const { count } = await getArticleCount();
      this.setData({ totalArticles: count });
    } catch (error) {
      console.error('获取文章总数失败:', error);
    }
  },

  async loadArticles(refresh = false) {
    if (this.data.loading) return;
    
    try {
      this.setData({ loading: true });
      const { articles, totalPages, currentPage } = await getArticles(
        refresh ? 1 : this.data.currentPage
      );
      
      // 处理文章分类显示
      const processedArticles = articles.map(article => ({
        ...article,
        category: this.data.categories[article.category] || article.category,
        publishDate: this.formatDate(article.publishDate)
      }));

      if (refresh) {
        this.setData({
          articles: processedArticles,
          currentPage: 1,
          totalPages
        });
      } else {
        this.setData({
          articles: [...this.data.articles, ...processedArticles],
          currentPage,
          totalPages
        });
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    } finally {
      this.setData({ loading: false });
      // 刷新文章总数
      this.loadArticleCount();
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  async handleLike(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const response = await wx.request({
        url: `${BASE_URL}/articles/${id}/like`,
        method: 'POST'
      });

      if (response.statusCode === 200) {
        // 更新本地数据
        const { articles } = this.data;
        const index = articles.findIndex(a => a._id === id);
        if (index !== -1) {
          articles[index].likes = (articles[index].likes || 0) + 1;
          articles[index].hasLiked = true;
          this.setData({ articles });
        }
      }
    } catch (error) {
      console.error('点赞失败:', error);
    }
  },

  onPullDownRefresh() {
    this.loadArticles(true).then(() => {
      wx.stopPullDownRefresh();
    });
  },

  onReachBottom() {
    if (this.data.currentPage < this.data.totalPages) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadArticles();
      });
    }
  },

  navigateToAdmin() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  },

  onShow() {
    // 页面显示时重新加载数据
    this.loadArticles();
  },

  // 修改文章点击处理方法
  handleArticleClick(e) {
    const { id } = e.currentTarget.dataset;
    this.updateReadCount(id);
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  // 更新文章翻译
  updateArticleTranslation(articleId, translation) {
    console.log('更新文章翻译:', articleId);
    const { articles } = this.data;
    const index = articles.findIndex(a => a._id === articleId);
    
    if (index !== -1) {
      const updatedArticle = {
        ...articles[index],
        translatedTitle: translation.title,
        translatedContent: translation.content,
        isTranslated: true
      };
      
      // 更新数组中的文章
      const newArticles = [...articles];
      newArticles[index] = updatedArticle;
      
      // 更新状态
      this.setData({ articles: newArticles });
      console.log('文章列表已更新');

      // 保存到本地存储
      const key = `article_translation_${articleId}`;
      wx.setStorageSync(key, translation);
      console.log('翻译已保存到本地存储');
    }
  },

  // 保存翻译到本地存储
  saveTranslationToStorage(articleId, translation) {
    try {
      const key = `article_translation_${articleId}`;
      wx.setStorageSync(key, translation);
    } catch (error) {
      console.error('保存翻译到本地存储失败:', error);
    }
  },

  // 从本地存储加载翻译
  loadTranslationsFromStorage(articles) {
    return articles.map(article => {
      try {
        const key = `article_translation_${article._id}`;
        const translation = wx.getStorageSync(key);
        if (translation) {
          console.log('找到缓存的翻译:', article._id);
          return {
            ...article,
            translatedTitle: translation.title,
            translatedContent: translation.content,
            isTranslated: true
          };
        }
      } catch (error) {
        console.error('加载翻译失败:', error);
      }
      return article;
    });
  },

  // 处理摘要显示
  formatSummary(summary) {
    if (!summary) return '';
    
    // 更新正则表达式以匹配所有可能的标题格式
    return summary
      .replace(/#{1,3}(?:\s*#)*\s+/g, '')  // 匹配 ###、# # #、# ## 等所有变体
      .replace(/^\s*#\s+#\s+#\s*/gm, '')   // 匹配每行开头的 # # # 格式
      .trim();
  },

  async loadArticles() {
    try {
      this.setData({ loading: true });
      
      // 同时获取文章列表和总数
      const [articles, count] = await Promise.all([
        getArticles(),
        getArticleCount()
      ]);
      
      this.setData({
        articles,
        totalCount: count,
        loading: false
      });

      wx.stopPullDownRefresh();
    } catch (error) {
      console.error('加载文章失败:', error);
      this.setData({ loading: false });
      wx.stopPullDownRefresh();
    }
  },

  // 处理收藏
  async handleStar(e) {
    const { id } = e.currentTarget.dataset;
    try {
      const response = await wx.request({
        url: `${BASE_URL}/articles/${id}/star`,
        method: 'POST'
      });

      if (response.statusCode === 200) {
        // 更新本地数据
        const { articles } = this.data;
        const index = articles.findIndex(a => a._id === id);
        if (index !== -1) {
          articles[index].stars = (articles[index].stars || 0) + 1;
          articles[index].hasStarred = true;
          this.setData({ articles });
        }
      }
    } catch (error) {
      console.error('收藏失败:', error);
    }
  },

  // 处理分享
  onShareAppMessage(e) {
    if (e.from === 'button') {
      const { id, title } = e.target.dataset;
      return {
        title,
        path: `/pages/detail/detail?id=${id}`
      };
    }
    return {
      title: 'AI 新闻聚合',
      path: '/pages/index/index'
    };
  },

  // 更新阅读数
  async updateReadCount(id) {
    try {
      const response = await wx.request({
        url: `${BASE_URL}/articles/${id}/read`,
        method: 'POST'
      });

      if (response.statusCode === 200) {
        // 更新本地数据
        const { articles } = this.data;
        const index = articles.findIndex(a => a._id === id);
        if (index !== -1) {
          articles[index].reads = (articles[index].reads || 0) + 1;
          this.setData({ articles });
        }
      }
    } catch (error) {
      console.error('更新阅读数失败:', error);
    }
  }
}); 