import React, { useState, useEffect } from 'react';
import { List, Card, Button, message, Tooltip, Tag, Typography, Statistic, Pagination } from 'antd';
import { LikeOutlined, StarOutlined, LinkOutlined, LoadingOutlined } from '@ant-design/icons';
import { getArticles, likeArticle, getArticleCount } from '../services/api';

const { Paragraph, Link, Text } = Typography;

const ArticleList = () => {
  const [articles, setArticles] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles(currentPage);
    fetchArticleCount();
  }, [currentPage]);

  const fetchArticles = async (page) => {
    try {
      setLoading(true);
      const response = await getArticles({ page, pageSize });
      setArticles(response.articles || []);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('获取文章失败:', error);
      message.error('获取文章失败');
    } finally {
      setLoading(false);
    }
  };

  const fetchArticleCount = async () => {
    try {
      const { count } = await getArticleCount();
      setTotalCount(count);
    } catch (error) {
      console.error('获取文章总数失败:', error);
    }
  };

  const handlePageChange = (page) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);  // 回到顶部
  };

  const handleLike = async (articleId) => {
    try {
      await likeArticle(articleId);
      message.success('点赞成功');
      fetchArticles();
    } catch (error) {
      message.error('点赞失败');
    }
  };

  return (
    <>
      <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Statistic title="文章总数" value={totalCount} />
        <Text type="secondary">
          第 {currentPage} 页 / 共 {totalPages} 页
        </Text>
      </div>
      <List
        loading={loading}
        grid={{ gutter: 16, column: 1 }}
        dataSource={articles}
        renderItem={article => (
          <List.Item>
            <Card
              title={
                <div style={{ marginBottom: '12px' }}>
                  <Link 
                    href={article.url} 
                    target="_blank"
                    style={{ 
                      fontSize: '20px',
                      fontWeight: 'bold',
                      color: '#1a1a1a',
                      marginRight: '8px'
                    }}
                  >
                    {article.title}
                  </Link>
                  <Tag color="blue">{article.source}</Tag>
                </div>
              }
              actions={[
                <Button icon={<LikeOutlined />} onClick={() => handleLike(article.id)}>
                  {article.likes}
                </Button>,
                <Button icon={<StarOutlined />}>收藏</Button>,
                <Button 
                  icon={<LinkOutlined />} 
                  onClick={() => window.open(article.url, '_blank')}
                >
                  原文
                </Button>
              ]}
              style={{ 
                borderRadius: '8px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
              }}
            >
              <Paragraph 
                style={{ 
                  fontSize: '16px',
                  lineHeight: '1.8',
                  color: '#333',
                  margin: '16px 0'
                }}
              >
                {article.content}
              </Paragraph>
              <div style={{ 
                borderTop: '1px solid #f0f0f0',
                paddingTop: '12px',
                marginTop: '12px'
              }}>
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  发布时间：{new Date(article.publishDate).toLocaleString()}
                </Text>
                <br />
                <Text type="secondary" style={{ fontSize: '14px' }}>
                  转载声明：本文转载自 {article.source}，
                  <Link href={article.url} target="_blank">查看原文</Link>
                </Text>
              </div>
            </Card>
          </List.Item>
        )}
        style={{ 
          padding: '24px 0'
        }}
      />
      <div style={{ textAlign: 'center', marginTop: 24 }}>
        <Pagination
          current={currentPage}
          total={totalCount}
          pageSize={pageSize}
          onChange={handlePageChange}
          showSizeChanger={false}
          showQuickJumper
          showTotal={(total, range) => `${range[0]}-${range[1]} / ${total} 篇文章`}
        />
      </div>
    </>
  );
};

export default ArticleList; 