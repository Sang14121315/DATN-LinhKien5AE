import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from "vn-provinces";
import { fetchCoupons } from "@/api/couponAPI";
import "@/styles/pages/user/checkoutPage.scss";
import { useNavigate } from "react-router-dom";
import { createMomoOrder } from '@/api/momoAPI';
import { sendOrderConfirmationEmail } from '@/services/emailService';
import { Row, Col, Card, Form, Input, Select, Radio, Button, Divider, Space, Typography, Alert, Modal } from 'antd';
import { UserOutlined, PhoneOutlined, MailOutlined, EnvironmentOutlined, ShoppingCartOutlined, CreditCardOutlined, BankOutlined, CheckCircleOutlined, CloseCircleOutlined } from '@ant-design/icons';

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart, forceClearCart, reloadCart } = useCart();
  const { addOrder } = useOrders();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);
  const [availableCoupons, setAvailableCoupons] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    city: "",
    district: "",
    ward: "",
    address: "",
  });

  const [formErrors, setFormErrors] = useState({
    name: false,
    phone: false,
    city: false,
    district: false,
    ward: false,
    address: false,
  });

  const navigate = useNavigate();

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  useEffect(() => {
    setProvinces(getProvinces());
  }, []);

  useEffect(() => {
    const selectedProvince = provinces.find(p => p.name === formData.city);
    setDistricts(selectedProvince ? getDistrictsByProvinceCode(selectedProvince.code) : []);
    setFormData(prev => ({ ...prev, district: "", ward: "" }));
  }, [formData.city]);

  useEffect(() => {
    const selectedDistrict = districts.find(d => d.name === formData.district);
    setWards(selectedDistrict ? getWardsByDistrictCode(selectedDistrict.code) : []);
    setFormData(prev => ({ ...prev, ward: "" }));
  }, [formData.district]);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const coupons = await fetchCoupons();
        setAvailableCoupons(coupons);
        console.log('📋 Available coupons:', coupons);
        
        // Debug: Kiểm tra từng voucher
        const currentSubtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
        coupons.forEach((coupon: any, index: number) => {
          const now = new Date();
          const startDate = new Date(coupon.start_date);
          const endDate = new Date(coupon.end_date);
          const isActive = coupon.is_active !== false;
          const isValidTime = startDate <= now && endDate >= now;
          const isValidForOrder = !coupon.min_order_value || currentSubtotal >= coupon.min_order_value;
          
          console.log(`🔍 Voucher ${index + 1}:`, {
            code: coupon.code,
            isActive,
            isValidTime,
            isValidForOrder,
            startDate: startDate.toLocaleDateString(),
            endDate: endDate.toLocaleDateString(),
            minOrderValue: coupon.min_order_value,
            currentSubtotal: currentSubtotal,
            discountType: coupon.discount_type,
            discountValue: coupon.discount_value
          });
        });
      } catch (err) {
        console.error('❌ Lỗi khi tải voucher:', err);
      }
    };
    loadCoupons();
  }, [cartItems]);

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const total = subtotal - discount;

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: false }));
  };

  const validateForm = () => {
    const errors = {
      name: !formData.name.trim(),
      phone: !formData.phone.trim(),
      city: !formData.city,
      district: !formData.district,
      ward: !formData.ward,
      address: !formData.address.trim(),
    };
    setFormErrors(errors);
    return !Object.values(errors).some(Boolean);
  };

  const handleApplyCoupon = (selectedCoupon: any) => {
    if (!selectedCoupon) {
      setCoupon(null);
      setDiscount(0);
      setCouponCode("");
      return;
    }

    try {
      const now = new Date();
      const startDate = new Date(selectedCoupon.start_date);
      const endDate = new Date(selectedCoupon.end_date);
      
      // Kiểm tra thời gian hiệu lực
      if (startDate > now || endDate < now) {
        alert('Voucher chưa đến hạn hoặc đã hết hạn');
        return;
      }

      // Kiểm tra điều kiện tối thiểu
      if (selectedCoupon.min_order_value && subtotal < selectedCoupon.min_order_value) {
        alert(`Đơn hàng phải tối thiểu ${selectedCoupon.min_order_value.toLocaleString()} ₫ để áp dụng voucher`);
        return;
      }

      // Tính toán giảm giá
      let discountAmount = 0;
      if (selectedCoupon.discount_type === 'percentage') {
        // Giảm theo phần trăm
        discountAmount = Math.round((subtotal * selectedCoupon.discount_value) / 100);
      } else {
        // Giảm theo số tiền cố định
        discountAmount = selectedCoupon.discount_value || 0;
      }

      // Đảm bảo giảm giá không vượt quá tổng tiền
      discountAmount = Math.min(discountAmount, subtotal);

      setCoupon(selectedCoupon);
      setCouponCode(selectedCoupon.code);
      setDiscount(discountAmount);
      
      console.log('✅ Voucher applied:', {
        code: selectedCoupon.code,
        discountAmount,
        subtotal,
        total: subtotal - discountAmount
      });
    } catch (error) {
      console.error('❌ Error applying voucher:', error);
      alert('Có lỗi khi áp dụng voucher');
    }
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      setShowError(true);
      setShowSuccess(false);
      return;
    }

    // Debug: Kiểm tra token trước khi đặt hàng
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    console.log('🔍 Checkout - Token before order:', token);
    console.log('🔍 Checkout - User before order:', user);
    console.log('🔍 Checkout - Token length:', token?.length);
    console.log('🔍 Checkout - Token starts with:', token?.substring(0, 20));
    console.log('🔍 Checkout - All localStorage keys:', Object.keys(localStorage));

    // Kiểm tra xem token có hợp lệ không
    if (!token) {
      alert('Bạn chưa đăng nhập. Vui lòng đăng nhập lại.');
      return;
    }

    const payload: any = {
      payment_method: paymentMethod,
      total,
      city: formData.city,
      district: formData.district,
      ward: formData.ward,
      customer: {
        name: formData.name,
        phone: formData.phone,
        email: formData.email || '',
        address: formData.address,
      },
      items: cartItems.map(item => ({
        product_id: item._id,
        quantity: item.quantity,
        price: item.price,
        name: item.name,
        img_url: item.img_url || '',
      }))
    };

    console.log('🔍 Checkout - Payload:', payload);

    try {
      if (paymentMethod === 'bank') {
        console.log('🔍 Checkout - Creating MoMo order...');
        // Gọi API tạo đơn hàng Momo
        const res = await createMomoOrder(payload);
        console.log('🔍 Checkout - MoMo response:', res);
        if (res && res.payUrl) {
          // Gửi email xác nhận đơn hàng MoMo
          try {
            console.log('📧 Sending MoMo order confirmation email...');
            const orderData = {
              _id: res.orderId || 'MOMO_ORDER_' + Date.now(),
              customer: {
                name: formData.name,
                email: formData.email || '',
                phone: formData.phone,
                address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`
              },
              total: total,
              payment_method: paymentMethod,
              status: 'pending',
              created_at: new Date().toISOString()
            };

            const emailResult = await sendOrderConfirmationEmail(orderData);
            if (emailResult.success) {
              console.log('✅ MoMo order confirmation email sent successfully!');
            } else {
              console.error('❌ Failed to send MoMo order confirmation email:', emailResult.error);
            }
          } catch (emailError) {
            console.error('❌ Error sending MoMo order confirmation email:', emailError);
          }

          // Xóa giỏ hàng ngay khi tạo đơn hàng MoMo thành công
          console.log('✅ Checkout - MoMo order created, clearing cart...');
          console.log('✅ Checkout - Cart items before clear:', cartItems);
          forceClearCart();
          console.log('✅ Checkout - Cart cleared, reloading cart...');
          await reloadCart();
          console.log('✅ Checkout - Cart reloaded, redirecting to MoMo...');
          
          // Đợi một chút để đảm bảo giỏ hàng được xóa
          setTimeout(() => {
            // Redirect đến trang thanh toán MoMo
            window.location.href = res.payUrl;
          }, 100);
          return;
        } else {
          alert('Không tạo được link thanh toán Momo');
          return;
        }
      } else {
        console.log('🔍 Checkout - Creating COD order...');
        // COD logic cũ
        const orderResult = await addOrder(payload);
        forceClearCart();
        setShowSuccess(true);
        setShowError(false);

        // Gửi email xác nhận đơn hàng
        try {
          console.log('📧 Sending order confirmation email...');
          const orderData = {
            _id: orderResult?._id || 'ORDER_' + Date.now(),
            customer: {
              name: formData.name,
              email: formData.email || '',
              phone: formData.phone,
              address: `${formData.address}, ${formData.ward}, ${formData.district}, ${formData.city}`
            },
            items: cartItems, // Thêm danh sách sản phẩm
            total: total,
            payment_method: paymentMethod,
            status: 'pending',
            created_at: new Date().toISOString()
          };

          const emailResult = await sendOrderConfirmationEmail(orderData);
          if (emailResult.success) {
            console.log('✅ Order confirmation email sent successfully!');
          } else {
            console.error('❌ Failed to send order confirmation email:', emailResult.error);
          }
        } catch (emailError) {
          console.error('❌ Error sending order confirmation email:', emailError);
        }
      }
    } catch (error: any) {
      console.error('❌ Checkout - Error when placing order:', error?.response?.data || error.message);
      console.error('❌ Checkout - Full error object:', error);
      alert(error?.response?.data?.message || 'Đặt hàng thất bại');
      setShowSuccess(false);
      setShowError(true);
    }
  };

  return (
    <div className="checkout-page" style={{       
      minHeight: '100vh',
      padding: '20px'
    }}>
      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto',
        background: '#fff',
        borderRadius: '16px',
        boxShadow: '0 20px 40px rgba(0,0,0,0.1)',
        overflow: 'hidden'
      }}>
                 <div style={{
           background: 'white',
           color: 'black',
           padding: '32px',
           textAlign: 'center',
           border: '2px solid black',
           borderRadius: '16px 16px 0 0'
         }}>
           <Typography.Title level={1} style={{ 
             color: 'black', 
             margin: 0,
             fontSize: '32px',
             fontWeight: 'bold'
           }}>
             🧾 Thanh toán
           </Typography.Title>
           <Typography.Text style={{ color: 'black', fontSize: '16px' }}>
             Hoàn tất đơn hàng của bạn
           </Typography.Text>
         </div>
        
        <div style={{ padding: '32px' }}>
          <Row gutter={[32, 32]}>
            {/* Thông tin khách hàng */}
            <Col xs={24} lg={14}>
              <Card 
                title={
                  <Space>
                    <UserOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Thông tin khách hàng</span>
                  </Space>
                }
                className="customer-info-card"
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                headStyle={{
                  background: '#f8f9fa',
                  borderBottom: '2px solid #667eea',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Form layout="vertical">
                  <Row gutter={[16, 16]}>
                    <Col xs={24} sm={12}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Họ và tên</span>}
                        validateStatus={formErrors.name ? 'error' : ''}
                        help={formErrors.name ? 'Phải nhập họ và tên' : ''}
                      >
                        <Input
                          prefix={<UserOutlined style={{ color: '#667eea' }} />}
                          placeholder="Họ và tên *"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={12}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Số điện thoại</span>}
                        validateStatus={formErrors.phone ? 'error' : ''}
                        help={formErrors.phone ? 'Phải nhập số điện thoại' : ''}
                      >
                        <Input
                          prefix={<PhoneOutlined style={{ color: '#667eea' }} />}
                          placeholder="Điện thoại *"
                          name="phone"
                          value={formData.phone}
                          onChange={handleChange}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24}>
                      <Form.Item label={<span style={{ fontWeight: '600' }}>Email</span>}>
                        <Input
                          prefix={<MailOutlined style={{ color: '#667eea' }} />}
                          placeholder="Email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Tỉnh/Thành phố</span>}
                        validateStatus={formErrors.city ? 'error' : ''}
                        help={formErrors.city ? 'Phải chọn tỉnh/thành phố' : ''}
                      >
                        <Select
                          placeholder="Tỉnh / Thành phố *"
                          value={formData.city || undefined}
                          onChange={(value) => handleChange({ target: { name: 'city', value } } as any)}
                          disabled={provinces.length === 0}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
              {provinces.map((pv) => (
                            <Select.Option key={pv.code} value={pv.name}>
                              {pv.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Quận/Huyện</span>}
                        validateStatus={formErrors.district ? 'error' : ''}
                        help={formErrors.district ? 'Phải chọn quận/huyện' : ''}
                      >
                        <Select
                          placeholder="Quận / Huyện *"
                          value={formData.district || undefined}
                          onChange={(value) => handleChange({ target: { name: 'district', value } } as any)}
                          disabled={!formData.city}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
              {districts.map((dt) => (
                            <Select.Option key={dt.code} value={dt.name}>
                              {dt.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24} sm={8}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Phường/Xã</span>}
                        validateStatus={formErrors.ward ? 'error' : ''}
                        help={formErrors.ward ? 'Phải chọn phường/xã' : ''}
                      >
                        <Select
                          placeholder="Phường / Xã *"
                          value={formData.ward || undefined}
                          onChange={(value) => handleChange({ target: { name: 'ward', value } } as any)}
                          disabled={!formData.district}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        >
              {wards.map((wd) => (
                            <Select.Option key={wd.code} value={wd.name}>
                              {wd.name}
                            </Select.Option>
                          ))}
                        </Select>
                      </Form.Item>
                    </Col>
                    
                    <Col xs={24}>
                      <Form.Item 
                        label={<span style={{ fontWeight: '600' }}>Địa chỉ</span>}
                        validateStatus={formErrors.address ? 'error' : ''}
                        help={formErrors.address ? 'Phải nhập địa chỉ' : ''}
                      >
                        <Input
                          prefix={<EnvironmentOutlined style={{ color: '#667eea' }} />}
                          placeholder="Địa chỉ *"
                          name="address"
                          value={formData.address}
                          onChange={handleChange}
                          size="large"
                          style={{ borderRadius: '8px' }}
                        />
                      </Form.Item>
                    </Col>
                  </Row>
                </Form>
              </Card>
            </Col>

            {/* Thông tin đơn hàng */}
            <Col xs={24} lg={10}>
              <Card 
                title={
                  <Space>
                    <ShoppingCartOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Thông tin đơn hàng</span>
                  </Space>
                }
                className="order-summary-card"
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none',
                  marginBottom: '24px'
                }}
                headStyle={{
                  background: '#f8f9fa',
                  borderBottom: '2px solid #667eea',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                {/* Danh sách sản phẩm */}
                <div style={{ marginBottom: 24 }}>
          {cartItems.map((item) => (
                    <Card 
                      key={item._id} 
                      size="small" 
                      style={{ 
                        marginBottom: 12,
                        borderRadius: '8px',
                        border: '1px solid #f0f0f0'
                      }}
                      bodyStyle={{ padding: '16px' }}
                    >
                      <Row align="middle" gutter={16}>
                        <Col xs={8} sm={6} md={4}>
                          <div style={{
                            width: '100%',
                            height: '80px',
                            borderRadius: '8px',
                            border: '2px solid #f0f0f0',
                            overflow: 'hidden',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: '#f8f9fa'
                          }}>
                            <img 
                              src={item.img_url || '/img/sp1.png'} 
                              alt={item.name} 
                              style={{ 
                                width: '100%', 
                                height: '100%', 
                                objectFit: 'contain',
                                maxWidth: '100%',
                                maxHeight: '100%'
                              }}
                              onError={(e) => {
                                e.currentTarget.src = '/img/sp1.png';
                              }}
                            />
                          </div>
                        </Col>
                        <Col xs={16} sm={18} md={20}>
              <div>
                            <div style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
                              {item.name}
                            </div>
                            <div style={{ color: '#666', fontSize: '14px' }}>
                              Số lượng: {item.quantity} | Giá: {item.price.toLocaleString()} ₫
              </div>
            </div>
                        </Col>
                      </Row>
                    </Card>
                  ))}
                </div>

                {/* Mã giảm giá */}
                <Card 
                  size="small" 
                  title={
                    <span style={{ fontWeight: '600' }}>Mã giảm giá</span>
                  }
                  style={{ 
                    borderRadius: '8px',
                    border: '1px solid #f0f0f0'
                  }}
                >
                    <Row gutter={[12, 12]} align="middle">
                      <Col xs={14} sm={16} md={18}>
                        <Select
                          placeholder="Chọn voucher cho đơn hàng của bạn..."
                          value={couponCode}
                          onChange={(value) => {
                            setCouponCode(value);
                            const selectedCoupon = availableCoupons.find(c => c.code === value);
                            handleApplyCoupon(selectedCoupon);
                          }}
                          style={{ borderRadius: '8px', width: '100%' }}
                          size="large"
                          allowClear
                          notFoundContent={
                            <div style={{ padding: '8px', textAlign: 'center', color: '#666' }}>
                              Không có voucher phù hợp cho đơn hàng này
                            </div>
                          }
                        >
                          {availableCoupons
                            .filter(c => {
                              const now = new Date();
                              const startDate = new Date(c.start_date);
                              const endDate = new Date(c.end_date);
                              const isActive = c.is_active !== false; // Mặc định là true nếu không có trường này
                              
                              // Chỉ hiển thị mã đang kích hoạt và trong thời gian hiệu lực
                              return isActive && startDate <= now && endDate >= now;
                            })
                            .filter(c => !c.min_order_value || subtotal >= c.min_order_value)
                            .map(c => (
                              <Select.Option key={c.code} value={c.code}>
                                {c.code}
                              </Select.Option>
                            ))}
                        </Select>
                      </Col>
                      <Col xs={10} sm={8} md={6}>
                        <Button 
                          type="primary" 
                          onClick={() => {
                            const selectedCoupon = availableCoupons.find(c => c.code === couponCode);
                            handleApplyCoupon(selectedCoupon);
                          }}
                          size="large"
                          style={{ 
                            borderRadius: '8px',
                            background: '#667eea',
                            borderColor: '#667eea',
                            width: '100%'
                          }}
                        >
                          Áp dụng
                        </Button>
                      </Col>
                    </Row>
                    {(() => {
                      const validCoupons = availableCoupons.filter(c => {
                        const now = new Date();
                        const startDate = new Date(c.start_date);
                        const endDate = new Date(c.end_date);
                        const isActive = c.is_active !== false;
                        return isActive && startDate <= now && endDate >= now;
                      }).filter(c => !c.min_order_value || subtotal >= c.min_order_value);
                      
                                             if (validCoupons.length === 0) {
                         return (
                           <Alert
                             message="Không có voucher nào phù hợp với đơn hàng hiện tại"
                             type="info"
                             showIcon
                             style={{ marginTop: 12, borderRadius: '8px' }}
                           />
                         );
                       }
                      return null;
                    })()}
                    {coupon && (
                      <Alert
                        message={`Đã áp dụng mã: ${coupon.code} (-${discount.toLocaleString()} ₫)`}
                        type="success"
                        showIcon
                        style={{ marginTop: 12, borderRadius: '8px' }}
                      />
                    )}
                </Card>
              </Card>

              {/* Tổng tiền */}
              <Card 
                title={
                  <Space>
                    <ShoppingCartOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Tổng tiền</span>
                  </Space>
                }
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                headStyle={{
                  background: '#f8f9fa',
                  borderBottom: '2px solid #667eea',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Space direction="vertical" style={{ width: '100%' }}>
                  <Row justify="space-between" style={{ fontSize: '16px' }}>
                    <span>Tổng đơn hàng:</span>
                    <span>{subtotal.toLocaleString()} ₫</span>
                  </Row>
                  <Row justify="space-between" style={{ fontSize: '16px' }}>
                    <span>Giảm giá:</span>
                    <span style={{ color: '#ff4d4f' }}>-{discount.toLocaleString()} ₫</span>
                  </Row>
                  <Row justify="space-between" style={{ fontSize: '16px' }}>
                    <span>Phí vận chuyển:</span>
                    <span>0 ₫</span>
                  </Row>
                  <Divider style={{ margin: '16px 0', borderColor: '#667eea' }} />
                  <Row justify="space-between">
                    <span style={{ fontWeight: 'bold', fontSize: '20px' }}>Tổng tiền:</span>
                    <span style={{ fontWeight: 'bold', fontSize: '20px', color: '#667eea' }}>
                      {total.toLocaleString()} ₫
                    </span>
                  </Row>
                </Space>
              </Card>
            </Col>
          </Row>

          {/* Hình thức thanh toán */}
          <Row style={{ marginTop: 32 }}>
            <Col xs={24}>
              <Card 
                title={
                  <Space>
                    <CreditCardOutlined style={{ color: '#667eea', fontSize: '18px' }} />
                    <span style={{ fontSize: '18px', fontWeight: 'bold' }}>Hình thức thanh toán</span>
                  </Space>
                }
                className="payment-methods-card"
                style={{ 
                  borderRadius: '12px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  border: 'none'
                }}
                headStyle={{
                  background: '#f8f9fa',
                  borderBottom: '2px solid #667eea',
                  borderRadius: '12px 12px 0 0'
                }}
              >
                <Row gutter={[32, 24]}>
                  <Col xs={24} lg={16}>
                    <Radio.Group 
                      value={paymentMethod} 
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Radio value="cod" style={{ 
                          width: '100%', 
                          padding: '16px', 
                          border: paymentMethod === 'cod' ? '2px solid #667eea' : '1px solid #d9d9d9', 
                          borderRadius: '12px',
                          background: paymentMethod === 'cod' ? '#f0f4ff' : '#fff',
                          transition: 'all 0.3s ease'
                        }}>
                          <Space>
                            <span style={{ fontSize: '24px' }}>💵</span>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Thanh toán khi nhận hàng (COD)</div>
                              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Chuyển phát nhanh - Thanh toán khi nhận hàng</div>
</div>
                          </Space>
                        </Radio>
                        
                        <Radio value="bank" style={{ 
                          width: '100%', 
                          padding: '16px', 
                          border: paymentMethod === 'bank' ? '2px solid #007BFF' : '1px solid #F5F5F5', 
                          borderRadius: '12px',
                          background: paymentMethod === 'bank' ? '#F0F4FF' : '#FFFFFF',
                          transition: 'all 0.3s ease'
                        }}>
                          <Space>
                            <span style={{ fontSize: '24px' }}>🏦</span>
                            <div>
                              <div style={{ fontWeight: 'bold', fontSize: '16px' }}>Chuyển khoản ngân hàng</div>
                              <div style={{ fontSize: '14px', color: '#666', marginTop: '4px' }}>Thanh toán qua MoMo hoặc chuyển khoản trực tiếp</div>
          </div>
                          </Space>
                        </Radio>
                      </Space>
                    </Radio.Group>
                  </Col>

                  <Col xs={24} lg={8}>
                    {/* Nút hành động */}
                    <Card 
                      size="small" 
                      style={{ 
                        borderRadius: '12px',
                        border: '2px solid #007BFF',
                        background: 'transparent'
                      }}
                    >
                      <Space direction="vertical" style={{ width: '100%' }}>
                        <Button 
                          type="default" 
                          block 
                          onClick={() => navigate("/")}
                          icon={<ShoppingCartOutlined />}
                          size="large"
                          style={{ 
                            borderRadius: '8px',
                            height: '48px',
                            fontSize: '16px'
                          }}
                        >
                          Tiếp tục mua hàng
                        </Button>
                        <Button 
                          type="primary" 
                          block 
                          onClick={handleSubmit}
                          size="large"
                          style={{ 
                            height: '56px',
                            fontSize: '18px',
                            fontWeight: 'bold',
                            borderRadius: '8px',
                            background: '#007BFF',
                            borderColor: '#007BFF'
                          }}
                        >
                          Xác nhận & Đặt hàng
                        </Button>
                      </Space>
                    </Card>
                  </Col>
                </Row>
              </Card>
            </Col>
          </Row>
        </div>
      </div>

      <Modal
        title={
          <Space>
            <CheckCircleOutlined style={{ color: '#52c41a' }} />
            Đặt hàng thành công!
          </Space>
        }
        open={showSuccess}
        onCancel={() => setShowSuccess(false)}
        footer={[
          <Button key="home" onClick={() => window.location.href = "/"}>
            Trang chủ
          </Button>,
          <Button key="orders" type="primary" onClick={() => window.location.href = "/purchase"}>
            Theo dõi đơn hàng
          </Button>
        ]}
        centered
      >
        <p>Cảm ơn bạn đã mua hàng. Đơn hàng của bạn đã được xử lý thành công!</p>
      </Modal>

      <Modal
        title={
          <Space>
            <CloseCircleOutlined style={{ color: '#ff4d4f' }} />
            Đặt hàng thất bại
          </Space>
        }
        open={showError}
        onCancel={() => setShowError(false)}
        footer={[
          <Button key="retry" type="primary" onClick={() => setShowError(false)}>
            Thử lại
          </Button>
        ]}
        centered
      >
        <p>Vui lòng kiểm tra lại thông tin bạn đã nhập và thử lại.</p>
      </Modal>
    </div>
  );
};

export default CheckoutPage;
