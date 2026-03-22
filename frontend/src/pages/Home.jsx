import React, { useState, useEffect } from 'react';
import { Input, Select, Card, Row, Col, Tag, Spin, Empty, Button, Dropdown, message } from 'antd';
import { SearchOutlined, EnvironmentOutlined, StarFilled, SortAscendingOutlined, UserOutlined, LogoutOutlined } from '@ant-design/icons';
import api from '../api';
import { useNavigate } from 'react-router-dom';

const { Search } = Input;

const Home = () => {
    const navigate = useNavigate();
    const [hotels, setHotels] = useState([]);
    const [loading, setLoading] = useState(false);
    const [city, setCity] = useState('');
    const [district, setDistrict] = useState('');
    const [sortBy, setSortBy] = useState('default');
    const [user, setUser] = useState(null);

    const cities = [
        { value: '北京', label: '北京' },
        { value: '上海', label: '上海' },
        { value: '广州', label: '广州' },
        { value: '深圳', label: '深圳' },
        { value: '杭州', label: '杭州' },
        { value: '成都', label: '成都' },
        { value: '西安', label: '西安' },
        { value: '南京', label: '南京' },
    ];

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

    const sortOptions = [
        { key: 'default', label: '默认排序' },
        { key: 'price_asc', label: '价格从低到高' },
        { key: 'price_desc', label: '价格从高到低' },
    ];

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            setUser(JSON.parse(userData));
        }
        fetchHotels();
    }, []);

    const fetchHotels = async (searchCity = city, searchDistrict = district) => {
        setLoading(true);
        try {
            const params = new URLSearchParams();
            if (searchCity) params.append('city', searchCity);
            if (searchDistrict) params.append('district', searchDistrict);
            
            const res = await api.get(`/hotels?${params.toString()}`);
            let data = res.data || [];
            
            if (sortBy === 'price_asc') {
                data.sort((a, b) => getMinPrice(a.Rooms) - getMinPrice(b.Rooms));
            } else if (sortBy === 'price_desc') {
                data.sort((a, b) => getMinPrice(b.Rooms) - getMinPrice(a.Rooms));
            }
            
            setHotels(data);
        } catch (error) {
            console.error('获取酒店列表失败', error);
            setHotels([]);
        } finally {
            setLoading(false);
        }
    };

    const getMinPrice = (rooms) => {
        if (!rooms || rooms.length === 0) return 0;
        return Math.min(...rooms.map(r => r.price));
    };

    const handleSearch = (value) => {
        fetchHotels(city, district);
    };

    const handleCityChange = (value) => {
        setCity(value);
        setDistrict('');
        fetchHotels(value, '');
    };

    const handleDistrictChange = (value) => {
        setDistrict(value);
        fetchHotels(city, value);
    };

    const handleSort = ({ key }) => {
        setSortBy(key);
        const sorted = [...hotels];
        if (key === 'price_asc') {
            sorted.sort((a, b) => getMinPrice(a.Rooms) - getMinPrice(b.Rooms));
        } else if (key === 'price_desc') {
            sorted.sort((a, b) => getMinPrice(b.Rooms) - getMinPrice(a.Rooms));
        }
        setHotels(sorted);
    };

    const handleLogout = () => {
        localStorage.removeItem('user');
        setUser(null);
        message.success('已退出登录');
        navigate('/login');
    };

    return (
        <div style={{ minHeight: '100vh', background: '#f5f5f5' }}>
            <div style={{
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                padding: '20px 0',
                position: 'sticky',
                top: 0,
                zIndex: 100,
                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
            }}>
                <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 24px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                        <h1 style={{ color: '#fff', margin: 0, fontSize: 24 }}>
                            <EnvironmentOutlined style={{ marginRight: 8 }} />
                            酒店预订系统
                        </h1>
                        <div>
                            {user ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: '#fff' }}>
                                        <UserOutlined style={{ marginRight: 4 }} />
                                        {user.username}
                                    </span>
                                    <Button 
                                        type="link" 
                                        style={{ color: '#fff' }}
                                        onClick={handleLogout}
                                    >
                                        <LogoutOutlined /> 退出
                                    </Button>
                                </div>
                            ) : (
                                <Button type="primary" ghost onClick={() => navigate('/login')}>
                                    登录
                                </Button>
                            )}
                        </div>
                    </div>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                        <Select
                            placeholder="选择城市"
                            style={{ width: 140 }}
                            value={city || undefined}
                            onChange={handleCityChange}
                            options={cities}
                            allowClear
                            onClear={() => { setCity(''); setDistrict(''); fetchHotels('', ''); }}
                        />
                        <Select
                            placeholder="选择区域"
                            style={{ width: 140 }}
                            value={district || undefined}
                            onChange={handleDistrictChange}
                            options={(city && districts[city] || []).map(d => ({ value: d, label: d }))}
                            allowClear
                            disabled={!city}
                            onClear={() => { setDistrict(''); fetchHotels(city, ''); }}
                        />
                        <Search
                            placeholder="搜索酒店名称"
                            allowClear
                            enterButton={<><SearchOutlined /> 搜索</>}
                            style={{ flex: 1, minWidth: 200, maxWidth: 400 }}
                            onSearch={handleSearch}
                        />
                        <Dropdown
                            menu={{ items: sortOptions.map(o => ({ ...o, onClick: handleSort })), selectedKeys: [sortBy] }}
                            trigger={['click']}
                        >
                            <Button icon={<SortAscendingOutlined />}>
                                {sortOptions.find(o => o.key === sortBy)?.label}
                            </Button>
                        </Dropdown>
                    </div>
                </div>
            </div>

            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
                {loading ? (
                    <div style={{ textAlign: 'center', padding: '100px 0' }}>
                        <Spin size="large" />
                    </div>
                ) : hotels.length === 0 ? (
                    <Empty
                        description="暂无酒店数据"
                        style={{ padding: '100px 0' }}
                    />
                ) : (
                    <Row gutter={[24, 24]}>
                        {hotels.map(hotel => (
                            <Col xs={24} sm={12} lg={8} key={hotel.hotel_id}>
                                <Card
                                    hoverable
                                    style={{ borderRadius: 12, overflow: 'hidden' }}
                                    cover={
                                        <div style={{
                                            height: 180,
                                            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: '#fff',
                                            fontSize: 48
                                        }}>
                                            🏨
                                        </div>
                                    }
                                >
                                    <div style={{ marginBottom: 8 }}>
                                        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>{hotel.name}</h3>
                                    </div>
                                    <div style={{ color: '#666', marginBottom: 8, fontSize: 13 }}>
                                        <EnvironmentOutlined style={{ marginRight: 4, color: '#1890ff' }} />
                                        {hotel.city} · {hotel.district}
                                    </div>
                                    {hotel.address && (
                                        <div style={{ color: '#999', fontSize: 12, marginBottom: 12, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                            {hotel.address}
                                        </div>
                                    )}
                                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 12 }}>
                                        {hotel.rooms && hotel.rooms.slice(0, 3).map(room => (
                                            <Tag key={room.room_id} color="blue">{room.room_type}</Tag>
                                        ))}
                                    </div>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div>
                                            <span style={{ color: '#ff4d4f', fontSize: 20, fontWeight: 600 }}>
                                                ¥{getMinPrice(hotel.rooms)}
                                            </span>
                                            <span style={{ color: '#999', fontSize: 12, marginLeft: 4 }}>起</span>
                                        </div>
                                        <div style={{ color: '#faad14', fontSize: 12 }}>
                                            <StarFilled /> 4.8
                                        </div>
                                    </div>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </div>
        </div>
    );
};

export default Home;
