import React, { useState, useEffect } from 'react';
import { Card, Form, Input, Button, Avatar, message, Divider, Tag, Row, Col, Descriptions, Badge } from 'antd';
import { UserOutlined, EditOutlined, CrownOutlined, PhoneOutlined, MailOutlined, IdcardOutlined, SafetyCertificateOutlined, SafetyOutlined } from '@ant-design/icons';
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
            real_name: user.real_name || '',
            phone: user.phone || '',
            email: user.email || '',
            id_card: user.id_card || ''
        });
        setEditing(true);
    };

    const handleUpdate = async (values) => {
        try {
            await api.put(`/user/${user.user_id}`, values);
            message.success('更新成功');
            setEditing(false);
            const updatedUser = { ...user, ...values };
            if (values.id_card) {
                updatedUser.is_verified = true;
            }
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

    const maskIDCard = (idCard) => {
        if (!idCard) return '-';
        if (idCard.length >= 14) {
            return idCard.substring(0, 6) + '********' + idCard.substring(14);
        }
        return idCard;
    };

    if (!user) return null;

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 24px'
        }}>
            <div style={{ maxWidth: 800, margin: '0 auto' }}>
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
                        <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                            {user.is_vip ? (
                                <Tag color="gold" icon={<CrownOutlined />}>VIP会员</Tag>
                            ) : (
                                <Tag>普通会员</Tag>
                            )}
                            {user.is_verified ? (
                                <Tag color="success" icon={<SafetyCertificateOutlined />}>已实名</Tag>
                            ) : (
                                <Tag color="warning" icon={<SafetyOutlined />}>未实名</Tag>
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
                                <Row gutter={16}>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="real_name" label="真实姓名">
                                            <Input prefix={<UserOutlined />} placeholder="请输入真实姓名" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="phone" label="手机号码" rules={[
                                            { required: false },
                                            { pattern: /^$|^1[3-9]\d{9}$/, message: '请输入正确的手机号' }
                                        ]}>
                                            <Input prefix={<PhoneOutlined />} placeholder="请输入手机号码" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="email" label="电子邮箱" rules={[
                                            { required: false },
                                            { type: 'email', message: '请输入正确的邮箱地址', transform: (value) => value || '' }
                                        ]}>
                                            <Input prefix={<MailOutlined />} placeholder="请输入电子邮箱" />
                                        </Form.Item>
                                    </Col>
                                    <Col xs={24} sm={12}>
                                        <Form.Item name="id_card" label="身份证号" rules={[
                                            { required: false },
                                            { pattern: /^$|^\d{17}(\d|X|x)$/, message: '请输入正确的18位身份证号' }
                                        ]}>
                                            <Input prefix={<IdcardOutlined />} placeholder="请输入身份证号（实名认证）" maxLength={18} />
                                        </Form.Item>
                                    </Col>
                                </Row>
                                <Form.Item>
                                    <Button type="primary" htmlType="submit" style={{ marginRight: 8 }}>
                                        保存
                                    </Button>
                                    <Button onClick={() => setEditing(false)}>取消</Button>
                                </Form.Item>
                            </Form>
                        ) : (
                            <div>
                                <Descriptions column={{ xs: 1, sm: 2 }} bordered size="small">
                                    <Descriptions.Item label={<><UserOutlined style={{ marginRight: 8 }} />用户名</>}>
                                        {user.username}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><UserOutlined style={{ marginRight: 8 }} />真实姓名</>}>
                                        {user.real_name || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><PhoneOutlined style={{ marginRight: 8 }} />手机号码</>}>
                                        {user.phone || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><MailOutlined style={{ marginRight: 8 }} />电子邮箱</>}>
                                        {user.email || '-'}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><IdcardOutlined style={{ marginRight: 8 }} />身份证号</>}>
                                        {maskIDCard(user.id_card)}
                                    </Descriptions.Item>
                                    <Descriptions.Item label={<><SafetyCertificateOutlined style={{ marginRight: 8 }} />实名认证</>}>
                                        <Badge 
                                            status={user.is_verified ? 'success' : 'warning'} 
                                            text={user.is_verified ? '已认证' : '未认证'} 
                                        />
                                    </Descriptions.Item>
                                    <Descriptions.Item label="会员等级">
                                        {user.is_vip ? (
                                            <Tag color="gold" icon={<CrownOutlined />}>VIP会员</Tag>
                                        ) : (
                                            <Tag>普通会员</Tag>
                                        )}
                                    </Descriptions.Item>
                                    <Descriptions.Item label="账户积分">
                                        <span style={{ color: '#1890ff', fontWeight: 600 }}>{user.points || 0}</span>
                                    </Descriptions.Item>
                                </Descriptions>
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
