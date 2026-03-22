import React from "react";
import { Form, Input, Button, message, Card } from 'antd';
import { UserOutlined, LockOutlined, IdcardOutlined, HomeOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from "react-router-dom";

const Register = () =>{
    const navigate = useNavigate();

    const onFinish = async (values) =>{
        try{
            const res = await api.post('/register', values);
            message.success('注册成功！');
            navigate('/login');
        }catch(error){
            message.error(error.response?.data?.error || '注册失败');
        }
    };

    return(
        <div className="bubble-bg" style={{
            minHeight: '100vh',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            background: 'linear-gradient(135deg, #e8f5e9 0%, #a5d6a7 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            <div className="bubbles">
                {[...Array(10)].map((_, i) => (
                    <div key={i} className="bubble" style={{
                        left: `${Math.random() * 100}%`,
                        width: `${40 + Math.random() * 60}px`,
                        height: `${40 + Math.random() * 60}px`,
                        animationDuration: `${8 + Math.random() * 12}s`,
                        animationDelay: `${Math.random() * 5}s`
                    }} />
                ))}
            </div>
            <Card 
                style={{ 
                    width: 420,
                    borderRadius: 12,
                    boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
                    border: 'none',
                    zIndex: 1
                }}
                styles={{ body: { padding: '40px 40px 30px' } }}
            >
                <div style={{ textAlign: 'center', marginBottom: 30 }}>
                    <div style={{
                        width: 60,
                        height: 60,
                        borderRadius: '50%',
                        background: '#52c41a',
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        margin: '0 auto 16px'
                    }}>
                        <HomeOutlined style={{ fontSize: 28, color: '#fff' }} />
                    </div>
                    <h1 style={{ 
                        margin: 0, 
                        fontSize: 22, 
                        fontWeight: 600,
                        color: '#333'
                    }}>创建新账号</h1>
                    <p style={{ margin: '8px 0 0', color: '#999', fontSize: 14 }}>加入我们，开启您的旅程</p>
                </div>
                <Form onFinish={onFinish} layout="vertical" size="large">
                    <Form.Item 
                        label={<span style={{ fontWeight: 500, color: '#333' }}>用户名</span>} 
                        name="username" 
                        rules={[
                            { required: true, message: '请输入用户名' },
                            { min: 3, message: '用户名至少3个字符' }
                        ]}
                    >
                        <Input 
                            prefix={<UserOutlined style={{ color: '#bbb' }} />} 
                            placeholder="请输入用户名"
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>
                    <Form.Item 
                        label={<span style={{ fontWeight: 500, color: '#333' }}>真实姓名</span>} 
                        name="real_name" 
                        rules={[{ required: true, message: '请输入真实姓名' }]}
                    >
                        <Input 
                            prefix={<IdcardOutlined style={{ color: '#bbb' }} />} 
                            placeholder="请输入真实姓名"
                            style={{ borderRadius: 6 }}
                        />
                    </Form.Item>
                    <Form.Item 
                        label={<span style={{ fontWeight: 500, color: '#333' }}>密码</span>} 
                        name="password" 
                        rules={[
                            { required: true, message: '请输入密码' },
                            { min: 6, message: '密码至少6个字符' }
                        ]}
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
                            style={{ 
                                borderRadius: 6,
                                height: 44,
                                fontSize: 16,
                                fontWeight: 500,
                                background: '#52c41a',
                                borderColor: '#52c41a'
                            }}
                        >
                            立即注册
                        </Button>
                    </Form.Item>
                    <div style={{ textAlign: 'center' }}>
                        <Button 
                            type="link" 
                            onClick={() => navigate('/login')}
                        >
                            已有账号？立即登录
                        </Button>
                    </div>
                </Form>
            </Card>
            <style>{`
                .bubbles {
                    position: absolute;
                    width: 100%;
                    height: 100%;
                    top: 0;
                    left: 0;
                }
                .bubble {
                    position: absolute;
                    bottom: -100px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    animation: rise linear infinite;
                }
                @keyframes rise {
                    0% {
                        bottom: -100px;
                        transform: translateX(0);
                        opacity: 1;
                    }
                    50% {
                        transform: translateX(100px);
                    }
                    100% {
                        bottom: 110%;
                        transform: translateX(-100px);
                        opacity: 0.3;
                    }
                }
            `}</style>
        </div>
    );
};

export default Register;
