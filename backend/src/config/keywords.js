// AI 相关关键词配置
const keywords = {
  // 大语言模型相关
  llm: [
    'LLM', 'GPT', 'Large Language Model', 'ChatGPT', 'Claude',
    'Gemini', 'Mistral', 'Llama', 'PaLM', 'Anthropic'
  ],
  
  // RAG 相关
  rag: [
    'RAG', 'Retrieval', 'Retrieval-Augmented Generation',
    'Vector Database', 'Embedding', 'Semantic Search',
    'Knowledge Base', 'Document Retrieval'
  ],
  
  // 训练和优化
  training: [
    'Fine-tuning', 'Training', 'Prompt Engineering',
    'Few-shot', 'Zero-shot', 'In-context Learning'
  ],
  
  // 应用场景
  applications: [
    'AI Agent', 'Autonomous Agent', 'AI Assistant',
    'Code Generation', 'Text Generation', 'Content Generation'
  ],
  
  // 开发工具和框架
  tools: [
    'LangChain', 'LlamaIndex', 'Hugging Face',
    'OpenAI API', 'Vector Store', 'Pinecone'
  ],
  
  // 公司和产品
  companies: [
    'OpenAI', 'Anthropic', 'Google AI', 'Microsoft AI',
    'DeepMind', 'Meta AI', 'Stability AI'
  ],
  
  // 技术趋势
  trends: [
    'Multimodal', 'AGI', 'AI Safety', 'AI Alignment',
    'Foundation Model', 'Transformer', 'Attention Mechanism'
  ]
};

// 获取所有关键词的扁平数组
const getAllKeywords = () => {
  return Object.values(keywords).flat();
};

// 根据类别获取关键词
const getKeywordsByCategory = (category) => {
  return keywords[category] || [];
};

// 添加新关键词
const addKeyword = (category, keyword) => {
  if (keywords[category]) {
    if (!keywords[category].includes(keyword)) {
      keywords[category].push(keyword);
    }
  } else {
    keywords[category] = [keyword];
  }
};

// 移除关键词
const removeKeyword = (category, keyword) => {
  if (keywords[category]) {
    keywords[category] = keywords[category].filter(k => k !== keyword);
  }
};

module.exports = {
  keywords,
  getAllKeywords,
  getKeywordsByCategory,
  addKeyword,
  removeKeyword
}; 