const OrderService = require('../services/orderService');
const OrderDetailService = require('../services/orderDetailService');
const CartService = require('../services/CartService');
const UserService = require('../services/userService');
const Product = require('../models/Product'); // ✅ THÊM
const Order = require('../models/Order'); // ✅ THÊM
const Joi = require('joi');
const { createMomoPayment } = require('../services/orderService');
const { 
  sendOrderStatusUpdateEmail,
  sendOrderNotificationToAdmin,
  sendOrderConfirmationEmail
} = require('../utils/orderEmailService');

const orderSchema = Joi.object({
  payment_method: Joi.string().valid('cod', 'bank').default('cod'),
  customer: Joi.object({
    name: Joi.string().required(),
    phone: Joi.string().required(),
    email: Joi.string().allow('', null),
    address: Joi.string().required()
  }).required(),
  ward: Joi.string().required(),
  district: Joi.string().required(),
  city: Joi.string().required(),
  items: Joi.array().items(
    Joi.object({
      product_id: Joi.string().required(),
      quantity: Joi.number().min(1).required(),
      price: Joi.number().required(),
      name: Joi.string().required(),
      img_url: Joi.string().allow('', null)
    })
  ).min(1).required(),
  total: Joi.number().required()
});

module.exports = {
  getOrders: async (req, res) => {
    try {
      console.log('🔍 Backend: Getting orders...');
      console.log('🔍 Backend: User:', req.user);
      console.log('🔍 Backend: Query:', req.query);
      
      const { status, minTotal, maxTotal, sort = 'created_at', order = 'desc' } = req.query;
      const filters = {};
      
      // Nếu là user thường, chỉ trả về đơn của user đó
      if (req.user && req.user.role !== 'admin') {
        filters.user_id = req.user.id;
        console.log('🔍 Backend: Filtering for user:', req.user.id);
      } else if (req.query.user_id) {
        filters.user_id = req.query.user_id;
        console.log('🔍 Backend: Filtering for specific user:', req.query.user_id);
      } else {
        console.log('🔍 Backend: Admin access - getting all orders');
      }
      
      if (status) filters.status = status;
      if (minTotal || maxTotal) {
        filters.total = {};
        if (minTotal) filters.total.$gte = Number(minTotal);
        if (maxTotal) filters.total.$lte = Number(maxTotal);
      }
      
      console.log('🔍 Backend: Filters:', filters);
      
      // Truyền sort vào service
      const sortObj = { [sort]: order === 'asc' ? 1 : -1 };
      console.log('🔍 Backend: Sort object:', sortObj);
      
      const orders = await OrderService.getAll(filters, sortObj);
      console.log('🔍 Backend: Raw orders:', orders);
      
      const ordersWithItems = await Promise.all(
        orders.map(async (order) => {
          try {
            const details = await OrderDetailService.getByOrderId(order._id);
            const user = await UserService.getById(order.user_id);
            return {
              ...order._doc,
              items: details,
              user: user // rename for clarity
            };
          } catch (itemError) {
            console.error('❌ Backend: Error getting order details for order:', order._id, itemError);
            return {
              ...order._doc,
              items: [],
              user: null
            };
          }
        })
      );
      
      console.log('🔍 Backend: Orders with items:', ordersWithItems);
      res.status(200).json(ordersWithItems);
    } catch (error) {
      console.error('❌ Backend: Error getting orders:', error);
      res.status(500).json({ message: error.message || 'Lỗi khi lấy đơn hàng' });
    }
  },

  getOrderById: async (req, res) => {
    try {
      const order = await OrderService.getById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      const items = await OrderDetailService.getByOrderId(order._id);

      res.json({
        _id: order._id,
        customer: order.customer,
        payment_method: order.payment_method,
        total: order.total,
        status: order.status,
        created_at: order.created_at,
        updated_at: order.updated_at,
        items: items.map(item => ({
          _id: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          img_url: item.img_url
        }))
      });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Lỗi khi lấy đơn hàng' });
    }
  },

  createOrder: async (req, res) => {
    try {
      const { error } = orderSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

      const { customer, payment_method, items, total, ward, district, city } = req.body;
      const fullAddress = `${customer.address}, ${ward}, ${district}, ${city}`;

      // ✅ 1. KIỂM TRA STOCK TRƯỚC KHI TẠO ĐƠN HÀNG
      console.log('🔄 Checking stock availability...');
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(400).json({ 
            message: `Sản phẩm "${item.name}" không tồn tại` 
          });
        }
        
        if (!product.canReserve(item.quantity)) {
          const availableStock = product.stock - (product.reserved_stock || 0);
          return res.status(400).json({ 
            message: `Sản phẩm "${item.name}" không đủ hàng. Còn lại: ${availableStock}, yêu cầu: ${item.quantity}` 
          });
        }
      }

      // ✅ 2. TẠO ĐƠN HÀNG
      const order = await OrderService.create({
        user_id: userId,
        payment_method,
        total,
        status: 'pending',
        customer: {
          ...customer,
          address: fullAddress
        },
        ward,
        district,
        city
      });

      // ✅ 3. TẠO ORDER DETAILS
      const detailDocs = items.map(item => ({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        img_url: item.img_url || '',
      }));

      await OrderDetailService.createMany(detailDocs);

      // ✅ 4. RESERVE STOCK CHO TẤT CẢ ITEMS
      console.log('🔄 Reserving stock for order:', order._id);
      try {
        for (const item of items) {
          await Product.reserveStock(item.product_id, item.quantity);
          console.log(`✅ Reserved ${item.quantity} units of ${item.name}`);
        }
        
        // Đánh dấu đã reserve inventory
        await OrderService.update(order._id, { 
          inventory_reserved: true,
          updated_at: new Date()
        });
        
        console.log('✅ Stock reservation completed for order:', order._id);
      } catch (stockError) {
        console.error('❌ Error reserving stock:', stockError);
        
        // Rollback: Xóa đơn hàng và order details nếu không reserve được stock
        await OrderDetailService.deleteByOrderId(order._id);
        await OrderService.delete(order._id);
        
        return res.status(400).json({ 
          message: stockError.message || 'Không thể đặt hàng do vấn đề tồn kho' 
        });
      }

      // ✅ 5. XÓA GIỎ HÀNG SAU KHI ĐẶT HÀNG THÀNH CÔNG
      await CartService.clearCart(userId);

      // ✅ 6. GỬI EMAIL VÀ THÔNG BÁO (Nodemailer - server)
      try {
        const orderWithItems = {
          ...order._doc,
          items: detailDocs
        };
        // Gửi cho khách hàng (nếu có email)
        if (orderWithItems?.customer?.email) {
          await sendOrderConfirmationEmail(orderWithItems);
          console.log('✅ Email xác nhận đã gửi cho khách hàng');
        }
        // Gửi cho admin
        await sendOrderNotificationToAdmin(orderWithItems);
        console.log('✅ Email thông báo đã gửi cho admin');
      } catch (emailError) {
        console.error('❌ Lỗi gửi email đơn hàng mới:', emailError);
      }

      const io = req.app.get('io');
      if (io) {
        io.to(userId.toString()).emit('new-notification', {
          user_id: userId,
          content: `Đơn hàng #${order._id} đã được tạo thành công!`,
          type: 'order_placed',
          related_id: order._id,
          related_model: 'Order',
          related_action: 'view_order'
        });

        io.to('admin').emit('new-order', {
          order_id: order._id,
          user_id: userId,
          total,
          status: order.status,
          created_at: order.created_at
        });
      }

      res.status(201).json({ order, orderDetails: detailDocs });
    } catch (error) {
      console.error('❌ Lỗi tạo đơn hàng:', error);
      res.status(500).json({ message: error.message || 'Lỗi tạo đơn hàng' });
    }
  },

  updateOrder: async (req, res) => {
    try {
      const order = await OrderService.getById(req.params.id);
      if (!order) return res.status(404).json({ message: 'Không tìm thấy đơn hàng' });

      // Chỉ cho phép cập nhật trạng thái theo hướng tiến lên, không được quay lại hay bỏ qua bước
      const canonicalizeStatus = (status) => {
        if (status === 'cancelled') return 'canceled';
        if (status === 'delivered') return 'completed';
        return status;
      };

      const allowedTransitions = {
        pending: ['confirmed', 'canceled', 'paid', 'processing'],
        confirmed: ['shipping', 'canceled'],
        paid: ['confirmed', 'shipping'],
        processing: ['confirmed', 'shipping', 'canceled'],
        shipping: ['completed'],
        completed: [],
        canceled: []
      };

      const oldStatus = canonicalizeStatus(order.status);
      const requestedStatus = canonicalizeStatus(req.body.status);

      if (!requestedStatus) {
        return res.status(400).json({ message: 'Thiếu trạng thái cần cập nhật' });
      }

      // Không cho phép sửa đơn đã hoàn thành hoặc đã hủy
      if (oldStatus === 'completed' || oldStatus === 'canceled') {
        return res.status(400).json({ message: 'Đơn hàng đã kết thúc, không thể cập nhật trạng thái' });
      }

      // Yêu cầu trạng thái mới khác trạng thái cũ
      if (requestedStatus === oldStatus) {
        return res.status(400).json({ message: 'Trạng thái mới phải khác trạng thái hiện tại' });
      }

      // Kiểm tra bước chuyển hợp lệ
      const nextStatuses = allowedTransitions[oldStatus] || [];
      if (!nextStatuses.includes(requestedStatus)) {
        return res.status(400).json({ 
          message: `Chuyển trạng thái không hợp lệ: từ "${oldStatus}" chỉ có thể sang ${nextStatuses.length ? nextStatuses.map(s => `"${s}"`).join(', ') : 'không trạng thái nào'}`
        });
      }

      // ✅ XỬ LÝ INVENTORY THEO TRẠNG THÁI MỚI
      console.log(`🔄 Updating order ${req.params.id} from ${oldStatus} to ${requestedStatus}`);

      if (requestedStatus === 'canceled') {
        // ✅ HỦY ĐƠN HÀNG → HOÀN TRẢ STOCK
        console.log('🔄 Order canceled - releasing reserved stock...');
        try {
          await Order.releaseInventory(req.params.id);
          console.log('✅ Released reserved stock for canceled order');
        } catch (inventoryError) {
          console.error('❌ Error releasing inventory:', inventoryError);
          // Không dừng quá trình cập nhật nếu có lỗi inventory
        }
      } else if (requestedStatus === 'completed') {
        // ✅ HOÀN THÀNH ĐƠN HÀNG → XÁC NHẬN BÁN
        console.log('🔄 Order completed - confirming inventory...');
        try {
          await Order.confirmInventory(req.params.id);
          console.log('✅ Confirmed inventory for completed order');
        } catch (inventoryError) {
          console.error('❌ Error confirming inventory:', inventoryError);
        }
      }

      // ✅ CẬP NHẬT TRẠNG THÁI ĐƠN HÀNG
      const updated = await OrderService.update(req.params.id, { 
        status: requestedStatus, 
        updated_at: new Date() 
      });

      // ✅ GỬI EMAIL CẬP NHẬT TRẠNG THÁI (Nodemailer - server)
      try {
        const details = await OrderDetailService.getByOrderId(order._id);
        const orderWithItems = { ...order._doc, items: details };
        if (orderWithItems?.customer?.email) {
          await sendOrderStatusUpdateEmail(orderWithItems, oldStatus, requestedStatus);
          console.log('✅ Email cập nhật trạng thái đã gửi cho khách hàng');
        }
      } catch (emailError) {
        console.error('❌ Lỗi gửi email cập nhật trạng thái:', emailError);
      }

      // ✅ TÍNH ĐIỂM LOYALTY KHI HOÀN THÀNH
      if (requestedStatus === 'completed' && order.user_id) {
        const User = require('../models/User');
        const LoyaltyTransaction = require('../models/LoyaltyTransaction');
        const user = await User.findById(order.user_id);
        if (user) {
          // Tính điểm: ví dụ 1 điểm cho mỗi 10.000đ
          const earnPoints = Math.floor(order.total / 10000);
          user.loyaltyPoints = (user.loyaltyPoints || 0) + earnPoints;
          user.totalSpent = (user.totalSpent || 0) + (order.total || 0);
          // Xét cấp bậc thành viên
          let newLevel = 'Bạc';
          if (user.totalSpent >= 20000000) newLevel = 'Kim cương';
          else if (user.totalSpent >= 5000000) newLevel = 'Vàng';
          user.memberLevel = newLevel;
          await user.save();
          // Ghi lịch sử giao dịch điểm
          await LoyaltyTransaction.create({
            user_id: user._id,
            type: 'earn',
            points: earnPoints,
            description: `Tích điểm từ đơn hàng #${order._id}`
          });
        }
      }

      res.json(updated);
    } catch (error) {
      console.error('❌ Error updating order:', error);
      res.status(500).json({ message: error.message || 'Lỗi cập nhật đơn hàng' });
    }
  },

  deleteOrder: async (req, res) => {
    try {
      // ✅ TRƯỚC KHI XÓA ĐƠN HÀNG → HOÀN TRẢ STOCK NẾU CẦN
      console.log('🔄 Deleting order - checking inventory status...');
      try {
        await Order.releaseInventory(req.params.id);
        console.log('✅ Released inventory before deleting order');
      } catch (inventoryError) {
        console.error('❌ Error releasing inventory before delete:', inventoryError);
        // Tiếp tục xóa ngay cả khi có lỗi inventory
      }

      await OrderService.delete(req.params.id);
      res.json({ message: 'Đã xóa đơn hàng' });
    } catch (error) {
      res.status(500).json({ message: error.message || 'Lỗi khi xóa đơn hàng' });
    }
  },

  createMomoOrder: async (req, res) => {
    try {
      const { error } = orderSchema.validate(req.body);
      if (error) return res.status(400).json({ message: error.details[0].message });

      const userId = req.user?.id;
      if (!userId) return res.status(401).json({ message: 'Bạn chưa đăng nhập' });

      const { customer, payment_method, items, total, ward, district, city } = req.body;
      const fullAddress = `${customer.address}, ${ward}, ${district}, ${city}`;

      // ✅ 1. KIỂM TRA STOCK TRƯỚC KHI TẠO ĐƠN HÀNG MOMO
      console.log('🔄 Checking stock for MoMo order...');
      for (const item of items) {
        const product = await Product.findById(item.product_id);
        if (!product) {
          return res.status(400).json({ 
            message: `Sản phẩm "${item.name}" không tồn tại` 
          });
        }
        
        if (!product.canReserve(item.quantity)) {
          const availableStock = product.stock - (product.reserved_stock || 0);
          return res.status(400).json({ 
            message: `Sản phẩm "${item.name}" không đủ hàng. Còn lại: ${availableStock}, yêu cầu: ${item.quantity}` 
          });
        }
      }

      // ✅ 2. TẠO ĐƠN HÀNG MOMO
      const order = await OrderService.create({
        user_id: userId,
        payment_method,
        total,
        status: 'pending',
        customer: {
          ...customer,
          address: fullAddress
        },
        ward,
        district,
        city
      });

      // ✅ 3. TẠO ORDER DETAILS
      const detailDocs = items.map(item => ({
        order_id: order._id,
        product_id: item.product_id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        img_url: item.img_url || '',
      }));

      await OrderDetailService.createMany(detailDocs);

      // ✅ 4. RESERVE STOCK CHO MOMO ORDER
      console.log('🔄 Reserving stock for MoMo order:', order._id);
      try {
        for (const item of items) {
          await Product.reserveStock(item.product_id, item.quantity);
          console.log(`✅ Reserved ${item.quantity} units of ${item.name} for MoMo order`);
        }
        
        // Đánh dấu đã reserve inventory
        await OrderService.update(order._id, { 
          inventory_reserved: true,
          updated_at: new Date()
        });
        
        console.log('✅ Stock reservation completed for MoMo order:', order._id);
      } catch (stockError) {
        console.error('❌ Error reserving stock for MoMo order:', stockError);
        
        // Rollback: Xóa đơn hàng và order details
        await OrderDetailService.deleteByOrderId(order._id);
        await OrderService.delete(order._id);
        
        return res.status(400).json({ 
          message: stockError.message || 'Không thể đặt hàng MoMo do vấn đề tồn kho' 
        });
      }

      // ✅ 5. XÓA GIỎ HÀNG NGAY KHI TẠO ĐƠN HÀNG MOMO THÀNH CÔNG
      console.log('🛒 Creating MoMo order - Clearing cart for user:', userId);
      try {
        await CartService.clearCart(userId);
        console.log('✅ Cart cleared successfully when creating MoMo order');
      } catch (cartError) {
        console.error('❌ Error clearing cart when creating MoMo order:', cartError);
      }

      // Email xác nhận MoMo sẽ được gửi từ frontend (EmailJS)
      console.log('📧 Email xác nhận MoMo sẽ được gửi từ frontend (EmailJS)');

      // ✅ 6. TẠO LINK THANH TOÁN MOMO VỚI ORDERID THỰC
      const orderId = order._id.toString();
      const redirectUrl = 'http://localhost:5173/momo-callback';
      const ipnUrl = process.env.MOMO_IPN_URL || 'http://localhost:5000/api/momo/webhook';
      
      console.log('🔗 MoMo - Redirect URL:', redirectUrl);
      console.log('🔗 MoMo - IPN URL:', ipnUrl);
      console.log('🔗 MoMo - Order ID:', orderId);
      
      const momoRes = await createMomoPayment(orderId, total, redirectUrl, ipnUrl);
      
      console.log('🔗 MoMo - Response:', momoRes);
      
      if (momoRes && momoRes.payUrl) {
        res.json({ 
          payUrl: momoRes.payUrl, 
          orderId: orderId,
          order: order,
          orderDetails: detailDocs 
        });
      } else {
        // ✅ NẾU TẠO LINK THANH TOÁN THẤT BẠI → HOÀN TRẢ STOCK VÀ XÓA ĐƠN HÀNG
        console.log('❌ MoMo payment creation failed - rolling back...');
        try {
          await Order.releaseInventory(order._id);
          console.log('✅ Released reserved stock due to MoMo payment creation failure');
        } catch (releaseError) {
          console.error('❌ Error releasing stock during MoMo rollback:', releaseError);
        }
        
        await OrderDetailService.deleteByOrderId(order._id);
        await OrderService.delete(order._id);
        res.status(500).json({ message: 'Không tạo được link thanh toán MoMo' });
      }
    } catch (err) {
      console.error('❌ Lỗi tạo đơn hàng Momo:', err);
      res.status(500).json({ message: err.message || 'Lỗi tạo đơn hàng Momo' });
    }
  },

  momoWebhook: async (req, res) => {
    try {
      console.log('📞 MoMo webhook - Request received');
      console.log('📞 MoMo webhook - Headers:', req.headers);
      console.log('📞 MoMo webhook - Body:', req.body);
      
      const { orderId, resultCode, message } = req.body;
      console.log('📞 MoMo webhook received:', { orderId, resultCode, message });
      
      if (resultCode === 0) {
        // ✅ THANH TOÁN THÀNH CÔNG
        console.log('✅ MoMo webhook - Payment successful, processing...');
        try {
          // Cập nhật trạng thái đơn hàng thành 'paid'
          const updatedOrder = await OrderService.update(orderId, { 
            status: 'paid',
            updated_at: new Date()
          });
          
          console.log('✅ MoMo webhook - Order updated:', updatedOrder);
          
          if (updatedOrder) {
            // Email thông báo thanh toán thành công sẽ được gửi từ frontend (EmailJS)
            console.log('📧 Email thông báo thanh toán thành công sẽ được gửi từ frontend (EmailJS)');

            // Gửi thông báo realtime
            const io = req.app.get('io');
            if (io) {
              io.to(updatedOrder.user_id.toString()).emit('new-notification', {
                user_id: updatedOrder.user_id,
                content: `Đơn hàng #${orderId} đã được thanh toán thành công!`,
                type: 'payment_success',
                related_id: orderId,
                related_model: 'Order',
                related_action: 'view_order'
              });

              io.to('admin').emit('order-updated', {
                order_id: orderId,
                user_id: updatedOrder.user_id,
                status: 'paid',
                updated_at: new Date()
              });
            }
            
            console.log('✅ MoMo payment successful for order:', orderId);
          } else {
            console.error('❌ Không tìm thấy đơn hàng:', orderId);
          }
        } catch (error) {
          console.error('❌ Lỗi xử lý webhook MoMo:', error);
        }
      } else {
        // ✅ THANH TOÁN THẤT BẠI → HOÀN TRẢ STOCK
        console.log('❌ MoMo payment failed for order:', orderId, 'with code:', resultCode);
        
        try {
          // Cập nhật trạng thái đơn hàng thành 'failed'
          await OrderService.update(orderId, { 
            status: 'failed',
            updated_at: new Date()
          });
          
          // Hoàn trả stock đã reserve
          console.log('🔄 MoMo payment failed - releasing reserved stock...');
          await Order.releaseInventory(orderId);
          console.log('✅ Released reserved stock for failed MoMo payment');
          
        } catch (error) {
          console.error('❌ Lỗi cập nhật trạng thái đơn hàng thất bại:', error);
        }
      }
      
      console.log('📞 MoMo webhook - Sending OK response');
      res.status(200).send('OK');
    } catch (err) {
      console.error('❌ Webhook error:', err);
      res.status(500).send('Webhook error');
    }
  }
};