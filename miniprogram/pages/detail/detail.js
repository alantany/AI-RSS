const { getArticleDetail } = require('../../utils/api.js');

Page({
  data: {
    article: null,
    loading: true
  },

  onLoad(options) {
    const { id } = options;
    console.log('加载文章，ID:', id);
    this.loadArticle(id);
  },

  async loadArticle(id) {
    try {
      this.setData({ loading: true });
      const article = await getArticleDetail(id);
      console.log('文章加载成功:', article._id);
      console.log('内容长度:', article.content?.length);
      console.log('翻译内容长度:', article.translatedContent?.length);
      
      // 检查内容格式
      const content = article.translatedContent || article.content;
      const formattedContent = this.formatContent(content);
      console.log('格式化后内容长度:', formattedContent.length);

      this.setData({
        article,
        formattedContent,  // 添加到 data 中
        loading: false
      });
    } catch (error) {
      console.error('加载文章失败:', error);
      wx.showToast({
        title: error.message || '加载失败',
        icon: 'none'
      });
      this.setData({ loading: false });
    }
  },

  formatContent(content) {
    if (!content) return '';
    
    try {
      // 更新正则表达式以匹配所有可能的标题格式
      const formattedContent = content
        .split('\n')
        .map(line => {
          // 匹配所有可能的标题格式
          const titleMatch = line.match(/^(?:#{1,3}(?:\s*#)*|#\s+#\s+#)\s*(.*?)$/);
          if (titleMatch) {
            const titleText = titleMatch[1].trim();
            return `<h3 class="section-title">${titleText}</h3>`;
          }
          // 处理普通段落
          const text = line.trim();
          if (text) {
            return `<p>${text}</p>`;
          }
          return '';  // 空行
        })
        .filter(line => line)  // 移除空行
        .join('\n');

      console.log('格式化后的内容示例:', formattedContent.substring(0, 200));
      return formattedContent;
    } catch (error) {
      console.error('格式化内容失败:', error);
      return content;
    }
  }
}); 