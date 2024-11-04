const { getSettings, updateSettings, manualCrawl } = require('../../utils/api.js');

Page({
  data: {
    isVerified: false,
    settings: {
      crawlInterval: 60,
      preArticlesPerSource: 5,
      autoCrawl: false
    },
    supportBio: false
  },

  async onLoad() {
    try {
      const { supportMode } = await wx.checkIsSupportSoterAuthentication();
      const hasBio = supportMode && supportMode.length > 0;
      console.log('生物认证支持情况:', supportMode);
      
      this.setData({ supportBio: hasBio });
      
      if (hasBio) {
        const { isEnrolled } = await wx.checkIsSoterEnrolledInDevice({
          checkAuthMode: supportMode[0]
        });
        console.log('是否已录入生物信息:', isEnrolled);
        
        if (!isEnrolled) {
          wx.showModal({
            title: '提示',
            content: '请先在系统中录入生物信息',
            showCancel: false
          });
          return;
        }
      }
    } catch (error) {
      console.error('检查生物认证支持失败:', error);
      this.setData({ supportBio: false });
    }

    const isVerified = wx.getStorageSync('isAdminVerified');
    if (isVerified) {
      this.setData({ isVerified: true });
      this.loadSettings();
    }
  },

  async handleBioVerify() {
    if (!this.data.supportBio) {
      wx.showToast({
        title: '设备不支持生物认证',
        icon: 'none'
      });
      return;
    }

    try {
      wx.showLoading({ title: '验证中...' });
      
      const { supportMode } = await wx.checkIsSupportSoterAuthentication();
      const { errMsg } = await wx.startSoterAuthentication({
        requestAuthModes: supportMode,
        challenge: 'ai-news-admin',
        authContent: '请验证管理员身份'
      });

      wx.hideLoading();

      if (errMsg.includes('ok')) {
        this.setData({ isVerified: true });
        wx.setStorageSync('isAdminVerified', true);
        this.loadSettings();
        wx.showToast({
          title: '验证成功',
          icon: 'success'
        });
      } else {
        wx.showToast({
          title: '验证失败',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '验证失败',
        icon: 'none'
      });
    }
  },

  async loadSettings() {
    try {
      const settings = await getSettings();
      this.setData({ 
        settings: {
          crawlInterval: settings.crawlInterval || 60,
          preArticlesPerSource: settings.preArticlesPerSource || 5,
          autoCrawl: settings.autoCrawl || false
        }
      });
    } catch (error) {
      wx.showToast({
        title: error.message || '加载设置失败',
        icon: 'none'
      });
    }
  },

  handleSettingChange(e) {
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
      
      if (result.count > 0) {
        wx.showToast({
          title: `成功抓取${result.count}篇文章`,
          icon: 'success',
          duration: 2000
        });
        
        setTimeout(() => {
          const pages = getCurrentPages();
          const indexPage = pages.find(p => p.route === 'pages/index/index');
          
          if (indexPage) {
            indexPage.loadArticles(true);
          } else {
            wx.setStorageSync('needRefresh', true);
            wx.switchTab({
              url: '/pages/index/index'
            });
          }
        }, 1000);
      } else {
        wx.showToast({
          title: '没有新文章',
          icon: 'none'
        });
      }
    } catch (error) {
      wx.hideLoading();
      wx.showToast({
        title: error.message || '抓取失败',
        icon: 'none'
      });
    }
  }
}); 