const { getArticleDetail, toggleFavorite } = require('../../utils/api.js');

Page({
  data: {
    article: null,
    isFavorite: false,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    this.loadArticle(id);
  },

  async loadArticle(id) {
    try {
      this.setData({ loading: true });
      const article = await getArticleDetail(id);
      const isFavorite = wx.getStorageSync('favorites') || [];
      
      this.setData({
        article,
        isFavorite: isFavorite.includes(id),
        loading: false
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  async handleFavorite() {
    const { article, isFavorite } = this.data;
    try {
      await toggleFavorite(article._id);
      let favorites = wx.getStorageSync('favorites') || [];
      
      if (isFavorite) {
        favorites = favorites.filter(id => id !== article._id);
      } else {
        favorites.push(article._id);
      }
      
      wx.setStorageSync('favorites', favorites);
      this.setData({ isFavorite: !isFavorite });
      
      wx.showToast({
        title: isFavorite ? '取消收藏' : '收藏成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '操作失败',
        icon: 'none'
      });
    }
  },

  onShareAppMessage() {
    const { article } = this.data;
    return {
      title: article.title,
      path: `/pages/detail/detail?id=${article._id}`
    };
  }
}); 