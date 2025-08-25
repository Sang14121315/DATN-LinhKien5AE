import React, { useState, useEffect, useMemo } from 'react';
import { getAllReviews, deleteReview } from '@/api/dashboardAPI';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { message, Input, Select, Tag, Table, Rate, Button, Space, Tooltip, Avatar, Typography, Popconfirm } from 'antd';
import '@/styles/pages/admin/reviewManagement.scss';

 

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
  const [filterRating, setFilterRating] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState('');

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
      } else {
        console.error('Data không phải array:', data);
        setReviews([]);
      }
    } catch (error) {
      console.error('Lỗi khi lấy danh sách đánh giá:', error);
      message.error('Không thể tải danh sách đánh giá');
      setReviews([]);
    } finally {
      setLoading(false);
    }
  };

  const deleteReviewById = async (reviewId: string) => {
        try {
          await deleteReview(reviewId);
          message.success('Đã xóa đánh giá thành công');
          await fetchReviews();
        } catch (error) {
          console.error('Lỗi khi xóa đánh giá:', error);
          message.error('Không thể xóa đánh giá');
        }
  };

  const filteredReviews = useMemo(() => {
    return reviews.filter(review => {
    const matchesRating = filterRating === 0 || review.rating === filterRating;
      const keyword = searchTerm.trim().toLowerCase();
      const matchesSearch = !keyword ||
        review.user_id.name.toLowerCase().includes(keyword) ||
        review.user_id.email.toLowerCase().includes(keyword) ||
        review.product_id.name.toLowerCase().includes(keyword) ||
        review.comment.toLowerCase().includes(keyword);
    return matchesRating && matchesSearch;
  });
  }, [reviews, filterRating, searchTerm]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('vi-VN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="review-management">
      <div className="page-header">
        <h1>Quản lý đánh giá sản phẩm</h1>
        <p>Xem và quản lý tất cả đánh giá từ người dùng</p>
      </div>

      <div className="search-filter-section">
        <div className="search-filter-container">
          <div className="search-input">
            <Input
              placeholder="Tìm theo tên, email, sản phẩm, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<FaSearch style={{ color: '#9ca3af' }} />}
              allowClear
            />
          </div>
          <div className="rating-filter">
            <Select
              value={filterRating}
              onChange={setFilterRating}
              options={[
                { value: 0, label: 'Tất cả' },
                { value: 5, label: '5 sao' },
                { value: 4, label: '4 sao' },
                { value: 3, label: '3 sao' },
                { value: 2, label: '2 sao' },
                { value: 1, label: '1 sao' },
              ]}
            />
          </div>
          <div className="total-count">
            <Tag>Tổng: {filteredReviews.length}</Tag>
          </div>
        </div>
      </div>

      <div className="table-section">
        <Table
          rowKey="_id"
          size="middle"
          loading={loading}
          dataSource={filteredReviews}
          pagination={{ pageSize: 10, showSizeChanger: false }}
          bordered
          sticky
          tableLayout="fixed"
          columns={[
            {
              title: 'Người dùng',
              dataIndex: ['user_id', 'name'],
              key: 'user',
              render: (_value, record: Review) => (
                <div className="user-column">
                  <div className="user-name">{record.user_id.name}</div>
                  <div className="user-email">{record.user_id.email}</div>
                </div>
              ),
            },
            {
              title: 'Sản phẩm',
              dataIndex: ['product_id', 'name'],
              key: 'product',
              render: (_value, record: Review) => (
                <div className="product-column">
                  <Space>
                    <Avatar shape="square" size={28} src={record.product_id.img_url} style={{ backgroundColor: '#f0f0f0' }}>
                      {(record.product_id.name || 'P').charAt(0)}
                    </Avatar>
                    <span className="product-name">{record.product_id.name}</span>
                  </Space>
                </div>
              ),
            },
            {
              title: 'Đánh giá',
              dataIndex: 'rating',
              key: 'rating',
              width: 180,
              align: 'center' as const,
              render: (value: number) => (
                <div className="rating-column">
                  <Rate disabled value={value} />
                  <Tag 
                    className={`rating-tag rating-${value}`}
                    style={{ marginLeft: 8 }}
                  >
                    {value}/5
                  </Tag>
                </div>
              ),
            },
            {
              title: 'Nội dung',
              dataIndex: 'comment',
              key: 'comment',
              ellipsis: true,
              width: 320,
              render: (text: string) => (
                <div className="content-column">
                  <Tooltip title={text} placement="topLeft">
                    <div className="review-content">{text}</div>
                  </Tooltip>
                </div>
              ),
            },
            {
              title: 'Ngày',
              dataIndex: 'created_at',
              key: 'created_at',
              width: 180,
              render: (value: string) => (
                <div className="date-column">
                  {formatDate(value)}
                </div>
              ),
              sorter: (a: Review, b: Review) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
              defaultSortOrder: 'descend',
            },
            {
              title: 'Thao tác',
              key: 'actions',
              fixed: 'right',
              width: 100,
              render: (_value, record: Review) => (
                <div className="actions-column">
                  <Popconfirm
                    title="Xóa đánh giá?"
                    description="Hành động này không thể hoàn tác."
                    okText="Xóa"
                    cancelText="Hủy"
                    onConfirm={() => deleteReviewById(record._id)}
                  >
                    <Button type="text" danger icon={<FaTrash />} />
                  </Popconfirm>
                </div>
              ),
            },
          ]}
          scroll={{ x: 1000 }}
        />
      </div>
    </div>
  );
};

export default ReviewManagement;
