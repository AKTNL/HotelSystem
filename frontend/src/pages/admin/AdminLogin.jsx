import React, { useState } from 'react';
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined, SettingOutlined } from '@ant-design/icons';
import api from '../../api';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const onFinish = async (values) => {
        setLoading(true);
        try {
            if (values.username === 'admin' && values.password === 'admin123') {
                const adminData = { username: 'admin', role: 'admin' };
                localStorage.setItem('admin', JSON.stringify(adminData));
                message.success('登录成功！');
                navigate('/admin');
            } else {
                message.error('用户名或密码错误');
            }
        } catch (error) {
            message.error('登录失败');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)'
        }}>
            <Card 
                style={{ 
                    width: 420,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    border: 'none'
                }}
                styles={{ body: { padding: '40px 40px 30px' } }}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#1890ff',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <SettingOutlined style={{ fontSize: 28, color: '#fff' }} />
                    </div>
                    <h1 style={{ margin: 0, fontSize: 22, fontWeight: 600, color: '#333' }}>管理员登录</h1>
                    <p style={{ margin: '8px 0 0', color: '#999', fontSize: 14 }}>酒店预订系统后台管理</p>
                </div>
                <Form onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item 
                        label={<span style={{ fontWeight: 500, color: '#333' }}>用户名</span>} 
                        name="username" 
                        rules={[{ required: true, message: '请输入用户名' }]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#bbb' }} />} 
                            placeholder="请输入用户名"
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>
                    <Form.Item 
                        label={<span style={{ fontWeight: 500, color: '#333' }}>密码</span>} 
                        name="password" 
                        rules={[{ required: true, message: '请输入密码' }]}
                    >
                        <Input.Password 
                            prefix={<LockOutlined style={{ color: '#bbb' }} />} 
                            placeholder="请输入密码"
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>
                    <Form.Item style={{ marginBottom: 16 }}>
                        <Button 
                            type="primary" 
                            htmlType="submit" 
                            block
                            loading={loading}
                            style={{ 
                                borderRadius: 6,
                                height: 44,
                                fontSize: 16,
                                fontWeight: 500
                            }}
                        >
                            登 录
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center', color: '#999', fontSize: 12 }}>
                        默认账号: admin / admin123
                    </div>
                </Form>
            </Card>
        </div>
    );
};

export default AdminLogin;
