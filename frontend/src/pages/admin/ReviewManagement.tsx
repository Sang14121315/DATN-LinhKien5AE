import React, { useState, useEffect } from 'react';
import { getAllReviews, adminReplyToReview, deleteReview } from '@/api/dashboardAPI';
import { FaStar, FaReply, FaTrash, FaUser, FaBox } from 'react-icons/fa';

interface Review {
  _id: string;
  user_id: {
    _id: string;
    name: string;
    email: string;
  };
  product_id: {
    _id: string;
    name: string;
    img_url?: string;
  };
  rating: number;
  comment: string;
  reply: string;
  created_at: string;
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number | 0>(0);
  const [searchTerm, setSearchTerm] = useState('');

  // CSS styles
  const styles = {
    container: {
      padding: '20px',
      maxWidth: '1200px',
      margin: '0 auto',
      fontFamily: 'Arial, sans-serif'
    },
    header: {
      marginBottom: '30px',
      textAlign: 'center' as const
    },
    title: {
      color: '#2c3e50',
      fontSize: '2.5rem',
      marginBottom: '10px',
      fontWeight: '600'
    },
    subtitle: {
      color: '#7f8c8d',
      fontSize: '1.1rem',
      margin: '0'
    },
    filters: {
      display: 'flex',
      gap: '20px',
      marginBottom: '30px',
      background: '#f8f9fa',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      flexWrap: 'wrap' as const
    },
    searchBox: {
      flex: '1',
      minWidth: '300px'
    },
    searchInput: {
      width: '100%',
      padding: '12px 16px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '1rem',
      outline: 'none'
    },
    ratingFilter: {
      display: 'flex',
      alignItems: 'center',
      gap: '10px'
    },
    filterLabel: {
      fontWeight: '600',
      color: '#495057',
      whiteSpace: 'nowrap' as const
    },
    filterSelect: {
      padding: '10px 16px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '1rem',
      background: 'white'
    },
    reviewsContainer: {
      display: 'grid',
      gap: '20px'
    },
    reviewCard: {
      background: 'white',
      borderRadius: '15px',
      padding: '25px',
      boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
      border: '1px solid #e9ecef'
    },
    reviewHeader: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: '20px',
      paddingBottom: '15px',
      borderBottom: '2px solid #f8f9fa'
    },
    userInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    userIcon: {
      color: '#3498db',
      fontSize: '1.5rem',
      background: '#ebf3fd',
      padding: '10px',
      borderRadius: '50%'
    },
    userName: {
      margin: '0 0 5px 0',
      color: '#2c3e50',
      fontSize: '1.1rem',
      fontWeight: '600'
    },
    userEmail: {
      margin: '0',
      color: '#7f8c8d',
      fontSize: '0.9rem'
    },
    rating: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    star: {
      color: '#ddd',
      fontSize: '1.2rem'
    },
    starFilled: {
      color: '#f39c12'
    },
    ratingNumber: {
      fontWeight: '600',
      color: '#2c3e50',
      fontSize: '1rem'
    },
    productInfo: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      marginBottom: '20px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '10px'
    },
    productIcon: {
      color: '#27ae60',
      fontSize: '1.3rem'
    },
    productName: {
      margin: '0 0 8px 0',
      color: '#2c3e50',
      fontSize: '1rem',
      fontWeight: '600'
    },
    productImage: {
      width: '60px',
      height: '60px',
      objectFit: 'cover' as const,
      borderRadius: '8px',
      border: '2px solid #e9ecef'
    },
    reviewContent: {
      marginBottom: '20px'
    },
    comment: {
      color: '#495057',
      fontSize: '1rem',
      lineHeight: '1.6',
      margin: '0 0 10px 0',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '8px',
      borderLeft: '4px solid #3498db'
    },
    date: {
      color: '#7f8c8d',
      fontSize: '0.9rem',
      fontStyle: 'italic'
    },
    adminReply: {
      background: '#e8f5e8',
      border: '1px solid #c3e6c3',
      borderRadius: '8px',
      padding: '15px',
      marginBottom: '20px'
    },
    replyTitle: {
      margin: '0 0 8px 0',
      color: '#27ae60',
      fontSize: '0.9rem',
      fontWeight: '600',
      textTransform: 'uppercase' as const
    },
    replyText: {
      margin: '0',
      color: '#2c3e50',
      fontSize: '0.95rem',
      lineHeight: '1.5'
    },
    reviewActions: {
      display: 'flex',
      gap: '12px',
      marginBottom: '20px'
    },
    button: {
      display: 'flex',
      alignItems: 'center',
      gap: '8px',
      padding: '10px 16px',
      border: 'none',
      borderRadius: '8px',
      fontSize: '0.9rem',
      fontWeight: '500',
      cursor: 'pointer'
    },
    replyBtn: {
      background: '#3498db',
      color: 'white'
    },
    deleteBtn: {
      background: '#e74c3c',
      color: 'white'
    },
    replyForm: {
      background: '#f8f9fa',
      borderRadius: '10px',
      padding: '20px',
      border: '2px solid #e9ecef'
    },
    textarea: {
      width: '100%',
      padding: '12px',
      border: '2px solid #e9ecef',
      borderRadius: '8px',
      fontSize: '1rem',
      fontFamily: 'inherit',
      resize: 'vertical' as const,
      minHeight: '80px',
      outline: 'none'
    },
    replyActions: {
      display: 'flex',
      gap: '12px',
      marginTop: '15px'
    },
    submitBtn: {
      background: '#27ae60',
      color: 'white'
    },
    cancelBtn: {
      background: '#95a5a6',
      color: 'white'
    },
    loading: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: '#7f8c8d',
      fontSize: '1.2rem'
    },
    noReviews: {
      textAlign: 'center' as const,
      padding: '60px 20px',
      color: '#7f8c8d',
      fontSize: '1.2rem'
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      console.log('Reviews data:', data); // Debug log
      
      // Kiểm tra xem data có phải là array không
      if (Array.isArray(data)) {
        setReviews(data);
      } else {
        console.error('Data không phải array:', data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá:', error);
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    
    try {
      await adminReplyToReview(reviewId, replyText);
      setReplyText('');
      setReplyingTo(null);
      await fetchReviews(); // Refresh data
    } catch (error) {
      console.error('Lỗi khi trả lời đánh giá:', error);
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      try {
        await deleteReview(reviewId);
        await fetchReviews(); // Refresh data
      } catch (error) {
        console.error('Lỗi khi xóa đánh giá:', error);
      }
    }
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        style={index < rating ? {...styles.star, ...styles.starFilled} : styles.star}
      />
    ));
  };

  const filteredReviews = Array.isArray(reviews) ? reviews.filter(review => {
    const matchesRating = filterRating === 0 || review.rating === filterRating;
    const matchesSearch = 
      review.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesSearch;
  }) : [];

  if (loading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Đang tải...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h1 style={styles.title}>Quản lý đánh giá</h1>
        <p style={styles.subtitle}>Tổng số đánh giá: {reviews.length}</p>
      </div>

      <div style={styles.filters}>
        <div style={styles.searchBox}>
          <input
            type="text"
            placeholder="Tìm kiếm theo tên người dùng, sản phẩm hoặc nội dung..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={styles.searchInput}
          />
        </div>
        
        <div style={styles.ratingFilter}>
          <label style={styles.filterLabel}>Lọc theo đánh giá:</label>
          <select 
            value={filterRating} 
            onChange={(e) => setFilterRating(Number(e.target.value))}
            style={styles.filterSelect}
          >
            <option value={0}>Tất cả</option>
            <option value={5}>5 sao</option>
            <option value={4}>4 sao</option>
            <option value={3}>3 sao</option>
            <option value={2}>2 sao</option>
            <option value={1}>1 sao</option>
          </select>
        </div>
      </div>

      <div style={styles.reviewsContainer}>
        {filteredReviews.length === 0 ? (
          <div style={styles.noReviews}>
            <p>Không có đánh giá nào</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <div key={review._id} style={styles.reviewCard}>
              <div style={styles.reviewHeader}>
                <div style={styles.userInfo}>
                  <FaUser style={styles.userIcon} />
                  <div>
                    <h4 style={styles.userName}>{review.user_id.name}</h4>
                    <p style={styles.userEmail}>{review.user_id.email}</p>
                  </div>
                </div>
                
                <div style={styles.rating}>
                  {renderStars(review.rating)}
                  <span style={styles.ratingNumber}>{review.rating}/5</span>
                </div>
              </div>

              <div style={styles.productInfo}>
                <FaBox style={styles.productIcon} />
                <div>
                  <h5 style={styles.productName}>{review.product_id.name}</h5>
                  {review.product_id.img_url && (
                    <img 
                      src={review.product_id.img_url} 
                      alt={review.product_id.name}
                      style={styles.productImage}
                    />
                  )}
                </div>
              </div>

              <div style={styles.reviewContent}>
                <p style={styles.comment}>{review.comment}</p>
                <span style={styles.date}>
                  {new Date(review.created_at).toLocaleDateString('vi-VN')}
                </span>
              </div>

              {review.reply && (
                <div style={styles.adminReply}>
                  <h6 style={styles.replyTitle}>Phản hồi của admin:</h6>
                  <p style={styles.replyText}>{review.reply}</p>
                </div>
              )}

              <div style={styles.reviewActions}>
                {!review.reply && (
                  <button
                    style={{...styles.button, ...styles.replyBtn}}
                    onClick={() => setReplyingTo(review._id)}
                  >
                    <FaReply /> Trả lời
                  </button>
                )}
                
                <button
                  style={{...styles.button, ...styles.deleteBtn}}
                  onClick={() => handleDeleteReview(review._id)}
                >
                  <FaTrash /> Xóa
                </button>
              </div>

              {replyingTo === review._id && (
                <div style={styles.replyForm}>
                  <textarea
                    placeholder="Nhập phản hồi của bạn..."
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    rows={3}
                    style={styles.textarea}
                  />
                  <div style={styles.replyActions}>
                    <button
                      style={{...styles.button, ...styles.submitBtn}}
                      onClick={() => handleReply(review._id)}
                    >
                      Gửi phản hồi
                    </button>
                    <button
                      style={{...styles.button, ...styles.cancelBtn}}
                      onClick={() => {
                        setReplyingTo(null);
                        setReplyText('');
                      }}
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
