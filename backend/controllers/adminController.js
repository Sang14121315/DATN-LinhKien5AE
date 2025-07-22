const OrderService = require('../services/orderService');
const OrderDetailService = require('../services/orderDetailService');

exports.getDashboardData = async (req, res) => {
  try {
    console.log('Dashboard request from user:', req.user);
    console.log('User role:', req.user?.role);
    
    const orders = await OrderService.getAll();
    const orderDetails = await OrderDetailService.getAll();
    
    console.log('Total orders found:', orders.length);
    console.log('Total order details found:', orderDetails.length);

    const totalOrders = orders.length;
    const totalDelivered = orders.filter(order => order.status === 'completed').length;
    const totalCanceled = orders.filter(order => order.status === 'cancelled' || order.status === 'canceled').length;
    const totalPending = orders.filter(order => order.status === 'pending').length;
    const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);

    const recentOrders = orders
      .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
      .slice(0, 5)
      .map(order => {
        console.log('Processing order:', {
          _id: order._id,
          _idType: typeof order._id,
          status: order.status,
          total: order.total
        });
        // Lấy chi tiết đơn hàng cho order này
        const details = orderDetails.filter(d => d.order_id.toString() === order._id.toString());
        console.log('DEBUG: Order _id:', order._id.toString(), '| Các orderDetail:', orderDetails.map(d => d.order_id.toString()));
        console.log('DEBUG: Order _id:', order._id.toString(), '| Các detail tìm được:', details.map(d => d.name));
        
        // Lấy tên sản phẩm đầu tiên hoặc tên chung
        let productName = 'Không có sản phẩm';
        if (details.length > 0) {
          if (details.length === 1) {
            productName = details[0].name || 'Sản phẩm';
          } else {
            productName = `${details[0].name || 'Sản phẩm'} +${details.length - 1} sản phẩm khác`;
          }
        }

        // Lấy tên khách hàng
        let customerName = 'Khách hàng';
        if (order.customer && order.customer.name) {
          customerName = order.customer.name;
        } else if (order.user_id && order.user_id.name) {
          customerName = order.user_id.name;
        }

        return {
          _id: order._id.toString(),
          product: productName,
          orderNumber: order._id.toString().slice(-6),
          date: order.created_at,
          customer: customerName,
          status:
            order.status === 'completed' ? 'Đã giao hàng' :
            order.status === 'cancelled' || order.status === 'canceled' ? 'Đã hủy' :
            order.status === 'pending' ? 'Chờ xử lý' :
            'Đang xử lý',
          amount: order.total
        };
      });

    console.log('Dashboard response:', {
      totalOrders,
      totalDelivered,
      totalCanceled,
      totalPending,
      totalRevenue,
      ordersCount: recentOrders.length
    });
    
    res.json({
      totalOrders,
      totalDelivered,
      totalCanceled,
      totalPending,
      totalRevenue,
      orders: recentOrders
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({ message: error.message || 'Error fetching dashboard data' });
  }
};