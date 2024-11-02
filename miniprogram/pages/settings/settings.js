const { getSettings, updateSettings, manualCrawl, verifyPassword } = require('../../utils/api.js');

Page({
  data: {
    isVerified: false,
    password: '',
    settings: {
      crawlInterval: 60,
      preArticlesPerSource: 10,
      autoCrawl: false,
      keywords: {}
    }
  },

  onLoad() {
    if (wx.getStorageSync('isAdminVerified')) {
      this.setData({ isVerified: true });
      this.loadSettings();
    }
  },

  async handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async handleVerify() {
    try {
      await verifyPassword(this.data.password);
      this.setData({ isVerified: true });
      wx.setStorageSync('isAdminVerified', true);
      this.loadSettings();
    } catch (error) {
      wx.showToast({
        title: error.message || '验证失败',
        icon: 'none'
      });
    }
  },

  async loadSettings() {
    try {
      const settings = await getSettings();
      this.setData({ settings });
    } catch (error) {
      wx.showToast({
        title: error.message || '加载设置失败',
        icon: 'none'
      });
    }
  },

  async handleSettingChange(e) {
    const { field } = e.currentTarget.dataset;
    const value = e.detail.value;
    
    this.setData({
      [`settings.${field}`]: value
    });
  },

  async handleSave() {
    try {
      await updateSettings(this.data.settings);
      wx.showToast({
        title: '保存成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '保存失败',
        icon: 'none'
      });
    }
  },

  async handleManualCrawl() {
    try {
      wx.showLoading({ title: '抓取中...' });
      const result = await manualCrawl();
      wx.hideLoading();
      wx.showToast({
        title: `成功抓取${result.count}篇文章`,
        icon: 'success'
      });
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '抓取失败',
        icon: 'none'
      });
    }
  }
}); 