import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCart } from '@/context/CartContext';
import '@/styles/pages/user/momoCallback.scss';

const MomoCallbackPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { clearCart, forceClearCart, cartItems } = useCart();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    const resultCode = searchParams.get('resultCode');
    const orderId = searchParams.get('orderId');
    const message = searchParams.get('message');

    console.log('📞 MoMo callback received:', { resultCode, orderId, message });
    console.log('📞 MoMo callback - All search params:', Object.fromEntries(searchParams.entries()));
    console.log('📞 MoMo callback - Current cart items:', cartItems.length);

    if (resultCode === '0') {
      // Thanh toán thành công
      console.log('✅ MoMo callback - Payment successful, clearing cart...');
      setStatus('success');
      setMessage('Thanh toán thành công! Đơn hàng của bạn đã được xử lý.');
      
      // Xóa giỏ hàng nếu còn sản phẩm
      if (cartItems.length > 0) {
        try {
          forceClearCart();
          console.log('✅ MoMo callback - Cart cleared successfully');
        } catch (error) {
          console.error('❌ MoMo callback - Error clearing cart:', error);
        }
      } else {
        console.log('✅ MoMo callback - Cart already empty');
      }
      
      // Redirect sau 3 giây
      setTimeout(() => {
        console.log('🔄 MoMo callback - Redirecting to orders page...');
        navigate('/purchase');
      }, 3000);
    } else {
      // Thanh toán thất bại
      console.log('❌ MoMo callback - Payment failed:', message);
      setStatus('error');
      setMessage(message || 'Thanh toán thất bại. Vui lòng thử lại.');
      
      // Redirect sau 3 giây
      setTimeout(() => {
        console.log('🔄 MoMo callback - Redirecting to checkout page...');
        navigate('/checkout');
      }, 3000);
    }
  }, [searchParams, navigate, forceClearCart, cartItems.length]);

  return (
    <div className="momo-callback-page">
      <div className="callback-container">
        {status === 'loading' && (
          <div className="loading">
            <div className="spinner"></div>
            <h2>Đang xử lý thanh toán...</h2>
          </div>
        )}

        {status === 'success' && (
          <div className="success">
            <div className="icon">✅</div>
            <h2>Thanh toán thành công!</h2>
            <p>{message}</p>
            <p>Bạn sẽ được chuyển đến trang đơn hàng trong vài giây...</p>
            <button onClick={() => navigate('/orders')}>Xem đơn hàng</button>
            <button onClick={() => navigate('/')}>Về trang chủ</button>
          </div>
        )}

        {status === 'error' && (
          <div className="error">
            <div className="icon">❌</div>
            <h2>Thanh toán thất bại</h2>
            <p>{message}</p>
            <p>Bạn sẽ được chuyển về trang thanh toán trong vài giây...</p>
            <button onClick={() => navigate('/checkout')}>Thử lại</button>
            <button onClick={() => navigate('/')}>Về trang chủ</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default MomoCallbackPage; 