import React, { useState, useEffect } from 'react';
import { Card, List, Tag, Button, Empty, Spin, message, Modal, Descriptions, Select, Input, DatePicker, Row, Col, Space, Form, Rate } from 'antd';
import { EnvironmentOutlined, CalendarOutlined, HomeOutlined, UserOutlined, ExclamationCircleOutlined, SearchOutlined, ReloadOutlined, StarFilled } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';
import dayjs from 'dayjs';

const { confirm } = Modal;
const { RangePicker } = DatePicker;
const { TextArea } = Input;

const MyOrders = () => {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [reviewedHotels, setReviewedHotels] = useState({});
    
    const [statusFilter, setStatusFilter] = useState('all');
    const [cityFilter, setCityFilter] = useState('all');
    const [dateRange, setDateRange] = useState(null);
    const [searchText, setSearchText] = useState('');

    const [reviewModal, setReviewModal] = useState(false);
    const [reviewForm] = Form.useForm();
    const [reviewingOrder, setReviewingOrder] = useState(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (!userData) {
            navigate('/login');
            return;
        }
        const parsed = JSON.parse(userData);
        setUser(parsed);
        fetchOrders(parsed.user_id);
        fetchReviewedHotels(parsed.user_id);
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

    const fetchReviewedHotels = async (userId) => {
        try {
            const res = await api.get(`/reviews/user/${userId}`);
            setReviewedHotels(res.data || {});
        } catch (error) {
            console.error('获取评价信息失败', error);
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

    const handleOpenReview = (order, hotel) => {
        setReviewingOrder({ order, hotel });
        reviewForm.resetFields();
        setReviewModal(true);
    };

    const handleSubmitReview = async (values) => {
        try {
            await api.post('/reviews', {
                hotel_id: reviewingOrder.order.hotel_id,
                user_id: user.user_id,
                rating: values.rating,
                content: values.content
            });
            message.success('评价成功！');
            setReviewModal(false);
            fetchReviewedHotels(user.user_id);
        } catch (error) {
            message.error(error.response?.data?.error || '评价失败');
        }
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

    const getCities = () => {
        const cities = new Set();
        orders.forEach(item => {
            if (item.hotel?.city) {
                cities.add(item.hotel.city);
            }
        });
        return Array.from(cities).sort();
    };

    const filteredOrders = orders.filter(item => {
        const order = item.order;
        const hotel = item.hotel;

        if (statusFilter !== 'all' && order.status !== statusFilter) {
            return false;
        }

        if (cityFilter !== 'all' && hotel?.city !== cityFilter) {
            return false;
        }

        if (searchText && hotel?.name) {
            if (!hotel.name.toLowerCase().includes(searchText.toLowerCase())) {
                return false;
            }
        }

        if (dateRange && dateRange[0] && dateRange[1]) {
            const checkInDate = dayjs(order.check_in_date);
            const startDate = dateRange[0];
            const endDate = dateRange[1];
            if (checkInDate.isBefore(startDate) || checkInDate.isAfter(endDate)) {
                return false;
            }
        }

        return true;
    });

    const handleReset = () => {
        setStatusFilter('all');
        setCityFilter('all');
        setDateRange(null);
        setSearchText('');
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
                    <Card 
                        size="small" 
                        style={{ marginBottom: 16, borderRadius: 8, background: '#fafafa' }}
                    >
                        <Row gutter={[16, 16]} align="middle">
                            <Col xs={24} sm={12} md={6}>
                                <Input
                                    placeholder="搜索酒店名称"
                                    prefix={<SearchOutlined />}
                                    value={searchText}
                                    onChange={(e) => setSearchText(e.target.value)}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={12} md={5}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="订单状态"
                                    value={statusFilter}
                                    onChange={setStatusFilter}
                                    options={[
                                        { value: 'all', label: '全部状态' },
                                        { value: 'booked', label: '已预订' },
                                        { value: 'checked_in', label: '已入住' },
                                        { value: 'checked_out', label: '已退房' },
                                        { value: 'cancelled', label: '已取消' }
                                    ]}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={5}>
                                <Select
                                    style={{ width: '100%' }}
                                    placeholder="选择城市"
                                    value={cityFilter}
                                    onChange={setCityFilter}
                                    options={[
                                        { value: 'all', label: '全部城市' },
                                        ...getCities().map(city => ({ value: city, label: city }))
                                    ]}
                                />
                            </Col>
                            <Col xs={24} sm={12} md={6}>
                                <RangePicker
                                    placeholder={['入住开始', '入住结束']}
                                    value={dateRange}
                                    onChange={setDateRange}
                                    style={{ width: 220 }}
                                    allowClear
                                />
                            </Col>
                            <Col xs={24} sm={24} md={2}>
                                <Button 
                                    icon={<ReloadOutlined />} 
                                    onClick={handleReset}
                                    style={{ width: '100%' }}
                                >
                                    重置
                                </Button>
                            </Col>
                        </Row>
                    </Card>

                    <div style={{ marginBottom: 16, color: '#666' }}>
                        共 {filteredOrders.length} 条订单
                        {filteredOrders.length !== orders.length && ` (筛选自 ${orders.length} 条)`}
                    </div>

                    {loading ? (
                        <div style={{ textAlign: 'center', padding: '60px 0' }}>
                            <Spin size="large" />
                        </div>
                    ) : filteredOrders.length === 0 ? (
                        <Empty description="暂无符合条件的订单" style={{ padding: '60px 0' }} />
                    ) : (
                        <List
                            itemLayout="vertical"
                            dataSource={filteredOrders}
                            renderItem={(item) => {
                                const order = item.order;
                                const hotel = item.hotel;
                                const nights = calcNights(order.check_in_date, order.check_out_date);
                                const canReview = order.status === 'checked_out';
                                const hasReviewed = reviewedHotels[order.hotel_id];
                                
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
                                            ),
                                            canReview && !hasReviewed && (
                                                <Button 
                                                    type="primary"
                                                    size="small"
                                                    icon={<StarFilled />}
                                                    onClick={() => handleOpenReview(order, hotel)}
                                                >
                                                    写评价
                                                </Button>
                                            ),
                                            canReview && hasReviewed && (
                                                <Tag color="gold" icon={<StarFilled />}>已评价</Tag>
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
                                                    {order.guest_names?.join('、') || order.guests?.map(g => g.name).join('、') || '-'}
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

            <Modal
                title={`评价 - ${reviewingOrder?.hotel?.name || '酒店'}`}
                open={reviewModal}
                onCancel={() => setReviewModal(false)}
                footer={null}
            >
                <Form form={reviewForm} onFinish={handleSubmitReview} layout="vertical">
                    <Form.Item name="rating" label="评分" rules={[{ required: true, message: '请选择评分' }]}>
                        <Rate />
                    </Form.Item>
                    <Form.Item name="content" label="评价内容" rules={[{ required: true, message: '请输入评价内容' }]}>
                        <TextArea rows={4} placeholder="请分享您的入住体验..." />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>
                            提交评价
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default MyOrders;
