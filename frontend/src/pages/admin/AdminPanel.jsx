import React, { useState, useEffect } from 'react';
import { Layout, Menu, Card, Row, Col, Statistic, Table, Button, Modal, Form, Input, InputNumber, Select, Tag, Space, message, Popconfirm } from 'antd';
import { 
    DashboardOutlined, BankOutlined, UserOutlined, HomeOutlined, 
    OrderedListOutlined, PlusOutlined, EditOutlined, DeleteOutlined,
    LogoutOutlined, DollarOutlined
} from '@ant-design/icons';
import api from '../../api';
import { useNavigate, useLocation } from 'react-router-dom';

const { Header, Sider, Content } = Layout;

const AdminPanel = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [stats, setStats] = useState({});
    const [users, setUsers] = useState([]);
    const [hotels, setHotels] = useState([]);
    const [rooms, setRooms] = useState([]);
    const [orders, setOrders] = useState([]);
    
    const [hotelModal, setHotelModal] = useState(false);
    const [roomModal, setRoomModal] = useState(false);
    const [userModal, setUserModal] = useState(false);
    const [editingItem, setEditingItem] = useState(null);
    const [hotelForm] = Form.useForm();
    const [roomForm] = Form.useForm();
    const [userForm] = Form.useForm();

    const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都', '西安', '南京'];
    const districts = {
        '北京': ['朝阳区', '海淀区', '东城区', '西城区', '丰台区'],
        '上海': ['浦东新区', '黄浦区', '静安区', '徐汇区', '长宁区'],
        '广州': ['天河区', '越秀区', '海珠区', '荔湾区', '番禺区'],
        '深圳': ['南山区', '福田区', '罗湖区', '宝安区', '龙岗区'],
        '杭州': ['西湖区', '上城区', '拱墅区', '滨江区', '余杭区'],
        '成都': ['锦江区', '青羊区', '武侯区', '高新区', '成华区'],
        '西安': ['雁塔区', '碑林区', '新城区', '莲湖区', '长安区'],
        '南京': ['鼓楼区', '玄武区', '秦淮区', '建邺区', '栖霞区'],
    };

    const menuItems = [
        { key: '/admin', icon: <DashboardOutlined />, label: '仪表盘' },
        { key: '/admin/hotels', icon: <BankOutlined />, label: '酒店管理' },
        { key: '/admin/rooms', icon: <HomeOutlined />, label: '客房管理' },
        { key: '/admin/users', icon: <UserOutlined />, label: '用户管理' },
        { key: '/admin/orders', icon: <OrderedListOutlined />, label: '订单管理' },
    ];

    const currentKey = location.pathname;

    useEffect(() => {
        const admin = localStorage.getItem('admin');
        if (!admin) {
            navigate('/admin/login');
            return;
        }
        fetchDashboardStats();
        fetchUsers();
        fetchHotels();
        fetchRooms();
        fetchOrders();
    }, [navigate]);

    const fetchDashboardStats = async () => {
        try {
            const res = await api.get('/admin/dashboard');
            setStats(res.data);
        } catch (error) {
            console.error('获取统计数据失败', error);
        }
    };

    const fetchUsers = async () => {
        try {
            const res = await api.get('/admin/users');
            setUsers(res.data || []);
        } catch (error) {
            console.error('获取用户失败', error);
        }
    };

    const fetchHotels = async () => {
        try {
            const res = await api.get('/hotels');
            setHotels(res.data || []);
        } catch (error) {
            console.error('获取酒店失败', error);
        }
    };

    const fetchRooms = async () => {
        try {
            const res = await api.get('/admin/rooms');
            setRooms(res.data || []);
        } catch (error) {
            console.error('获取客房失败', error);
        }
    };

    const fetchOrders = async () => {
        try {
            const res = await api.get('/admin/orders');
            setOrders(res.data || []);
        } catch (error) {
            console.error('获取订单失败', error);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('admin');
        navigate('/admin/login');
    };

    const handleMenuClick = (e) => {
        navigate(e.key);
    };

    const handleAddHotel = () => {
        setEditingItem(null);
        hotelForm.resetFields();
        setHotelModal(true);
    };

    const handleEditHotel = (record) => {
        setEditingItem(record);
        hotelForm.setFieldsValue(record);
        setHotelModal(true);
    };

    const handleDeleteHotel = async (id) => {
        try {
            await api.delete(`/admin/hotels/${id}`);
            message.success('删除成功');
            fetchHotels();
            fetchRooms();
            fetchDashboardStats();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleHotelSubmit = async (values) => {
        try {
            if (editingItem) {
                await api.put(`/admin/hotels/${editingItem.hotel_id}`, values);
                message.success('更新成功');
            } else {
                await api.post('/admin/hotels', values);
                message.success('创建成功');
            }
            setHotelModal(false);
            fetchHotels();
            fetchDashboardStats();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleAddRoom = () => {
        setEditingItem(null);
        roomForm.resetFields();
        setRoomModal(true);
    };

    const handleEditRoom = (record) => {
        setEditingItem(record);
        roomForm.setFieldsValue(record);
        setRoomModal(true);
    };

    const handleDeleteRoom = async (id) => {
        try {
            await api.delete(`/admin/rooms/${id}`);
            message.success('删除成功');
            fetchRooms();
            fetchDashboardStats();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleRoomSubmit = async (values) => {
        try {
            if (editingItem) {
                await api.put(`/admin/rooms/${editingItem.room_id}`, values);
                message.success('更新成功');
            } else {
                await api.post('/admin/rooms', values);
                message.success('创建成功');
            }
            setRoomModal(false);
            fetchRooms();
            fetchDashboardStats();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleEditUser = (record) => {
        setEditingItem(record);
        userForm.setFieldsValue(record);
        setUserModal(true);
    };

    const handleDeleteUser = async (id) => {
        try {
            await api.delete(`/admin/users/${id}`);
            message.success('删除成功');
            fetchUsers();
            fetchDashboardStats();
        } catch (error) {
            message.error('删除失败');
        }
    };

    const handleUserSubmit = async (values) => {
        try {
            await api.put(`/admin/users/${editingItem.user_id}`, values);
            message.success('更新成功');
            setUserModal(false);
            fetchUsers();
        } catch (error) {
            message.error('操作失败');
        }
    };

    const handleOrderStatus = async (id, status) => {
        try {
            await api.put(`/admin/orders/${id}/status`, { status });
            message.success('状态更新成功');
            fetchOrders();
        } catch (error) {
            message.error('更新失败');
        }
    };

    const userColumns = [
        { title: 'ID', dataIndex: 'user_id', key: 'user_id', width: 60 },
        { title: '用户名', dataIndex: 'username', key: 'username' },
        { title: '真实姓名', dataIndex: 'real_name', key: 'real_name' },
        { title: '积分', dataIndex: 'points', key: 'points' },
        { 
            title: 'VIP', 
            dataIndex: 'is_vip', 
            key: 'is_vip',
            render: (v) => v ? <Tag color="gold">VIP</Tag> : <Tag>普通</Tag>
        },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditUser(record)}>编辑</Button>
                    <Popconfirm title="确定删除？" onConfirm={() => handleDeleteUser(record.user_id)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const hotelColumns = [
        { title: 'ID', dataIndex: 'hotel_id', key: 'hotel_id', width: 60 },
        { title: '酒店名称', dataIndex: 'name', key: 'name' },
        { title: '城市', dataIndex: 'city', key: 'city' },
        { title: '区域', dataIndex: 'district', key: 'district' },
        { title: '地址', dataIndex: 'address', key: 'address', ellipsis: true },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditHotel(record)}>编辑</Button>
                    <Popconfirm title="确定删除？关联客房也会被删除" onConfirm={() => handleDeleteHotel(record.hotel_id)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const roomColumns = [
        { title: 'ID', dataIndex: 'room_id', key: 'room_id', width: 60 },
        { title: '酒店ID', dataIndex: 'hotel_id', key: 'hotel_id', width: 80 },
        { title: '房型', dataIndex: 'room_type', key: 'room_type' },
        { title: '价格', dataIndex: 'price', key: 'price', render: (v) => `¥${v}` },
        { title: '容量', dataIndex: 'capacity', key: 'capacity' },
        { title: '总库存', dataIndex: 'total_inventory', key: 'total_inventory' },
        { title: '可预订', dataIndex: 'available_inventory', key: 'available_inventory' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    <Button size="small" icon={<EditOutlined />} onClick={() => handleEditRoom(record)}>编辑</Button>
                    <Popconfirm title="确定删除？" onConfirm={() => handleDeleteRoom(record.room_id)}>
                        <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
                    </Popconfirm>
                </Space>
            )
        }
    ];

    const orderColumns = [
        { title: 'ID', dataIndex: 'order_id', key: 'order_id', width: 60 },
        { title: '用户ID', dataIndex: 'user_id', key: 'user_id', width: 80 },
        { title: '酒店ID', dataIndex: 'hotel_id', key: 'hotel_id', width: 80 },
        { title: '房型', dataIndex: 'room_type', key: 'room_type' },
        { title: '总价', dataIndex: 'total_price', key: 'total_price', render: (v) => `¥${v}` },
        { 
            title: '状态', 
            dataIndex: 'status', 
            key: 'status',
            render: (v) => {
                const colors = { booked: 'blue', stayed: 'green', cancelled: 'red' };
                const texts = { booked: '已预订', stayed: '已入住', cancelled: '已取消' };
                return <Tag color={colors[v]}>{texts[v]}</Tag>;
            }
        },
        { title: '入住日期', dataIndex: 'check_in_date', key: 'check_in_date' },
        { title: '离店日期', dataIndex: 'check_out_date', key: 'check_out_date' },
        {
            title: '操作',
            key: 'action',
            render: (_, record) => (
                <Space>
                    {record.status === 'booked' && (
                        <>
                            <Button size="small" type="primary" onClick={() => handleOrderStatus(record.order_id, 'stayed')}>入住</Button>
                            <Button size="small" danger onClick={() => handleOrderStatus(record.order_id, 'cancelled')}>取消</Button>
                        </>
                    )}
                </Space>
            )
        }
    ];

    const renderContent = () => {
        switch (currentKey) {
            case '/admin':
                return (
                    <div>
                        <h2 style={{ marginBottom: 24 }}>仪表盘</h2>
                        <Row gutter={[16, 16]}>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic title="酒店数量" value={stats.hotel_count || 0} prefix={<BankOutlined />} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic title="用户数量" value={stats.user_count || 0} prefix={<UserOutlined />} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic title="订单数量" value={stats.order_count || 0} prefix={<OrderedListOutlined />} />
                                </Card>
                            </Col>
                            <Col xs={12} sm={6}>
                                <Card>
                                    <Statistic title="总收入" value={stats.total_revenue || 0} prefix={<DollarOutlined />} precision={2} />
                                </Card>
                            </Col>
                        </Row>
                    </div>
                );
            case '/admin/hotels':
                return (
                    <div>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0 }}>酒店管理</h2>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddHotel}>添加酒店</Button>
                        </div>
                        <Table columns={hotelColumns} dataSource={hotels} rowKey="hotel_id" scroll={{ x: 800 }} />
                    </div>
                );
            case '/admin/rooms':
                return (
                    <div>
                        <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
                            <h2 style={{ margin: 0 }}>客房管理</h2>
                            <Button type="primary" icon={<PlusOutlined />} onClick={handleAddRoom}>添加客房</Button>
                        </div>
                        <Table columns={roomColumns} dataSource={rooms} rowKey="room_id" scroll={{ x: 900 }} />
                    </div>
                );
            case '/admin/users':
                return (
                    <div>
                        <h2 style={{ marginBottom: 16 }}>用户管理</h2>
                        <Table columns={userColumns} dataSource={users} rowKey="user_id" />
                    </div>
                );
            case '/admin/orders':
                return (
                    <div>
                        <h2 style={{ marginBottom: 16 }}>订单管理</h2>
                        <Table columns={orderColumns} dataSource={orders} rowKey="order_id" scroll={{ x: 1000 }} />
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <Layout style={{ minHeight: '100vh' }}>
            <Sider theme="dark" width={200}>
                <div style={{ height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: 18, fontWeight: 'bold' }}>
                    后台管理
                </div>
                <Menu
                    theme="dark"
                    mode="inline"
                    selectedKeys={[currentKey]}
                    items={menuItems}
                    onClick={handleMenuClick}
                />
            </Sider>
            <Layout>
                <Header style={{ background: '#fff', padding: '0 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 16 }}>酒店预订系统管理后台</span>
                    <Button icon={<LogoutOutlined />} onClick={handleLogout}>退出登录</Button>
                </Header>
                <Content style={{ margin: 24, background: '#fff', padding: 24, borderRadius: 8, minHeight: 'calc(100vh - 112px)' }}>
                    {renderContent()}
                </Content>
            </Layout>

            <Modal
                title={editingItem ? '编辑酒店' : '添加酒店'}
                open={hotelModal}
                onCancel={() => setHotelModal(false)}
                footer={null}
            >
                <Form form={hotelForm} onFinish={handleHotelSubmit} layout="vertical">
                    <Form.Item name="name" label="酒店名称" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="city" label="城市" rules={[{ required: true }]}>
                        <Select options={cities.map(c => ({ value: c, label: c }))} />
                    </Form.Item>
                    <Form.Item name="district" label="区域" rules={[{ required: true }]}>
                        <Form.Item shouldUpdate noStyle>
                            {({ getFieldValue }) => (
                                <Select options={(districts[getFieldValue('city')] || []).map(d => ({ value: d, label: d }))} />
                            )}
                        </Form.Item>
                    </Form.Item>
                    <Form.Item name="address" label="地址">
                        <Input />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>提交</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title={editingItem ? '编辑客房' : '添加客房'}
                open={roomModal}
                onCancel={() => setRoomModal(false)}
                footer={null}
            >
                <Form form={roomForm} onFinish={handleRoomSubmit} layout="vertical">
                    <Form.Item name="hotel_id" label="酒店ID" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="room_type" label="房型" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="price" label="价格" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="capacity" label="容量" rules={[{ required: true }]}>
                        <InputNumber min={1} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="total_inventory" label="总库存" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="available_inventory" label="可预订数量" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>提交</Button>
                    </Form.Item>
                </Form>
            </Modal>

            <Modal
                title="编辑用户"
                open={userModal}
                onCancel={() => setUserModal(false)}
                footer={null}
            >
                <Form form={userForm} onFinish={handleUserSubmit} layout="vertical">
                    <Form.Item name="real_name" label="真实姓名" rules={[{ required: true }]}>
                        <Input />
                    </Form.Item>
                    <Form.Item name="points" label="积分" rules={[{ required: true }]}>
                        <InputNumber min={0} style={{ width: '100%' }} />
                    </Form.Item>
                    <Form.Item name="is_vip" label="VIP状态" rules={[{ required: true }]}>
                        <Select options={[{ value: true, label: 'VIP' }, { value: false, label: '普通' }]} />
                    </Form.Item>
                    <Form.Item>
                        <Button type="primary" htmlType="submit" block>提交</Button>
                    </Form.Item>
                </Form>
            </Modal>
        </Layout>
    );
};

export default AdminPanel;
