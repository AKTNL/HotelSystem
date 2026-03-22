import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Empty, Spin, message, Modal, Descriptions } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, HomeOutlined, UserOutlined, ExclamationCircleOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { confirm } = Modal;

const MyOrders = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchOrders(parsed.user_id);
    }, [navigate]);

    const fetchOrders = async (userId) => {
        setLoading(true);
        try {
            const res = await api.get(`/orders/user/${userId}`);
            setOrders(res.data || []);
        } catch (error) {
            console.error('获取订单失败', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCancelOrder = (orderId) => {
        confirm({
            title: '确认取消订单？',
            icon: <ExclamationCircleOutlined />,
            content: '取消后房间将被释放，此操作不可恢复。',
            okText: '确认取消',
            okType: 'danger',
            cancelText: '再想想',
            onOk: async () => {
                try {
                    await api.put(`/orders/${orderId}/cancel?user_id=${user.user_id}`);
                    message.success('订单已取消');
                    fetchOrders(user.user_id);
                } catch (error) {
                    message.error(error.response?.data?.error || '取消失败');
                }
            }
        });
    };

    const getStatusTag = (status) => {
        const statusMap = {
            'booked': { color: 'green', text: '已预订' },
            'checked_in': { color: 'blue', text: '已入住' },
            'checked_out': { color: 'default', text: '已退房' },
            'cancelled': { color: 'red', text: '已取消' }
        };
        const s = statusMap[status] || { color: 'default', text: status };
        return <Tag color={s.color}>{s.text}</Tag>;
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        const date = new Date(dateStr);
        return date.toLocaleDateString('zh-CN');
    };

    const calcNights = (checkIn, checkOut) => {
        if (!checkIn || !checkOut) return 0;
        const start = new Date(checkIn);
        const end = new Date(checkOut);
        const diff = Math.ceil((end - start) / (1000 * 60 * 60 * 24));
        return diff > 0 ? diff : 0;
    };

    if (!user) return null;

    return (
        <div style={{ 
            minHeight: '100vh', 
            background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
            padding: '40px 24px'
        }}>
            <div style={{ maxWidth: 900, margin: '0 auto' }}>
                <Card 
                    title={<span style={{ fontSize: 20 }}>我的订单</span>}
                    extra={<Button onClick={() => navigate('/')}>返回首页</Button>}
                    style={{ borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                >
                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : orders.length === 0 ? (
                        <Empty description="暂无订单记录" style={{ padding: '60px 0' }} />
                    ) : (
                        <List
                            itemLayout="vertical"
                            dataSource={orders}
                            renderItem={(item) => {
                                const order = item.order;
                                const hotel = item.hotel;
                                const nights = calcNights(order.check_in_date, order.check_out_date);
                                
                                return (
                                    <List.Item
                                        key={order.order_id}
                                        actions={[
                                            order.status === 'booked' && (
                                                <Button 
                                                    danger 
                                                    size="small"
                                                    onClick={() => handleCancelOrder(order.order_id)}
                                                >
                                                    取消订单
                                                </Button>
                                            )
                                        ].filter(Boolean)}
                                    >
                                        <Card 
                                            size="small" 
                                            style={{ borderRadius: 8 }}
                                            title={
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <span style={{ fontSize: 16, fontWeight: 600 }}>
                                                        {hotel?.name || '未知酒店'}
                                                    </span>
                                                    {getStatusTag(order.status)}
                                                </div>
                                            }
                                        >
                                            <Descriptions column={{ xs: 1, sm: 2 }} size="small">
                                                <Descriptions.Item label={<><EnvironmentOutlined /> 地址</>}>
                                                    {hotel?.city} · {hotel?.district}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><HomeOutlined /> 房型</>}>
                                                    {order.room_type}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><CalendarOutlined /> 入住</>}>
                                                    {formatDate(order.check_in_date)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><CalendarOutlined /> 离店</>}>
                                                    {formatDate(order.check_out_date)}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="入住天数">
                                                    {nights} 晚
                                                </Descriptions.Item>
                                                <Descriptions.Item label="总价">
                                                    <span style={{ color: '#ff4d4f', fontWeight: 600 }}>
                                                        ¥{order.total_price?.toFixed(2)}
                                                    </span>
                                                </Descriptions.Item>
                                                <Descriptions.Item label={<><UserOutlined /> 入住人</>}>
                                                    {order.guests?.map(g => g.name).join('、') || '-'}
                                                </Descriptions.Item>
                                                <Descriptions.Item label="下单时间">
                                                    {formatDate(order.created_at)}
                                                </Descriptions.Item>
                                            </Descriptions>
                                        </Card>
                                    </List.Item>
                                );
                            }}
                        />
                    )}
                </Card>
            </div>
        </div>
    );
};

export default MyOrders;
