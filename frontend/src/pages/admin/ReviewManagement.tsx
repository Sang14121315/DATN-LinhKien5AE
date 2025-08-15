import React, { useState, useEffect } from 'react';
import { getAllReviews, adminReplyToReview, deleteReview } from '@/api/dashboardAPI';
import { FaStar, FaReply, FaTrash, FaUser, FaBox, FaSearch, FaFilter, FaSpinner } from 'react-icons/fa';
import { message, Card, Button, Input, Select, Modal, Space, Tag, Avatar, Divider } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

const { TextArea } = Input;
const { Option } = Select;

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
  reply?: string;
  created_at: string;
}

const ReviewManagement: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [filterRating, setFilterRating] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [replyModalVisible, setReplyModalVisible] = useState(false);
  const [selectedReview, setSelectedReview] = useState<Review | null>(null);
  const itemsPerPage = 8;

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const data = await getAllReviews();
      console.log('Reviews data:', data);
      
      if (Array.isArray(data)) {
        setReviews(data);
        setTotalPages(Math.ceil(data.length / itemsPerPage));
      } else {
        console.error('Data không phải array:', data);
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá:', error);
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
      setTotalPages(1);
    } finally {
      setLoading(false);
    }
  };

  const handleReply = async () => {
    if (!replyText.trim() || !selectedReview) {
      message.warning('Vui lòng nhập nội dung phản hồi');
      return;
    }
    
    try {
      await adminReplyToReview(selectedReview._id, replyText);
      message.success('Đã gửi phản hồi thành công');
      setReplyText('');
      setReplyModalVisible(false);
      setSelectedReview(null);
      await fetchReviews();
    } catch (error) {
      console.error('Lỗi khi trả lời đánh giá:', error);
      message.error('Không thể gửi phản hồi');
    }
  };

  const handleDeleteReview = async (reviewId: string) => {
    Modal.confirm({
      title: 'Xác nhận xóa',
      content: 'Bạn có chắc chắn muốn xóa đánh giá này?',
      okText: 'Xóa',
      cancelText: 'Hủy',
      okType: 'danger',
      onOk: async () => {
        try {
          await deleteReview(reviewId);
          message.success('Đã xóa đánh giá thành công');
          await fetchReviews();
        } catch (error) {
          console.error('Lỗi khi xóa đánh giá:', error);
          message.error('Không thể xóa đánh giá');
        }
      },
    });
  };

  const openReplyModal = (review: Review) => {
    setSelectedReview(review);
    setReplyText('');
    setReplyModalVisible(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <FaStar
        key={index}
        style={{
          color: index < rating ? '#f39c12' : '#ddd',
          fontSize: '16px',
          marginRight: '2px'
        }}
      />
    ));
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'orange';
    return 'red';
  };

  const getRatingText = (rating: number) => {
    if (rating === 5) return 'Tuyệt vời';
    if (rating === 4) return 'Tốt';
    if (rating === 3) return 'Bình thường';
    if (rating === 2) return 'Không tốt';
    return 'Rất tệ';
  };

  const filteredReviews = reviews.filter(review => {
    const matchesRating = filterRating === 0 || review.rating === filterRating;
    const matchesSearch = 
      review.user_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.product_id.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      review.comment.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesRating && matchesSearch;
  });

  const paginatedReviews = filteredReviews.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '400px',
        flexDirection: 'column',
        gap: '16px'
      }}>
        <LoadingOutlined style={{ fontSize: '48px', color: '#1890ff' }} />
        <div style={{ fontSize: '18px', color: '#666' }}>Đang tải danh sách đánh giá...</div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '32px',
        padding: '24px',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        borderRadius: '12px',
        color: 'white'
      }}>
        <h1 style={{ fontSize: '2.5rem', margin: '0 0 8px 0', fontWeight: '600' }}>
          Quản lý đánh giá
        </h1>
        <p style={{ fontSize: '1.1rem', margin: 0, opacity: 0.9 }}>
          Tổng số đánh giá: {reviews.length}
        </p>
      </div>

      {/* Filters */}
      <Card style={{ marginBottom: '24px', borderRadius: '12px' }}>
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'center' }}>
          <div style={{ flex: 1, minWidth: '300px' }}>
            <Input
              placeholder="Tìm kiếm theo tên người dùng, sản phẩm hoặc nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<FaSearch style={{ color: '#bfbfbf' }} />}
              size="large"
              style={{ borderRadius: '8px' }}
            />
          </div>
          
          <Select
            value={filterRating}
            onChange={setFilterRating}
            placeholder="Lọc theo đánh giá"
            style={{ minWidth: '150px' }}
            size="large"
          >
            <Option value={0}>Tất cả</Option>
            <Option value={5}>5 sao</Option>
            <Option value={4}>4 sao</Option>
            <Option value={3}>3 sao</Option>
            <Option value={2}>2 sao</Option>
            <Option value={1}>1 sao</Option>
          </Select>
        </div>
      </Card>

      {/* Reviews List */}
      <div style={{ display: 'grid', gap: '16px' }}>
        {paginatedReviews.length === 0 ? (
          <Card style={{ textAlign: 'center', padding: '60px 20px' }}>
            <div style={{ fontSize: '18px', color: '#666' }}>
              {searchTerm || filterRating !== 0 ? 'Không có đánh giá phù hợp với bộ lọc' : 'Không có đánh giá nào'}
            </div>
          </Card>
        ) : (
          paginatedReviews.map((review) => (
            <Card 
              key={review._id} 
              style={{ 
                borderRadius: '12px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                transition: 'all 0.3s ease'
              }}
              hoverable
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <Avatar 
                    icon={<FaUser />} 
                    style={{ backgroundColor: '#1890ff' }}
                    size={48}
                  />
                  <div>
                    <div style={{ fontWeight: '600', fontSize: '16px', color: '#262626' }}>
                      {review.user_id.name}
                    </div>
                    <div style={{ color: '#8c8c8c', fontSize: '14px' }}>
                      {review.user_id.email}
                    </div>
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    {renderStars(review.rating)}
                    <Tag color={getRatingColor(review.rating)} style={{ margin: 0 }}>
                      {review.rating}/5
                    </Tag>
                  </div>
                  <div style={{ fontSize: '12px', color: '#8c8c8c' }}>
                    {getRatingText(review.rating)}
                  </div>
                </div>
              </div>

              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '8px', 
                marginBottom: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px'
              }}>
                <FaBox style={{ color: '#52c41a', fontSize: '20px' }} />
                <div>
                  <div style={{ fontWeight: '600', color: '#262626' }}>
                    {review.product_id.name}
                  </div>
                  {review.product_id.img_url && (
                    <img 
                      src={review.product_id.img_url} 
                      alt={review.product_id.name}
                      style={{
                        width: '40px',
                        height: '40px',
                        objectFit: 'cover',
                        borderRadius: '6px',
                        marginTop: '4px'
                      }}
                    />
                  )}
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ 
                  background: '#f0f8ff', 
                  padding: '16px', 
                  borderRadius: '8px',
                  borderLeft: '4px solid #1890ff',
                  marginBottom: '8px'
                }}>
                  {review.comment}
                </div>
                <div style={{ fontSize: '12px', color: '#8c8c8c', fontStyle: 'italic' }}>
                  {formatDate(review.created_at)}
                </div>
              </div>

              {review.reply && (
                <div style={{ 
                  background: '#f6ffed', 
                  border: '1px solid #b7eb8f',
                  borderRadius: '8px',
                  padding: '16px',
                  marginBottom: '16px'
                }}>
                  <div style={{ fontWeight: '600', color: '#52c41a', fontSize: '14px', marginBottom: '8px' }}>
                    Phản hồi của admin:
                  </div>
                  <div style={{ color: '#262626' }}>
                    {review.reply}
                  </div>
                </div>
              )}

              <Divider style={{ margin: '16px 0' }} />

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
                {!review.reply && (
                  <Button
                    type="primary"
                    icon={<FaReply />}
                    onClick={() => openReplyModal(review)}
                    style={{ borderRadius: '6px' }}
                  >
                    Trả lời
                  </Button>
                )}
                
                <Button
                  danger
                  icon={<FaTrash />}
                  onClick={() => handleDeleteReview(review._id)}
                  style={{ borderRadius: '6px' }}
                >
                  Xóa
                </Button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ 
          display: 'flex', 
          justifyContent: 'center', 
          marginTop: '32px',
          gap: '8px'
        }}>
          <Button
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            style={{ borderRadius: '6px' }}
          >
            Trước
          </Button>
          
          {Array.from({ length: totalPages }, (_, i) => (
            <Button
              key={i}
              type={currentPage === i + 1 ? 'primary' : 'default'}
              onClick={() => setCurrentPage(i + 1)}
              style={{ borderRadius: '6px' }}
            >
              {i + 1}
            </Button>
          ))}
          
          <Button
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            style={{ borderRadius: '6px' }}
          >
            Sau
          </Button>
        </div>
      )}

      {/* Reply Modal */}
      <Modal
        title="Trả lời đánh giá"
        open={replyModalVisible}
        onOk={handleReply}
        onCancel={() => {
          setReplyModalVisible(false);
          setSelectedReview(null);
          setReplyText('');
        }}
        okText="Gửi phản hồi"
        cancelText="Hủy"
        width={600}
      >
        {selectedReview && (
          <div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Người dùng:</strong> {selectedReview.user_id.name}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Sản phẩm:</strong> {selectedReview.product_id.name}
            </div>
            <div style={{ marginBottom: '16px' }}>
              <strong>Đánh giá:</strong>
              <div style={{ 
                background: '#f5f5f5', 
                padding: '12px', 
                borderRadius: '6px',
                marginTop: '8px'
              }}>
                {selectedReview.comment}
              </div>
            </div>
            <div>
              <strong>Phản hồi của bạn:</strong>
              <TextArea
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                placeholder="Nhập phản hồi của bạn..."
                rows={4}
                style={{ marginTop: '8px' }}
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default ReviewManagement;
