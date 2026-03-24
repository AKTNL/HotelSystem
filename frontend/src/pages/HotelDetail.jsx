import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, Row, Col, Tag, Rate, Avatar, Button, Spin, Empty, message, Modal, Form, Input, InputNumber, DatePicker, Select, Divider, Alert } from 'antd';
import { EnvironmentOutlined, StarFilled, UserOutlined, HomeOutlined, ArrowLeftOutlined, PlusOutlined, UserAddOutlined } from '@ant-design/icons';
import api from '../api';
import dayjs from 'dayjs';

const { RangePicker } = DatePicker;

const HotelDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [hotel, setHotel] = useState(null);
    const [rooms, setRooms] = useState([]);
    const [reviews, setReviews] = useState([]);
    const [user, setUser] = useState(null);
    const [userProfile, setUserProfile] = useState(null);
    const [bookingModal, setBookingModal] = useState(false);
    const [selectedRoom, setSelectedRoom] = useState(null);
    const [reviewModal, setReviewModal] = useState(false);
    const [form] = Form.useForm();
    const [guestForm] = Form.useForm();

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsed = JSON.parse(userData);
            setUser(parsed);
            fetchUserProfile(parsed.user_id);
        }
        fetchHotelDetail();
    }, [id]);

    const fetchUserProfile = async (userId) => {
        try {
            const res = await api.get(`/user/${userId}`);
            setUserProfile(res.data);
        } catch (error) {
            console.error('获取用户信息失败', error);
        }
    };

    const fetchHotelDetail = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/hotels/${id}`);
            setHotel(res.data.hotel);
            setRooms(res.data.rooms || []);
            setReviews(res.data.reviews || []);
        } catch (error) {
            message.error('获取酒店信息失败');
        } finally {
            setLoading(false);
        }
    };

    const handleBooking = (room) => {
        if (!user) {
            message.warning('请先登录');
            navigate('/login');
            return;
        }
        setSelectedRoom(room);
        setBookingModal(true);
    };

    const addSelfAsGuest = (add, guests) => {
        if (!userProfile) {
            message.warning('请先完善个人信息');
            return;
        }
        if (!userProfile.real_name || !userProfile.id_card) {
            message.warning('请先在个人中心完成实名认证');
            return;
        }
        const alreadyAdded = guests?.some(g => g && g.id_card === userProfile.id_card);
        if (alreadyAdded) {
            message.warning('您已添加本人信息，请勿重复添加');
            return;
        }
        add({
            name: userProfile.real_name,
            id_card: userProfile.id_card
        });
    };

    const submitBooking = async (values) => {
        try {
            const checkIn = values.dates[0].format('YYYY-MM-DD');
            const checkOut = values.dates[1].format('YYYY-MM-DD');
            
            const guests = values.guests || [];
            
            await api.post('/orders', {
                user_id: user.user_id,
                hotel_id: hotel.hotel_id,
                room_type: selectedRoom.room_type,
                check_in: checkIn,
                check_out: checkOut,
                guests: guests
            });
            
            message.success('预订成功！');
            setBookingModal(false);
            form.resetFields();
            guestForm.resetFields();
            navigate('/my-orders');
        } catch (error) {
            message.error(error.response?.data?.error || '预订失败');
        }
    };

    const submitReview = async (values) => {
        try {
            await api.post('/reviews', {
                hotel_id: hotel.hotel_id,
                user_id: user.user_id,
                rating: values.rating,
                content: values.content
            });
            message.success('评价成功！');
            setReviewModal(false);
            fetchHotelDetail();
        } catch (error) {
            message.error('评价失败');
        }
    };

    const formatDate = (dateStr) => {
        if (!dateStr) return '-';
        return dayjs(dateStr).format('YYYY-MM-DD');
    };

    if (loading) {
        return (
            <div style={{ minHeight: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <Spin size="large" />
            </div>
        );
    }

    if (!hotel) {
        return <Empty description="酒店不存在" />;
    }

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 0',
                position: 'sticky',
                top: 0,
                zIndex: 100
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Button 
                            type="text" 
                            icon={<ArrowLeftOutlined />} 
                            style={{ color: '#fff' }}
                            onClick={() => navigate('/')}
                        >
                            返回
                        </Button>
                        <h1 style={{ color: '#fff', margin: 0 }}>{hotel.name}</h1>
                        <div style={{ width: 60 }} />
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
                <Row gutter={[24, 24]}>
                    <Col xs={24} lg={16}>
                        <Card style={{ borderRadius: 12, marginBottom: 24 }}>
                            <div style={{
                                height: 300,
                                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: '#fff',
                                fontSize: 80
                            }}>
                                🏨
                            </div>
                            <div style={{ marginTop: 20 }}>
                                <h2 style={{ margin: '0 0 12px' }}>{hotel.name}</h2>
                                <div style={{ color: '#666', marginBottom: 8 }}>
                                    <EnvironmentOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                    {hotel.city} · {hotel.district} · {hotel.address}
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                                    <div style={{ color: '#faad14' }}>
                                        <StarFilled style={{ marginRight: 4 }} />
                                        <span style={{ fontWeight: 600 }}>4.8</span>
                                        <span style={{ color: '#999', marginLeft: 4 }}>({reviews.length}条评价)</span>
                                    </div>
                                </div>
                            </div>
                        </Card>

                        <Card title="房型列表" style={{ borderRadius: 12, marginBottom: 24 }}>
                            {rooms.length === 0 ? (
                                <Empty description="暂无房型" />
                            ) : (
                                <div>
                                    {rooms.map(room => (
                                        <Card 
                                            key={room.room_id} 
                                            size="small" 
                                            style={{ marginBottom: 16, borderRadius: 8 }}
                                            hoverable
                                        >
                                            <Row align="middle" gutter={[16, 16]}>
                                                <Col xs={24} sm={12}>
                                                    <h4 style={{ margin: '0 0 8px' }}>
                                                        <HomeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
                                                        {room.room_type}
                                                    </h4>
                                                    <div style={{ color: '#666' }}>
                                                        可住 {room.capacity} 人 · 剩余 {room.available_inventory} 间
                                                    </div>
                                                </Col>
                                                <Col xs={24} sm={6}>
                                                    <div style={{ color: '#ff4d4f', fontSize: 24, fontWeight: 600 }}>
                                                        ¥{room.price}
                                                    </div>
                                                    <div style={{ color: '#999', fontSize: 12 }}>每晚</div>
                                                </Col>
                                                <Col xs={24} sm={6}>
                                                    <Button 
                                                        type="primary" 
                                                        block
                                                        disabled={room.available_inventory <= 0}
                                                        onClick={() => handleBooking(room)}
                                                    >
                                                        {room.available_inventory > 0 ? '立即预订' : '已满'}
                                                    </Button>
                                                </Col>
                                            </Row>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </Card>

                        <Card 
                            title="用户评价" 
                            style={{ borderRadius: 12 }}
                            extra={user && (
                                <Button type="link" icon={<PlusOutlined />} onClick={() => setReviewModal(true)}>
                                    写评价
                                </Button>
                            )}
                        >
                            {reviews.length === 0 ? (
                                <Empty description="暂无评价" />
                            ) : (
                                <div>
                                    {reviews.map(review => (
                                        <div key={review.review_id} style={{ marginBottom: 16, paddingBottom: 16, borderBottom: '1px solid #f0f0f0' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                                                <Avatar 
                                                    size={32} 
                                                    style={{ backgroundColor: '#667eea', marginRight: 8 }}
                                                >
                                                    {review.user?.username?.charAt(0)?.toUpperCase() || <UserOutlined />}
                                                </Avatar>
                                                <span style={{ fontWeight: 500 }}>{review.user?.username || '用户'}</span>
                                                <Rate disabled defaultValue={review.rating} style={{ marginLeft: 16, fontSize: 12 }} />
                                            </div>
                                            <div style={{ color: '#666', lineHeight: 1.6 }}>{review.content}</div>
                                            <div style={{ color: '#999', fontSize: 12, marginTop: 8 }}>
                                                {formatDate(review.created_at)}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </Card>
                    </Col>

                    <Col xs={24} lg={8}>
                        <Card title="酒店信息" style={{ borderRadius: 12, position: 'sticky', top: 80 }}>
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ color: '#999', marginBottom: 4 }}>地址</div>
                                <div>{hotel.city} {hotel.district} {hotel.address}</div>
                            </div>
                            <Divider />
                            <div style={{ marginBottom: 16 }}>
                                <div style={{ color: '#999', marginBottom: 4 }}>房型数量</div>
                                <div>{rooms.length} 种房型</div>
                            </div>
                            <Divider />
                            <div>
                                <div style={{ color: '#999', marginBottom: 4 }}>价格范围</div>
                                <div>
                                    {rooms.length > 0 ? (
                                        <span>
                                            ¥{Math.min(...rooms.map(r => r.price))} - ¥{Math.max(...rooms.map(r => r.price))}
                                            <span style={{ color: '#999' }}> / 晚</span>
                                        </span>
                                    ) : '-'}
                                </div>
                            </div>
                        </Card>
                    </Col>
                </Row>
            </div>

            <Modal
                title={`预订 - ${selectedRoom?.room_type}`}
                open={bookingModal}
                onCancel={() => setBookingModal(false)}
                footer={null}
                width={600}
            >
                <Form form={form} onFinish={submitBooking} layout="vertical">
                    <Form.Item name="dates" label="入住日期" rules={[{ required: true }]}>
                        <RangePicker 
                            style={{ width: '100%' }} 
                            disabledDate={(current) => current && current < dayjs().startOf('day')}
                        />
                    </Form.Item>
                    
                    {userProfile && !userProfile.is_verified && (
                        <Alert
                            message="您尚未完成实名认证"
                            description="请先在个人中心完成实名认证后再预订房间"
                            type="warning"
                            showIcon
                            style={{ marginBottom: 16 }}
                            action={
                                <Button size="small" onClick={() => navigate('/profile')}>
                                    去认证
                                </Button>
                            }
                        />
                    )}
                    
                    <Form.List name="guests">
                        {(fields, { add, remove }) => (
                            <div>
                                <div style={{ marginBottom: 8, display: 'flex', gap: 8 }}>
                                    <Button type="dashed" onClick={() => add()} icon={<PlusOutlined />}>
                                        添加入住人
                                    </Button>
                                    <Button 
                                        type="default" 
                                        onClick={() => {
                                            const currentGuests = form.getFieldValue('guests') || [];
                                            addSelfAsGuest(add, currentGuests);
                                        }} 
                                        icon={<UserAddOutlined />}
                                        disabled={!userProfile?.is_verified}
                                    >
                                        添加本人
                                    </Button>
                                </div>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Card key={key} size="small" style={{ marginBottom: 8 }}>
                                        <Row gutter={16}>
                                            <Col span={11}>
                                                <Form.Item {...restField} name={[name, 'name']} label="姓名" rules={[{ required: true }]}>
                                                    <Input />
                                                </Form.Item>
                                            </Col>
                                            <Col span={11}>
                                                <Form.Item {...restField} name={[name, 'id_card']} label="身份证号" rules={[
                                                    { required: true, message: '请输入身份证号' },
                                                    { pattern: /^\d{17}(\d|X|x)$/, message: '请输入正确的18位身份证号' }
                                                ]}>
                                                    <Input maxLength={18} />
                                                </Form.Item>
                                            </Col>
                                            <Col span={2} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                                <Button type="text" danger onClick={() => remove(name)}>
                                                    删除
                                                </Button>
                                            </Col>
                                        </Row>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </Form.List>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block disabled={!userProfile?.is_verified}>
                            确认预订
                        </Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="写评价"
                open={reviewModal}
                onCancel={() => setReviewModal(false)}
                footer={null}
            >
                <Form form={guestForm} onFinish={submitReview} layout="vertical">
                    <Form.Item name="rating" label="评分" rules={[{ required: true }]}>
                        <Rate />
                    </Form.Item>
                    <Form.Item name="content" label="评价内容" rules={[{ required: true }]}>
                        <Input.TextArea rows={4} placeholder="请分享您的入住体验..." />
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

export default HotelDetail;
