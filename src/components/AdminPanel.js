import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, InputNumber, message, Modal, Tabs, Tag, Space, Switch } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { getSettings, updateSettings, setPassword, manualCrawl, getKeywords, addKeyword, removeKeyword, updatePassword } from '../services/api';

const { TabPane } = Tabs;

const AdminPanel = () => {
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [isFirstLogin, setIsFirstLogin] = useState(true);
  const [isPasswordSet, setIsPasswordSet] = useState(false);
  const [password, setPasswordState] = useState('');
  const [keywords, setKeywords] = useState({});
  const [newKeyword, setNewKeyword] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('llm');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    checkPasswordStatus();
    fetchKeywords();
  }, []);

  const checkPasswordStatus = async () => {
    try {
      const settings = await getSettings('');
      setIsFirstLogin(false);
      setIsPasswordSet(true);
    } catch (error) {
      if (error.response?.status === 401) {
        setIsFirstLogin(false);
        setIsPasswordSet(true);
      } else if (error.response?.data?.message === '需要先设置密码') {
        setIsFirstLogin(true);
        setIsPasswordSet(false);
      }
    }
  };

  const fetchSettings = async () => {
    try {
      console.log('尝试验证密码:', form.getFieldValue('password'));
      const settings = await getSettings(form.getFieldValue('password'));
      form.setFieldsValue(settings);
      return true;
    } catch (error) {
      console.error('验证失败:', error.response?.data);
      if (error.response?.status === 401) {
        message.error(error.response.data.message || '密码错误');
        setPasswordState('');
        form.setFieldsValue({ password: '' });
      } else {
        message.error('获取设置失败');
      }
      return false;
    }
  };

  const handleSubmit = async (values) => {
    try {
      setLoading(true);
      if (isFirstLogin) {
        // 首次设置密码
        await setPassword(values.password);
        setPasswordState(values.password);
        setIsFirstLogin(false);
        setIsPasswordSet(true);
        message.success('密码设置成功');
        await fetchSettings();
      } else if (!password) {
        // 验证密码
        const success = await fetchSettings();
        if (success) {
          setPasswordState(values.password);
        }
      } else {
        // 更新设置
        await updateSettings({
          ...values,
          password
        });
        message.success('设置更新成功');
      }
    } catch (error) {
      console.error('Error:', error);
      if (error.response?.status === 401) {
        message.error('密码错误');
        setPasswordState('');
        form.setFieldsValue({ password: '' });
      } else {
        message.error(error.response?.data?.message || '操作失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleManualCrawl = async () => {
    try {
      setLoading(true);
      await manualCrawl(password);
      message.success('抓取任务已执行');
    } catch (error) {
      if (error.response?.status === 401) {
        message.error('密码错误，请重新登录');
        setPasswordState('');
        form.setFieldsValue({ password: '' });
      } else {
        message.error('抓取失败');
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchKeywords = async () => {
    try {
      const data = await getKeywords();
      setKeywords(data);
    } catch (error) {
      message.error('获取关键词失败');
    }
  };

  const handleAddKeyword = async () => {
    if (!newKeyword.trim()) {
      message.warning('请输入关键词');
      return;
    }
    try {
      await addKeyword(selectedCategory, newKeyword.trim(), password);
      message.success('添加成功');
      setNewKeyword('');
      fetchKeywords();
    } catch (error) {
      message.error('添加失败');
    }
  };

  const handleRemoveKeyword = async (category, keyword) => {
    try {
      await removeKeyword(category, keyword, password);
      message.success('删除成功');
      fetchKeywords();
    } catch (error) {
      message.error('删除失败');
    }
  };

  const renderKeywordsManager = () => (
    <div>
      <Tabs activeKey={selectedCategory} onChange={setSelectedCategory}>
        {Object.keys(keywords).map(category => (
          <TabPane tab={category.toUpperCase()} key={category}>
            <div style={{ marginBottom: 16 }}>
              <Space>
                <Input
                  placeholder="输入新关键词"
                  value={newKeyword}
                  onChange={e => setNewKeyword(e.target.value)}
                  style={{ width: 200 }}
                  onPressEnter={handleAddKeyword}
                />
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAddKeyword}>
                  添加
                </Button>
              </Space>
            </div>
            <div>
              {keywords[category]?.map(keyword => (
                <Tag
                  key={keyword}
                  closable
                  onClose={() => handleRemoveKeyword(category, keyword)}
                  style={{ margin: '4px' }}
                >
                  {keyword}
                </Tag>
              ))}
            </div>
          </TabPane>
        ))}
      </Tabs>
    </div>
  );

  const handleChangePassword = async () => {
    try {
      if (!newPassword.trim()) {
        message.warning('请输入新密码');
        return;
      }
      await updatePassword(password, newPassword.trim());
      message.success('密码修改成功');
      setShowChangePassword(false);
      setNewPassword('');
      // 更新当前密码
      setPasswordState(newPassword.trim());
    } catch (error) {
      message.error('修改密码失败');
    }
  };

  return (
    <Card title="管理面板" style={{ marginBottom: 24 }}>
      <Tabs>
        <TabPane tab="基本设置" key="settings">
          <Form
            form={form}
            onFinish={handleSubmit}
            layout="vertical"
          >
            {isFirstLogin ? (
              <Form.Item
                name="password"
                label="设置管理密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password />
              </Form.Item>
            ) : !password ? (
              <Form.Item
                name="password"
                label="请输入管理密码"
                rules={[{ required: true, message: '请输入密码' }]}
              >
                <Input.Password />
              </Form.Item>
            ) : (
              <>
                <Form.Item>
                  <Button onClick={() => setShowChangePassword(true)}>
                    修改密码
                  </Button>
                </Form.Item>
                <Form.Item
                  name="crawlInterval"
                  label="抓取间隔（分钟）"
                  rules={[{ required: true, message: '请输入抓取间隔' }]}
                >
                  <InputNumber min={1} max={1440} />
                </Form.Item>
                <Form.Item
                  name="preArticlesPerSource"
                  label="每个源预抓取的文章数量"
                  rules={[{ required: true, message: '请输入预抓取' }]}
                  tooltip="从每个 RSS 源获取的文章数量，这些文章将提供给 AI 进行筛选"
                >
                  <InputNumber min={1} max={50} />
                </Form.Item>
                <Form.Item
                  name="finalArticlesCount"
                  label="最终保存的文章数量"
                  rules={[{ required: true, message: '请输入最终文章数量' }]}
                  tooltip="AI 从所有预抓取的文章中筛选出的最终文章数量"
                >
                  <InputNumber min={1} max={10} />
                </Form.Item>
                <Form.Item
                  name="autoCrawl"
                  label="自动抓取"
                  valuePropName="checked"
                  tooltip="开启后将按设定的时间间隔自动抓取文章"
                >
                  <Switch />
                </Form.Item>
              </>
            )}
            <Form.Item>
              <Button type="primary" htmlType="submit" loading={loading}>
                {isFirstLogin ? '设置密码' : !password ? '验证密码' : '更新设置'}
              </Button>
              {password && (
                <Button 
                  onClick={handleManualCrawl} 
                  loading={loading}
                  style={{ marginLeft: 8 }}
                >
                  手动抓取
                </Button>
              )}
            </Form.Item>
          </Form>
        </TabPane>
        {password && (
          <TabPane tab="关键词管理" key="keywords">
            {renderKeywordsManager()}
          </TabPane>
        )}
      </Tabs>

      <Modal
        title="修改密码"
        open={showChangePassword}
        onOk={handleChangePassword}
        onCancel={() => {
          setShowChangePassword(false);
          setNewPassword('');
        }}
      >
        <Input.Password
          placeholder="请输入新密码"
          value={newPassword}
          onChange={e => setNewPassword(e.target.value)}
        />
      </Modal>
    </Card>
  );
};

export default AdminPanel; 