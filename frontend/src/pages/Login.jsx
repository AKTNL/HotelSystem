import React from "react";
import { Form, Input, Button, message, Card } from 'antd';
import api from '../api';
import { useNavigate } from "react-router-dom";

const Login = () => {
    const navigate = useNavigate();

    const onFinish = async (values) => {
        try{
            const res = await api.post('/login', values);
            message.success('登录成功！');
            localStorage.setItem('user', JSON.stringify(res.data));
            navigate('/');
        }catch(error){
            message.error(error.response?.data?.error || '登录失败');
        }
    };

    return (
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
            <Card title="酒店预订系统 - 登录" style={{ width: 400 }}>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="密码" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>登录</Button>
                    <Button type="link" onClick={() => navigate('/register')} block>没有账号？去注册</Button>
                </Form>
            </Card>
        </div>
    );
};

export default Login;