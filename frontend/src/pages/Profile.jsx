import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, message, Divider, Tag } from 'antd';
import { UserOutlined, EditOutlined, CrownOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const Profile = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [form] = Form.useForm();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchUserInfo(parsed.user_id);
    }, [navigate]);

    const fetchUserInfo = async (userId) => {
        try {
            const res = await api.get(`/user/${userId}`);
            if (res.data) {
                setUser(res.data);
            }
        } catch (error) {
            console.error('获取用户信息失败', error);
        }
    };

    const handleEdit = () => {
        form.setFieldsValue({
            real_name: user.real_name || ''
        });
        setEditing(true);
    };

    const handleUpdate = async (values) => {
        try {
            await api.put(`/user/${user.user_id}`, values);
            message.success('更新成功');
            setEditing(false);
            const updatedUser = { ...user, ...values };
            setUser(updatedUser);
            localStorage.setItem('user', JSON.stringify(updatedUser));
        } catch (error) {
            message.error('更新失败');
        }
    };

    const getAvatarContent = () => {
        if (!user || !user.username) return <UserOutlined />;
        return user.username.charAt(0).toUpperCase();
    };

    if (!user) return null;

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 24px'
        }}>
            <div style={{ maxWidth: 600, margin: '0 auto' }}>
                <Card style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}>
                    <div style={{ textAlign: 'center', marginBottom: 24 }}>
                        <Avatar 
                            size={80} 
                            style={{ 
                                backgroundColor: '#667eea',
                                fontSize: 36,
                                fontWeight: 600
                            }}
                        >
                            {getAvatarContent()}
                        </Avatar>
                        <h2 style={{ margin: '16px 0 4px', fontSize: 24 }}>{user.username}</h2>
                        <div>
                            {user.is_vip ? (
                                <Tag color="gold" icon={<CrownOutlined />}>VIP会员</Tag>
                            ) : (
                                <Tag>普通会员</Tag>
                            )}
                        </div>
                    </div>

                    <Divider />

                    <div style={{ marginBottom: 24 }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                            <h3 style={{ margin: 0 }}>个人信息</h3>
                            {!editing && (
                                <Button type="link" icon={<EditOutlined />} onClick={handleEdit}>
                                    编辑
                                </Button>
                            )}
                        </div>

                        {editing ? (
                            <Form form={form} onFinish={handleUpdate} layout="vertical">
                                <Form.Item name="real_name" label="真实姓名">
                                    <Input prefix={<UserOutlined />} />
                                </Form.Item>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                        保存
                                    </Button>
                                    <Button onClick={() => setEditing(false)}>取消</Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            <div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: '#666', width: 80, display: 'inline-block' }}>用户名：</span>
                                    <span>{user.username}</span>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: '#666', width: 80, display: 'inline-block' }}>真实姓名：</span>
                                    <span>{user.real_name || '-'}</span>
                                </div>
                                <div style={{ marginBottom: 12 }}>
                                    <span style={{ color: '#666', width: 80, display: 'inline-block' }}>积分：</span>
                                    <span style={{ color: '#1890ff', fontWeight: 600 }}>{user.points || 0}</span>
                                </div>
                            </div>
                        )}
                    </div>

                    <Divider />

                    <div style={{ textAlign: 'center' }}>
                        <Button onClick={() => navigate('/')}>返回首页</Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default Profile;
