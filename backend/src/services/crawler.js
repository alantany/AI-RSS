const axios = require('axios');
const Parser = require('rss-parser');
const cron = require('node-cron');
const Article = require('../models/Article');
const OpenAI = require('openai');
const Setting = require('../models/Setting');
const { getAllKeywords } = require('../config/keywords');
const { Op } = require('sequelize');
const cheerio = require('cheerio');

class CrawlerService {
  constructor() {
    this.parser = new Parser({
      customFields: {
        item: [
          ['media:content', 'media'],
          ['description', 'description'],
          ['content:encoded', 'content']
        ]
      }
    });
    
    this.rssSources = [
      {
        // Towards Data Science
        url: 'https://towardsdatascience.com/feed',
        name: 'Towards Data Science'
      },
      {
        // Microsoft AI Blog
        url: 'https://blogs.microsoft.com/ai/feed/',
        name: 'Microsoft AI'
      },
      {
        // TechCrunch AI
        url: 'https://techcrunch.com/category/artificial-intelligence/feed/',
        name: 'TechCrunch'
      },
      {
        // AI News
        url: 'https://www.artificialintelligence-news.com/feed/',
        name: 'AI News'
      },
      {
        // Reddit AI
        url: 'https://www.reddit.com/r/artificial/top/.rss',
        name: 'Reddit AI'
      }
    ];

    // 初始化 OpenAI
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
      baseURL: process.env.BASE_URL
    });

    // 更新默认的 AI 相关图片库为更可靠的图片源
    this.defaultImages = [
      'https://cdn.pixabay.com/photo/2019/04/15/12/09/artificial-intelligence-4129124_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/12/09/14/16/artificial-intelligence-3007410_1280.jpg',
      'https://cdn.pixabay.com/photo/2017/05/10/19/29/robot-2301646_1280.jpg',
      'https://cdn.pixabay.com/photo/2018/05/08/08/50/artificial-intelligence-3382521_1280.jpg',
      'https://cdn.pixabay.com/photo/2019/03/21/15/51/chatbot-4071274_1280.jpg'
    ];
  }

  getRandomDefaultImage() {
    const randomIndex = Math.floor(Math.random() * this.defaultImages.length);
    return this.defaultImages[randomIndex];
  }

  async sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async translateTextWithRetry(text, retries = 3) {
    for (let i = 0; i < retries; i++) {
      try {
        if (!text) return '';
        const limitedText = text.slice(0, 1000);

        const completion = await this.openai.chat.completions.create({
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content: "You are a professional translator. Translate the following English text to Chinese. Keep the translation accurate and natural."
            },
            {
              role: "user",
              content: limitedText
            }
          ],
          temperature: 0.3,
        });

        if (completion.choices[0]?.message?.content) {
          return completion.choices[0].message.content.trim();
        }
        throw new Error('Translation failed');
      } catch (error) {
        console.error(`Translation attempt ${i + 1} failed:`, error);
        if (i < retries - 1) {
          const delay = (i + 1) * 5000;
          console.log(`Waiting ${delay}ms before retry...`);
          await this.sleep(delay);
        } else {
          return text;
        }
      }
    }
  }

  async extractImageFromContent(content) {
    try {
      // 从 HTML 内容中提取所有图片的 URL
      const imgMatches = content.match(/<img[^>]+src="([^">]+)"/g);
      if (imgMatches) {
        // 尝试每个图片 URL，直到找到一个可用的
        for (const imgMatch of imgMatches) {
          const urlMatch = imgMatch.match(/src="([^">]+)"/);
          if (urlMatch && urlMatch[1]) {
            const imageUrl = urlMatch[1];
            try {
              // 验证图片 URL 是否可访问
              const response = await axios.head(imageUrl);
              if (response.status === 200 && 
                  response.headers['content-type'] && 
                  response.headers['content-type'].startsWith('image/')) {
                return imageUrl;
              }
            } catch (error) {
              console.log(`图片验证失败: ${imageUrl}`);
            }
          }
        }
      }
      return null;
    } catch (error) {
      console.log('图片提取失败');
      return null;
    }
  }

  async filterArticlesWithAI(articles, prompt, targetCount) {
    try {
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的 AI 技术文章筛选专家，特别擅长识别与 LLM 和 RAG 相关的高质量技术文章。请以 JSON 格式返回结果。"
          },
          {
            role: "user",
            content: `请从以下文章中选择 ${targetCount} 篇最相关的文章，重点关注：
1. 大语言模型（LLM）技术进展和创新
2. RAG（检索增强生成）相关的技术和应用
3. AI 系统架构和工程实践
4. 企业级 LLM 应用案例
5. AI 基础设施和优化方案

请特别注意：
- 优先选择与 LLM 和 RAG 直接相关的文章
- 关注实用性和技术深度
- 避选纯新闻类或营销类文章

文章列表：
${articles.map((a, index) => `
${index}. 标题：${a.title}
来源：${a.source}
描述：${a.description?.slice(0, 200) || ''}
---`).join('\n')}

请返回 JSON 格式的响应，格式如下：
{
  "selected_indices": [0, 1, 2, ...],
  "reasons": [
    "这篇文章详细介绍了最新的 RAG 架构改进...",
    "该文章展示了企业级 LLM 应用的具体实践...",
    ...
  ]
}`
          }
        ],
        temperature: 0.3,
        response_format: { type: "json_object" }
      });

      const result = JSON.parse(completion.choices[0].message.content);
      console.log('AI 筛选结果:', result);

      return {
        selectedArticles: result.selected_indices.map(index => articles[index]),
        reasons: result.reasons
      };
    } catch (error) {
      console.error('AI 筛选失败:', error);
      return {
        selectedArticles: articles.slice(0, targetCount),
        reasons: Array(targetCount).fill('AI 筛选失败，按顺序选择')
      };
    }
  }

  async fetchHuggingFaceContent(url) {
    try {
      console.log('正在获取 Hugging Face 文章内容:', url);
      const response = await axios.get(url);
      const $ = cheerio.load(response.data);
      
      // 尝试不同的选择器来获取文章内容
      let paragraphs = $('.prose p').toArray()  // 新版博客布局
                      || $('.article-content p').toArray() // 旧版博客布局
                      || $('article p').toArray();
      
      // 跳过第一段（通常是元信息），从第二段开始
      if (paragraphs.length > 1) {
        paragraphs = paragraphs.slice(1);
      }
      
      // 将所有段落合并为一个字符串
      const content = paragraphs
        .map(p => $(p).text().trim())
        .filter(text => text.length > 0)  // 过滤掉空段落
        .join('\n\n');

      console.log(`获取到内容长度: ${content?.length || 0} 字符`);
      return content || '无法获取文章内容';
    } catch (error) {
      console.error('获取 Hugging Face 文章内容失败:', error);
      return '获取文章内容失败';
    }
  }

  async generateSummary(title, content) {
    try {
      console.log('使用 AI 生成文章概括...');
      const completion = await this.openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: "你是一个专业的技术文章编辑，擅长用简洁的语言总结技术文章的核心内容。"
          },
          {
            role: "user",
            content: `请用中文简要总结这篇技术文章的主要内容（300字以内）：

标题：${title}

内容：${content}`
          }
        ],
        temperature: 0.3,
      });

      const summary = completion.choices[0]?.message?.content;
      console.log('生成的概括长度:', summary?.length);
      return summary || '无法生成文章概括';
    } catch (error) {
      console.error('生成概括失败:', error);
      return '生成文章概括失败';
    }
  }

  async fetchArticles() {
    try {
      const setting = await Setting.findOne();
      const preArticlesPerSource = setting?.preArticlesPerSource || 20;
      const finalArticlesCount = setting?.finalArticlesCount || 5;

      console.log('开始抓取文章...');
      let allArticles = [];

      for (const source of this.rssSources) {
        try {
          console.log(`正在从 ${source.name} 抓取...`);
          const feed = await this.parser.parseURL(source.url);
          console.log(`获取到 ${feed.items.length} 篇文章`);
          
          // 添加详细的内容日志
          if (source.name === 'Hugging Face') {
            console.log('Hugging Face 文示例:', {
              title: feed.items[0]?.title,
              description: feed.items[0]?.description,
              content: feed.items[0]?.content,
              'content:encoded': feed.items[0]?.['content:encoded'],
              link: feed.items[0]?.link,
              guid: feed.items[0]?.guid
            });

            // 对 Hugging Face 的文章进行特殊处理
            feed.items = feed.items.map(item => ({
              ...item,
              link: item.guid,  // 使用 guid 作为链接
              description: item.title  // 如果没有描述，使用标题作为描述
            }));
          }

          // 获取已存在的文章 URL
          const existingUrls = new Set((await Article.findAll({
            where: { source: source.name },
            attributes: ['url']
          })).map(article => article.url));

          // 过滤出新文章
          const newArticles = feed.items
            .filter(item => !existingUrls.has(item.link || item.guid))  // 检查 link 或 guid
            .slice(0, preArticlesPerSource)
            .map(item => ({...item, source: source.name}));
          
          console.log(`${source.name} 有 ${newArticles.length} 篇新文章`);
          allArticles = [...allArticles, ...newArticles];
        } catch (error) {
          console.error(`Error fetching from ${source.name}:`, error);
          continue;
        }
      }

      console.log(`共预抓取 ${allArticles.length} 篇文章`);
      
      if (allArticles.length === 0) {
        console.log('没有新文章需要处理');
        return;
      }

      // 使用 AI 筛选文章
      const { selectedArticles, reasons } = await this.filterArticles(allArticles);
      console.log(`AI 筛选出 ${selectedArticles.length} 篇文章`);
      
      // 处理筛选出的文章
      for (let i = 0; i < selectedArticles.length; i++) {
        const article = selectedArticles[i];
        const reason = reasons[i];
        
        try {
          console.log('处理文章详情:', {
            title: article.title,
            link: article.link,
            url: article.url,
            guid: article.guid,
            source: article.source
          });

          // 获取正确的 URL
          const articleUrl = article.link || article.guid;
          if (!articleUrl) {
            console.log('文章缺少 URL，跳过');
            continue;
          }

          let content = article.content || article.description || '';
          let translatedTitle = '';  // 声明变量
          let translatedSummary = ''; // 声明变量
          let cleanContent = '';      // 声明变量

          // 如果是 Hugging Face 的文章，尝试抓取内容
          if (article.source === 'Hugging Face') {
            const fullContent = await this.fetchHuggingFaceContent(articleUrl);
            // 使用 AI 生成中文概括，不需要再翻译
            content = await this.generateSummary(article.title, fullContent);
            translatedTitle = await this.translateTextWithRetry(article.title);
            translatedSummary = content; // 直接使用生成的中文概括
          } else {
            // 其他源的处理
            cleanContent = content.replace(/<[^>]*>/g, '');
            console.log('翻译标题...');
            translatedTitle = await this.translateTextWithRetry(article.title);
            await this.sleep(3000);

            console.log('翻译摘要...');
            const summary = cleanContent.slice(0, 500);
            translatedSummary = await this.translateTextWithRetry(summary);
          }

          console.log('保存到数据库...');
          await Article.create({
            title: translatedTitle,
            originalTitle: article.title,
            content: translatedSummary,
            originalContent: cleanContent || content,
            source: article.source,
            url: articleUrl,
            publishDate: article.pubDate || new Date(),
            tags: reason
          });
          console.log('文章保存成功');
          
          await this.sleep(2000);
        } catch (error) {
          console.error(`处理文章出错:`, error);
        }
      }

      // 更新最后抓取时间
      await Setting.update(
        { lastCrawlTime: new Date() },
        { where: {} }
      );

      console.log('抓取完成');
    } catch (error) {
      console.error('Error in fetchArticles:', error);
    }
  }

  startCronJob() {
    // 动态设置定时任务
    this.stopCronJob(); // 先停止现有的定时任务
    Setting.findOne().then(setting => {
      const interval = setting?.crawlInterval || 240;
      this.cronJob = cron.schedule(`*/${interval} * * * *`, () => {
        this.fetchArticles();
      });
    });
  }

  stopCronJob() {
    if (this.cronJob) {
      this.cronJob.stop();
    }
  }

  async manualFetch() {
    await this.fetchArticles();
  }

  async filterArticles(articles) {
    const setting = await Setting.findOne();
    const finalArticlesCount = setting?.finalArticlesCount || 5;

    // 1. 使用更广泛的关键词列表进行初步筛选
    const keywords = [
      // 大语言模型相关
      'llm', 'gpt', 'language model', 'chatgpt', 'claude', 
      'gemini', 'mistral', 'llama', 'palm', 'ai model',
      
      // RAG 相关
      'rag', 'retrieval', 'vector', 'embedding', 'search',
      'knowledge base', 'document', 'context',
      
      // AI 应用
      'artificial intelligence', 'machine learning', 'deep learning',
      'neural', 'ai', 'ml', 'nlp', 'language',
      
      // 技术词汇
      'train', 'fine-tune', 'prompt', 'inference',
      'model', 'dataset', 'data', 'algorithm'
    ];

    const preFiltered = articles.filter(article => {
      // 转换为小写进行匹配
      const text = (article.title + ' ' + (article.description || '')).toLowerCase();
      // 任何关键词匹配即可
      return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    });

    console.log(`关键词筛选后剩余 ${preFiltered.length} 篇文章`);
    console.log('匹配到的文章标题:', preFiltered.map(a => a.title));

    // 2. 如果关键词筛选后的文章数量已经很少，就不用 GPT 再筛选了
    if (preFiltered.length <= finalArticlesCount) {
      console.log('文章数量较少，跳过 AI 筛选');
      return {
        selectedArticles: preFiltered,
        reasons: preFiltered.map(() => '关键词匹配')
      };
    }

    // 3. 数量较多时才使用 GPT 进一步筛选
    console.log(`使用 AI 进行进一步筛选，目标文章数: ${finalArticlesCount}`);
    const prompt = `请从以下文章中选择 ${finalArticlesCount} 篇最相关的文章...`;
    return this.filterArticlesWithAI(preFiltered, prompt, finalArticlesCount);
  }
}

module.exports = CrawlerService; 