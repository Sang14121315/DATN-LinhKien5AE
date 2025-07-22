import React, { useState, useEffect } from 'react';

const EmailTest: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string>('');
  const [adminEmails, setAdminEmails] = useState<string[]>([]);
  const [loadingAdminEmails, setLoadingAdminEmails] = useState(false);

  // Lấy danh sách admin emails
  const fetchAdminEmails = async () => {
    setLoadingAdminEmails(true);
    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/admin/admin-emails', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();
      if (data.success) {
        setAdminEmails(data.adminEmails);
      }
    } catch (err: any) {
      console.error('Lỗi lấy admin emails:', err);
    } finally {
      setLoadingAdminEmails(false);
    }
  };

  // Load admin emails khi component mount
  useEffect(() => {
    fetchAdminEmails();
  }, []);

  const testEmail = async () => {
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('http://localhost:5000/api/test/test-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.message || 'Test email failed');
      }
    } catch (err: any) {
      setError(err.message || 'Network error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '20px', maxWidth: '600px', margin: '0 auto' }}>
      <h2>🧪 Test Email Service</h2>
      <p>Component này chỉ dùng để test chức năng gửi email trong môi trường development.</p>
      
      <div style={{ marginBottom: '20px' }}>
        <button 
          onClick={testEmail}
          disabled={loading}
          style={{
            padding: '10px 20px',
            backgroundColor: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '5px',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.6 : 1
          }}
        >
          {loading ? 'Đang gửi...' : 'Test Gửi Email'}
        </button>
      </div>

      {error && (
        <div style={{
          padding: '15px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>❌ Lỗi:</strong> {error}
        </div>
      )}

      {result && (
        <div style={{
          padding: '15px',
          backgroundColor: '#d4edda',
          color: '#155724',
          border: '1px solid #c3e6cb',
          borderRadius: '5px',
          marginBottom: '20px'
        }}>
          <strong>✅ Thành công:</strong> {result.message}
          <pre style={{ marginTop: '10px', fontSize: '12px' }}>
            {JSON.stringify(result.results, null, 2)}
          </pre>
        </div>
      )}

      <div style={{
        padding: '15px',
        backgroundColor: '#f8f9fa',
        border: '1px solid #dee2e6',
        borderRadius: '5px',
        fontSize: '14px'
      }}>
        <h4>📧 Admin Emails hiện tại:</h4>
        {loadingAdminEmails ? (
          <p>Đang tải...</p>
        ) : adminEmails.length > 0 ? (
          <ul style={{ margin: '10px 0', paddingLeft: '20px' }}>
            {adminEmails.map((email, index) => (
              <li key={index} style={{ margin: '5px 0' }}>
                <strong>{email}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p style={{ color: '#dc3545' }}>❌ Không tìm thấy admin emails!</p>
        )}
        
        <h4>📋 Hướng dẫn:</h4>
        <ol>
          <li>Đảm bảo đã cấu hình email trong file .env</li>
          <li>Kiểm tra EMAIL_USER và EMAIL_PASS</li>
          <li>Đảm bảo đã bật 2-Step Verification trên Gmail</li>
          <li>Sử dụng App Password, không phải mật khẩu Gmail chính</li>
          <li>Admin emails được lấy từ database (user có role='admin')</li>
          <li>Email khách hàng được lấy từ form thanh toán</li>
        </ol>
        
        <h4>🔧 Cấu hình .env:</h4>
        <pre style={{ fontSize: '12px', backgroundColor: '#fff', padding: '10px' }}>
{`EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password_here
ADMIN_EMAIL=admin@yourdomain.com (fallback)
FRONTEND_URL=http://localhost:5173`}
        </pre>
      </div>
    </div>
  );
};

export default EmailTest; 