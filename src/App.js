import React, { useState } from 'react';
import ArticleList from './components/ArticleList';
import AdminPanel from './components/AdminPanel';
import { Layout, Button, Modal } from 'antd';
import { SettingOutlined } from '@ant-design/icons';

const { Header, Content } = Layout;

function App() {
  const [showAdmin, setShowAdmin] = useState(false);

  return (
    <Layout>
      <Header style={{ 
        color: 'white', 
        fontSize: '20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <span>AI 新闻聚合</span>
        <Button 
          type="text" 
          icon={<SettingOutlined />} 
          style={{ color: 'white' }}
          onClick={() => setShowAdmin(true)}
        />
      </Header>
      <Content style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        <Modal
          title="管理面板"
          open={showAdmin}
          onCancel={() => setShowAdmin(false)}
          footer={null}
          width={600}
        >
          <AdminPanel />
        </Modal>
        <ArticleList />
      </Content>
    </Layout>
  );
}

export default App;
