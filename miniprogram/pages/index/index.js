const { getArticles, likeArticle } = require('../../utils/api.js');

Page({
  data: {
    articles: [],
    currentPage: 1,
    totalPages: 1,
    loading: false
  },

  onLoad() {
    this.loadArticles();
  },

  async onPullDownRefresh() {
    try {
      this.setData({ currentPage: 1 });
      await this.loadArticles();
      wx.stopPullDownRefresh();
    } catch (error) {
      wx.showToast({
        title: error.message || '刷新失败',
        icon: 'none'
      });
      wx.stopPullDownRefresh();
    }
  },

  async loadArticles() {
    try {
      this.setData({ loading: true });
      const { articles, totalPages, currentPage } = await getArticles(this.data.currentPage);
      
      if (this.data.currentPage === 1) {
        this.setData({
          articles,
          totalPages,
          currentPage,
          loading: false
        });
      } else {
        this.setData({
          articles: [...this.data.articles, ...articles],
          totalPages,
          currentPage,
          loading: false
        });
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
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

  onReachBottom() {
    if (this.data.currentPage < this.data.totalPages && !this.data.loading) {
      this.setData({
        currentPage: this.data.currentPage + 1
      }, () => {
        this.loadArticles();
      });
    }
  },

  onShareAppMessage(res) {
    return {
      title: 'AI 新闻聚合',
      path: '/pages/index/index',
      imageUrl: '/images/share.png'
    }
  },

  onShareTimeline() {
    return {
      title: 'AI 新闻聚合',
      query: '',
      imageUrl: '/images/share.png'
    }
  },

  navigateToDetail(e) {
    const { id } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/detail/detail?id=${id}`
    });
  },

  navigateToOriginal(e) {
    const { url } = e.currentTarget.dataset;
    wx.navigateTo({
      url: `/pages/webview/webview?url=${encodeURIComponent(url)}`
    });
  },

  handleCopyLink(e) {
    const { url } = e.currentTarget.dataset;
    wx.setClipboardData({
      data: url,
      success: () => {
        wx.showToast({
          title: '链接已复制',
          icon: 'success'
        });
      }
    });
  },

  navigateToAdmin() {
    wx.navigateTo({
      url: '/pages/settings/settings'
    });
  }
}); 