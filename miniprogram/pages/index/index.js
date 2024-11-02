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
    }
  },

  onLoad() {
    this.loadArticles();
    this.loadArticleCount();
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
    }
  },

  formatDate(dateString) {
    const date = new Date(dateString);
    return `${date.getMonth() + 1}月${date.getDate()}日`;
  },

  async handleLike(e) {
    const { id } = e.currentTarget.dataset;
    try {
      await likeArticle(id);
      const { articles } = this.data;
      const article = articles.find(a => a._id === id);
      if (article) {
        article.likes = (article.likes || 0) + 1;
        this.setData({ articles });
      }
      wx.showToast({
        title: '点赞成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '点赞失败',
        icon: 'none'
      });
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
  }
}); 