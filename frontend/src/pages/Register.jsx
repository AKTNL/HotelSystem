import React from "react";
import { Form, Input, Button, message, Card } from 'antd';
import api from '../api';
import { useNavigate } from 'react-router-dom';

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
        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 100 }}>
            <Card title="用户注册" style={{ width: 400 }}>
                <Form onFinish={onFinish} layout="vertical">
                    <Form.Item label="用户名" name="username" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="真实姓名" name="real_name" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item label="密码" name="password" rules={[{ required: true }]}>
                        <Input.Password />
                    </Form.Item>
                    <Button type="primary" htmlType="submit" block>立即注册</Button>
                    <Button type="link" onClick={() => navigate('/login')} block>已有账号？去登录</Button>
                </Form>
            </Card>            
        </div>
    );
};

export default Register;