const express = require('express');
const router = express.Router();
const EmailService = require('../services/emailService');

// Route test gửi email (chỉ dùng trong development)
router.post('/test-email', async (req, res) => {
  try {
    // Dữ liệu test
    const testOrder = {
      _id: 'test_order_123',
      customer: {
        name: 'Nguyễn Văn A',
        phone: '0123456789',
        email: 'test@example.com',
        address: '123 Đường ABC, Quận 1, TP.HCM'
      },
      payment_method: 'cod',
      total: 15000000,
      status: 'pending',
      created_at: new Date()
    };

    const testDetails = [
      {
        name: 'Laptop Dell Inspiron 15',
        quantity: 1,
        price: 15000000,
        img_url: 'https://via.placeholder.com/50'
      }
    ];

    const testUser = {
      _id: 'test_user_123',
      email: 'test@example.com',
      name: 'Nguyễn Văn A'
    };

    // Test gửi email xác nhận đơn hàng
    const result1 = await EmailService.sendOrderConfirmation(testOrder, testDetails, testUser);
    
    // Test gửi email thông báo cho admin
    const result2 = await EmailService.sendOrderNotificationToAdmin(testOrder, testDetails, testUser);

    res.json({
      success: true,
      message: 'Test email sent successfully',
      results: {
        orderConfirmation: result1,
        adminNotification: result2
      }
    });
  } catch (error) {
    console.error('❌ Test email error:', error);
    res.status(500).json({
      success: false,
      message: 'Test email failed',
      error: error.message
    });
  }
});

module.exports = router; 