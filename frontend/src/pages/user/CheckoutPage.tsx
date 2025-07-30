import React, { useState, useEffect } from "react";
import { useCart } from "@/context/CartContext";
import { useOrders } from "@/context/OrderContext";
import { getProvinces, getDistrictsByProvinceCode, getWardsByDistrictCode } from "vn-provinces";
import { fetchCoupons } from "@/api/couponAPI";
import "@/styles/pages/user/checkoutPage.scss";
import { useNavigate } from "react-router-dom";
import { createMomoOrder } from '@/api/momoAPI';
import { sendOrderConfirmationEmail } from '@/services/emailService';

const CheckoutPage: React.FC = () => {
  const { cartItems, clearCart, forceClearCart, reloadCart } = useCart();
  const { addOrder } = useOrders();
  const [paymentMethod, setPaymentMethod] = useState("cod");
  const [showSuccess, setShowSuccess] = useState(false);
  const [showError, setShowError] = useState(false);

  const [couponCode, setCouponCode] = useState("");
  const [coupon, setCoupon] = useState<any>(null);
  const [discount, setDiscount] = useState(0);

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

  const handleApplyCoupon = async () => {
    try {
      const coupons = await fetchCoupons();
      const found = coupons.find(c => c.code === couponCode && c.is_active);
      if (!found) return alert('Mã giảm giá không hợp lệ hoặc đã hết hạn');

      const now = new Date();
      if (new Date(found.start_date) > now || new Date(found.end_date) < now) {
        return alert('Mã giảm giá chưa đến hạn hoặc đã hết hạn');
      }

      if (subtotal < found.min_order_value) {
        return alert(`Đơn hàng phải tối thiểu ${found.min_order_value} để áp dụng mã`);
      }

      setCoupon(found);

      const discountAmount = found.discount_type === 'percentage'
        ? (subtotal * found.discount_value) / 100
        : found.discount_value;

      setDiscount(discountAmount);
    } catch (err) {
      console.error('❌ Lỗi khi áp mã:', err);
      alert('Có lỗi xảy ra khi áp dụng mã');
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
    <div className="checkout-page">
      <h2>🧾 Thanh toán</h2>
      <div className="checkout-grid">
        <div className="checkout-section customer-info">
          <h3>Thông tin khách hàng</h3>
          <form>
            <input name="name" placeholder="Họ và tên *" value={formData.name} onChange={handleChange} />
            {formErrors.name && <p className="error">Phải nhập họ và tên</p>}

            <input name="phone" placeholder="Điện thoại *" value={formData.phone} onChange={handleChange} />
            {formErrors.phone && <p className="error">Phải nhập số điện thoại</p>}

            <input name="email" placeholder="Email" value={formData.email} onChange={handleChange} />

            <select name="city" value={formData.city} onChange={handleChange}>
              <option value="">Tỉnh / Thành phố *</option>
              {provinces.map((pv) => (
                <option key={pv.code} value={pv.name}>{pv.name}</option>
              ))}
            </select>
            {formErrors.city && <p className="error">Phải chọn tỉnh / thành phố</p>}

            <select name="district" value={formData.district} onChange={handleChange} disabled={!formData.city}>
              <option value="">Quận / Huyện *</option>
              {districts.map((dt) => (
                <option key={dt.code} value={dt.name}>{dt.name}</option>
              ))}
            </select>
            {formErrors.district && <p className="error">Phải chọn quận / huyện</p>}

            <select name="ward" value={formData.ward} onChange={handleChange} disabled={!formData.district}>
              <option value="">Phường / Xã *</option>
              {wards.map((wd) => (
                <option key={wd.code} value={wd.name}>{wd.name}</option>
              ))}
            </select>
            {formErrors.ward && <p className="error">Phải chọn phường / xã</p>}

            <input name="address" placeholder="Địa chỉ *" value={formData.address} onChange={handleChange} />
            {formErrors.address && <p className="error">Phải nhập địa chỉ</p>}
          </form>


        </div>

        <div className="checkout-section payment-methods">
          <h3>Hình thức thanh toán</h3>
          <label className={`payment-option ${paymentMethod === "cod" ? "selected" : ""}`}>
            <input type="radio" name="payment" value="cod" checked={paymentMethod === "cod"} onChange={() => setPaymentMethod("cod")} />
            <span>💵 Thanh toán khi nhận hàng / Chuyển phát nhanh - COD</span>
          </label>

          <label className={`payment-option ${paymentMethod === "bank" ? "selected" : ""}`}>
            <input type="radio" name="payment" value="bank" checked={paymentMethod === "bank"} onChange={() => setPaymentMethod("bank")} />
            <span>🏦 Chuyển khoản qua ngân hàng</span>
          </label>

        </div>

        <div className="checkout-section order-summary">
          <h3>Thông tin đơn hàng</h3>
          {cartItems.map((item) => (
            <div key={item._id} className="order-item">
              <img src={item.img_url} alt={item.name} />
              <div>
                <p>{item.name}</p>
                <p>Số Lượng: {item.quantity}</p>
                <p>Giá: {item.price.toLocaleString()} ₫</p>
              </div>
            </div>
          ))}
          <div className="summary-row">Tổng đơn hàng: {subtotal.toLocaleString()} ₫</div>
          <div className="summary-row">Giảm giá: -{discount.toLocaleString()} ₫</div>
          <div className="summary-row">Phí vận chuyển: 0</div>
          <div className="summary-row total">Tổng tiền: {total.toLocaleString()} ₫</div>
          
          <div className="coupon-section">
  <input
    type="text"
    value={couponCode}
    onChange={(e) => setCouponCode(e.target.value)}
    placeholder="Nhập mã giảm giá"
  />
  <button onClick={handleApplyCoupon}>Áp dụng</button>
  {coupon && (
    <p className="discount-info">Đã áp dụng mã: <strong>{coupon.code}</strong> (-{discount.toLocaleString()} ₫)</p>
  )}
</div>

          <textarea placeholder="Ghi chú"></textarea>

          <div className="action-buttons">
            <button className="continue-btn" onClick={() => navigate("/")}>Tiếp tục mua hàng</button>
            <button className="confirm-btn" onClick={handleSubmit}>Xác nhận & Đặt hàng</button>
          </div>
        </div>
      </div>

      {showSuccess && (
        <div className="order-success-popup">
          <div className="popup-content">
            <h3>🎉 Đặt hàng thành công!</h3>
            <p>Cảm ơn bạn đã mua hàng.</p>
            <button onClick={() => window.location.href = "/"}>Trang chủ</button>
            <button onClick={() => window.location.href = "/orders"}>Theo dõi đơn hàng</button>
            <span className="close-btn" onClick={() => setShowSuccess(false)}>×</span>
          </div>
        </div>
      )}

      {showError && (
        <div className="order-success-popup">
          <div className="popup-content">
            <h3 style={{ color: "#dc3545" }}>❌ Đặt hàng thất bại</h3>
            <p>Vui lòng kiểm tra lại thông tin bạn đã nhập.</p>
            <button onClick={() => setShowError(false)}>Thử lại</button>
            <span className="close-btn" onClick={() => setShowError(false)}>×</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default CheckoutPage;
