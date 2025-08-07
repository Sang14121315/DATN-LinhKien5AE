import React, { useEffect, useState } from 'react';
import { fetchDashboardStats, fetchRecentOrders, DashboardStats, DashboardOrder, formatCurrency, fetchRevenueOrdersByDate, fetchTop5BestSellerProducts, RevenueOrderByDate, TopProduct } from '../../api/dashboardAPI';
import '@/styles/pages/admin/dashboard.scss';
import { FaShoppingCart, FaCheckCircle, FaTimesCircle, FaMoneyBillWave, FaHourglassHalf } from 'react-icons/fa';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, LabelList, PieChart, Pie, Cell } from 'recharts';
import { DatePicker, Space, Button, Select } from 'antd';
import dayjs from 'dayjs';

const DashboardPage: React.FC = () => {
  const [orders, setOrders] = useState<DashboardOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [revenueOrderData, setRevenueOrderData] = useState<RevenueOrderByDate[]>([]);
  const [topProducts, setTopProducts] = useState<TopProduct[]>([]);
  const [fromDate, setFromDate] = useState<string | null>(null);
  const [toDate, setToDate] = useState<string | null>(null);
  const [revenueOrderLoading, setRevenueOrderLoading] = useState(false);
  const [groupMode, setGroupMode] = useState<'day' | 'month' | 'year'>('day');
  const [topProductsLoading, setTopProductsLoading] = useState(false);

  const handleRefreshTopProducts = async () => {
    setTopProductsLoading(true);
    try {
      const data = await fetchTop5BestSellerProducts();
      setTopProducts(data);
    } catch (err: any) {
      setError('Không thể làm mới top sản phẩm bán chạy');
    } finally {
      setTopProductsLoading(false);
    }
  };

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        console.log('Loading dashboard data...');
        
        const [statsData, ordersData, revenueOrders, top5] = await Promise.all([
          fetchDashboardStats(),
          fetchRecentOrders(),
          fetchRevenueOrdersByDate(),
          fetchTop5BestSellerProducts(),
        ]);
        
        console.log('Stats data:', statsData);
        console.log('Orders data:', ordersData);
        console.log('Revenue Orders data:', revenueOrders);
        console.log('Top Products data:', top5);
        
        setStats(statsData);
        setOrders(ordersData);
        setRevenueOrderData(revenueOrders);
        setTopProducts(top5);
      } catch (err: any) {
        console.error('Dashboard error:', err);
        console.error('Error response:', err.response?.data);
        setError(`Không thể tải dữ liệu dashboard: ${err.response?.data?.message || err.message}`);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleFilterRevenueOrders = async () => {
    setRevenueOrderLoading(true);
    try {
      const data = await fetchRevenueOrdersByDate(fromDate || undefined, toDate || undefined);
      setRevenueOrderData(data);
    } catch (err: any) {
      setError('Không thể lọc dữ liệu doanh thu/đơn hàng');
    } finally {
      setRevenueOrderLoading(false);
    }
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    }).replace(/\//g, '-');
  };

  const getStatusColor = (status: string): string => {
    const statusColors: Record<string, string> = {
      'Đã giao hàng': '#4CAF50',
      'Đã hủy': '#F44336',
      'Đang xử lý': '#FFC107',
      'Chờ xử lý': '#2196F3', // màu xanh dương cho chờ xử lý
      'pending': '#2196F3',
      'completed': '#4CAF50',
      'cancelled': '#F44336',
    };
    return statusColors[status] || '#9E9E9E';
  };

  // Group lại dữ liệu theo tháng/năm nếu cần
  const getGroupedRevenueOrderData = () => {
    if (groupMode === 'day') return revenueOrderData;
    if (!revenueOrderData || revenueOrderData.length === 0) return [];
    const groupMap: Record<string, { date: string; revenue: number; orders: number }> = {};
    revenueOrderData.forEach(item => {
      let key = item.date;
      if (groupMode === 'month') {
        key = item.date.slice(0, 7); // yyyy-mm
      } else if (groupMode === 'year') {
        key = item.date.slice(0, 4); // yyyy
      }
      if (!groupMap[key]) groupMap[key] = { date: key, revenue: 0, orders: 0 };
      groupMap[key].revenue += item.revenue;
      groupMap[key].orders += item.orders;
    });
    // Sắp xếp tăng dần
    return Object.values(groupMap).sort((a, b) => a.date.localeCompare(b.date));
  };

  // Tính ticks cho trục Y (doanh thu) như cũ: bội số 10.000, 20.000, 50.000, 100.000...
  const getRevenueTicks = () => {
    const data = getGroupedRevenueOrderData();
    if (!data || data.length === 0) return [0];
    const max = Math.max(...data.map(d => d.revenue));
    if (max === 0) return [0];
    // Tìm step phù hợp (bội số của 10.000, 20.000, 50.000...)
    let step = 10000;
    if (max > 100000) step = 20000;
    if (max > 200000) step = 50000;
    if (max > 500000) step = 100000;
    const ticks = [];
    for (let i = 0; i <= max + step; i += step) {
      ticks.push(i);
    }
    return ticks;
  };

  // Hàm rút gọn số lớn kiểu Việt Nam
  const formatVNNumber = (value: number) => {
    if (value >= 1_000_000) return (value / 1_000_000) + 'tr';
    if (value >= 1_000) return (value / 1_000) + 'k';
    return value;
  };

  // Custom tooltip cho PieChart
  const renderPieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const { name, sold } = payload[0].payload;
      return (
        <div style={{ background: '#fff', border: '1px solid #ccc', padding: 12, borderRadius: 8, textAlign: 'center', minWidth: 120 }}>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ color: '#888' }}>{sold} sản phẩm</div>
        </div>
      );
    }
    return null;
  };

  // Custom label cho PieChart
  const renderPieLabel = ({ name, percent, cx, cy, midAngle, innerRadius, outerRadius }) => {
    const RADIAN = Math.PI / 180;
    // Tính vị trí label
    const radius = innerRadius + (outerRadius - innerRadius) * 1.2;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    // Nếu tên dài, cắt ngắn và thêm ...
    const shortName = name.length > 16 ? name.slice(0, 15) + '…' : name;
    return (
      <text x={x} y={y} fill="#333" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={13} fontWeight={500}>
        <tspan x={x} dy={-2}>{shortName}</tspan>
        <tspan x={x} dy={16}>({(percent * 100).toFixed(0)}%)</tspan>
      </text>
    );
  };

  if (loading) return <div className="dashboard-loading">Đang tải dữ liệu...</div>;
  if (error) return <div className="dashboard-error">{error}</div>;

  return (
    <div className="dashboard-page">
      <h1>Dashboard</h1>
      
      <div className="stats-boxes">
        <div className="stat-box">
          <div className="icon"><FaShoppingCart size={24} /></div>
          <div className="stat-value">{stats?.totalOrders ?? 0}</div>
          <div className="stat-label">Tổng đơn hàng</div>
        </div>
        <div className="stat-box">
          <div className="icon"><FaHourglassHalf size={24} /></div>
          <div className="stat-value">{stats?.totalPending ?? 0}</div>
          <div className="stat-label">Chờ xử lý</div>
        </div>
        <div className="stat-box">
          <div className="icon"><FaCheckCircle size={24} /></div>
          <div className="stat-value">{stats?.totalDelivered ?? 0}</div>
          <div className="stat-label">Đã giao hàng</div>
        </div>
        <div className="stat-box">
          <div className="icon"><FaTimesCircle size={24} /></div>
          <div className="stat-value">{stats?.totalCanceled ?? 0}</div>
          <div className="stat-label">Đã hủy</div>
        </div>
        <div className="stat-box">
          <div className="icon"><FaMoneyBillWave size={24} /></div>
          <div className="stat-value">{formatCurrency(stats?.totalRevenue ?? 0)}</div>
          <div className="stat-label">Tổng doanh thu</div>
        </div>
      </div>

      <div className="dashboard-charts-row" style={{ display: 'flex', gap: 24, marginBottom: 32 }}>
        <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #eee' }}>
          <h3 style={{ marginBottom: 16 }}>Doanh thu & Đơn hàng theo {groupMode === 'day' ? 'ngày' : groupMode === 'month' ? 'tháng' : 'năm'}</h3>
          <Space style={{ marginBottom: 16 }}>
            <Select
              value={groupMode}
              onChange={v => setGroupMode(v)}
              style={{ width: 120 }}
              options={[
                { value: 'day', label: 'Theo ngày' },
                { value: 'month', label: 'Theo tháng' },
                { value: 'year', label: 'Theo năm' },
              ]}
            />
          </Space>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={getGroupedRevenueOrderData()} margin={{ top: 16, right: 24, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" />
              <YAxis
                yAxisId="left"
                tickFormatter={formatVNNumber}
                allowDecimals={false}
                domain={[0, 'auto']}
                ticks={getRevenueTicks()}
              />
              <YAxis yAxisId="right" orientation="right" allowDecimals={false} domain={[0, 'auto']} tickCount={6} />
              <Tooltip formatter={(value: any) => value.toLocaleString('vi-VN')} />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="revenue" name="Doanh thu (VNĐ)" stroke="#8884d8" activeDot={{ r: 8 }} />
              <Line yAxisId="right" type="monotone" dataKey="orders" name="Số đơn hàng" stroke="#82ca9d" />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div style={{ flex: 1, background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #eee' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ margin: 0 }}>Top 5 sản phẩm bán chạy</h3>
            <Button size="small" onClick={handleRefreshTopProducts} loading={topProductsLoading}>Làm mới</Button>
          </div>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={topProducts}
                dataKey="sold"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label={renderPieLabel}
              >
                {topProducts.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={["#8884d8", "#82ca9d", "#ffc658", "#ff8042", "#8dd1e1"][idx % 5]} />
                ))}
              </Pie>
              <Tooltip content={renderPieTooltip} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <h2>Đơn Hàng Gần Đây</h2>
      
      <div className="orders-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Sản phẩm</th>
              <th>Mã đơn</th>
              <th>Ngày</th>
              <th>Khách hàng</th>
              <th>Trạng thái</th>
              <th>Giá trị</th>
            </tr>
          </thead>
          <tbody>
            {orders.length > 0 ? (
              orders.map(order => (
                <tr key={order._id}>
                  <td>{order._id.slice(-6)}</td>
                  <td>{order.product}</td>
                  <td>{order.orderNumber}</td>
                  <td>{formatDate(order.date)}</td>
                  <td>{order.customer}</td>
                  <td>
                    <span 
                      className="status-label" 
                      style={{ backgroundColor: getStatusColor(order.status) }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td>{formatCurrency(order.amount)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7}>Không có đơn hàng</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DashboardPage;