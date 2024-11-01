const { getSettings, updateSettings, manualCrawl, verifyPassword } = require('../../utils/api.js');

Page({
  data: {
    isVerified: false,
    password: '',
    activeTab: 'basic',
    settings: {
      crawlInterval: 60,
      preArticlesPerSource: 10,
      finalArticlesCount: 5,
      autoCrawl: false
    },
    categories: ['LLM', 'RAG', 'TRAINING', 'APPLICATIONS', 'TOOLS', 'COMPANIES'],
    currentCategory: 'LLM',
    currentKeywords: [],
    newKeyword: ''
  },

  onLoad() {
    console.log('管理页面加载');
  },

  handlePasswordInput(e) {
    this.setData({ password: e.detail.value });
  },

  async handleVerify() {
    try {
      await verifyPassword(this.data.password);
      this.setData({ isVerified: true });
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
      console.log('开始加载设置');
      const settings = await getSettings();
      console.log('获取到设置:', settings);
      
      this.setData({ 
        settings,
        currentKeywords: settings.keywords?.get(this.data.currentCategory) || []
      });
    } catch (error) {
      console.error('加载设置失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
    }
  },

  switchTab(e) {
    const { tab } = e.currentTarget.dataset;
    this.setData({ activeTab: tab });
  },

  async handleSubmit(e) {
    const formData = e.detail.value;
    try {
      await updateSettings(formData);
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
      await manualCrawl();
      wx.showToast({
        title: '抓取成功',
        icon: 'success'
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '抓取失败',
        icon: 'none'
      });
    }
  },

  selectCategory(e) {
    const { category } = e.currentTarget.dataset;
    this.setData({
      currentCategory: category,
      currentKeywords: this.data.settings.keywords?.get(category) || []
    });
  },

  handleKeywordInput(e) {
    this.setData({ newKeyword: e.detail.value });
  },

  async addKeyword() {
    const { currentCategory, newKeyword, settings } = this.data;
    if (!newKeyword.trim()) return;

    try {
      const keywords = settings.keywords?.get(currentCategory) || [];
      if (!keywords.includes(newKeyword)) {
        keywords.push(newKeyword);
        settings.keywords.set(currentCategory, keywords);
        await updateSettings(settings);
        this.setData({
          settings,
          currentKeywords: keywords,
          newKeyword: ''
        });
      }
    } catch (error) {
      wx.showToast({
        title: error.message || '添加失败',
        icon: 'none'
      });
    }
  },

  async removeKeyword(e) {
    const { keyword } = e.currentTarget.dataset;
    const { currentCategory, settings } = this.data;

    try {
      const keywords = settings.keywords?.get(currentCategory) || [];
      const newKeywords = keywords.filter(k => k !== keyword);
      settings.keywords.set(currentCategory, newKeywords);
      await updateSettings(settings);
      this.setData({
        settings,
        currentKeywords: newKeywords
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '删除失败',
        icon: 'none'
      });
    }
  }
}); 