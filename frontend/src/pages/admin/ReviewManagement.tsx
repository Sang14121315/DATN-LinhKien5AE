import React, { useState, useEffect, useMemo } from 'react';
import { getAllReviews, deleteReview } from '@/api/dashboardAPI';
import { FaTrash, FaSearch } from 'react-icons/fa';
import { message, Input, Select, Tag, Table, Rate, Button, Space, Tooltip, Avatar, Typography, Popconfirm } from 'antd';

 

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

  const getRatingColor = (rating: number) => {
    if (rating >= 4) return 'green';
    if (rating >= 3) return 'orange';
    return 'red';
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
    <div style={{ padding: '16px' }}>
      <style>{`
        .compact-table .ant-table-thead > tr > th { background: #f7f8fa; font-weight: 600; }
        .compact-table .ant-table-tbody > tr > td { padding: 10px 12px; }
        .compact-table .ant-table-tbody > tr:nth-child(odd) > td { background: #fafafa; }
      `}</style>
      <div style={{ display: 'flex', gap: 12, marginBottom: 12, flexWrap: 'wrap' as const }}>
            <Input
          placeholder="Tìm theo tên, email, sản phẩm, nội dung..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              prefix={<FaSearch style={{ color: '#bfbfbf' }} />}
          style={{ maxWidth: 360 }}
          allowClear
            />
          <Select
            value={filterRating}
            onChange={setFilterRating}
          style={{ width: 140 }}
          options={[
            { value: 0, label: 'Tất cả' },
            { value: 5, label: '5 sao' },
            { value: 4, label: '4 sao' },
            { value: 3, label: '3 sao' },
            { value: 2, label: '2 sao' },
            { value: 1, label: '1 sao' },
          ]}
        />
        <Space style={{ marginLeft: 'auto' }}>
          <Tag color="blue">Tổng: {filteredReviews.length}</Tag>
        </Space>
      </div>

      <Table
        rowKey="_id"
        size="middle"
        loading={loading}
        dataSource={filteredReviews}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        bordered
        sticky
        tableLayout="fixed"
        className="compact-table"
        columns={[
          {
            title: 'Người dùng',
            dataIndex: ['user_id', 'name'],
            key: 'user',
            render: (_value, record: Review) => (
          <div>
                <div style={{ fontWeight: 600 }}>{record.user_id.name}</div>
                <div style={{ color: '#8c8c8c', fontSize: 12 }}>{record.user_id.email}</div>
              </div>
            ),
          },
          {
            title: 'Sản phẩm',
            dataIndex: ['product_id', 'name'],
            key: 'product',
            render: (_value, record: Review) => (
              <Space>
                <Avatar shape="square" size={28} src={record.product_id.img_url} style={{ backgroundColor: '#f0f0f0' }}>
                  {(record.product_id.name || 'P').charAt(0)}
                </Avatar>
                <span>{record.product_id.name}</span>
              </Space>
            ),
          },
          {
            title: 'Đánh giá',
            dataIndex: 'rating',
            key: 'rating',
            width: 180,
            align: 'center' as const,
            render: (value: number) => (
              <Space>
                <Rate disabled value={value} />
                <Tag color={getRatingColor(value)} style={{ marginLeft: 4 }}>{value}/5</Tag>
              </Space>
            ),
          },
          {
            title: 'Nội dung',
            dataIndex: 'comment',
            key: 'comment',
            ellipsis: true,
            width: 320,
            render: (text: string) => (
              <Tooltip title={text} placement="topLeft">
                <Typography.Text ellipsis style={{ maxWidth: 300, display: 'inline-block' }}>{text}</Typography.Text>
              </Tooltip>
            ),
          },
         
          {
            title: 'Ngày',
            dataIndex: 'created_at',
            key: 'created_at',
            width: 180,
            render: (value: string) => formatDate(value),
            sorter: (a: Review, b: Review) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime(),
            defaultSortOrder: 'descend',
          },
          {
            title: 'Thao tác',
            key: 'actions',
            fixed: 'right',
            width: 100,
            render: (_value, record: Review) => (
              <Popconfirm
                title="Xóa đánh giá?"
                description="Hành động này không thể hoàn tác."
                okText="Xóa"
                cancelText="Hủy"
                onConfirm={() => deleteReviewById(record._id)}
              >
                <Button type="text" danger icon={<FaTrash />} />
              </Popconfirm>
            ),
          },
        ]}
        scroll={{ x: 1000 }}
      />
    </div>
  );
};

export default ReviewManagement;
