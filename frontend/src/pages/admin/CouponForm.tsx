import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { createCouponAPI, updateCouponAPI, deleteCouponAPI, getCouponById } from "@/api/couponAPI";
import "../../styles/pages/admin/couponForm.scss";

const defaultForm = {
  code: "",
  discount_type: "fixed",
  discount_value: 0,
  start_date: "",
  end_date: "",
  max_uses: 1,
  is_active: true,
};

const CouponForm: React.FC = () => {
  const { id } = useParams();
  const [formData, setFormData] = useState<any>(defaultForm);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      getCouponById(id).then(data => setFormData(data));
    }
  }, [id]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev: any) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const { _id, used_count, status, updated_at, created_at, ...rest } = formData;
      const payload = {
        ...rest,
        discount_value: Number(formData.discount_value),
        max_uses: Number(formData.max_uses),
        start_date: new Date(formData.start_date).toISOString(),
        end_date: new Date(formData.end_date).toISOString(),
      };
      if (id) {
        await updateCouponAPI(id, payload);
      } else {
        await createCouponAPI(payload);
      }
      navigate("/admin/coupons");
    } catch (err: any) {
      alert(err?.response?.data?.message || "Lỗi khi lưu mã giảm giá");
    }
  };

  const handleDelete = async () => {
    if (id && confirm("Bạn có chắc muốn xoá mã này không?")) {
      await deleteCouponAPI(id);
      navigate("/admin/coupons");
    }
  };

  return (
    <div className="coupon-form-wrapper">
      <h2>Thêm mã giảm giá</h2>
      <form className="coupon-form" onSubmit={handleSubmit} autoComplete="off">
        <div className="row">
          <div style={{width: '100%'}}>
            <label>Mã code</label>
            <input 
              name="code" 
              value={formData.code} 
              onChange={handleChange} 
              required 
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%'
              }}
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Kiểu giảm</label>
            <select 
              name="discount_type" 
              value={formData.discount_type} 
              onChange={handleChange}
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%',
                background: '#f9f9fb'
              }}
            >
              <option value="fixed">Số tiền</option>
              <option value="percentage">Phần trăm</option>
            </select>
          </div>
          <div>
            <label>Giá trị</label>
            <input 
              name="discount_value" 
              value={formData.discount_value} 
              onChange={handleChange} 
              required 
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%'
              }}
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Ngày bắt đầu</label>
            <input 
              type="date" 
              name="start_date" 
              value={formData.start_date} 
              onChange={handleChange} 
              required 
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%'
              }}
            />
          </div>
          <div>
            <label>Ngày kết thúc</label>
            <input 
              type="date" 
              name="end_date" 
              value={formData.end_date} 
              onChange={handleChange} 
              required 
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%'
              }}
            />
          </div>
        </div>
        <div className="row">
          <div>
            <label>Lượt dùng</label>
            <input 
              name="max_uses" 
              value={formData.max_uses} 
              onChange={handleChange} 
              required 
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%'
              }}
            />
          </div>
          <div>
            <label>Tình trạng</label>
            <select 
              name="is_active" 
              value={formData.is_active ? "active" : "inactive"} 
              onChange={e => setFormData((prev: any) => ({ ...prev, is_active: e.target.value === "active" }))}
              style={{
                height: '40px',
                padding: '0 16px',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                fontSize: '14px',
                boxSizing: 'border-box',
                lineHeight: '40px',
                outline: 'none',
                margin: 0,
                width: '100%',
                background: '#f9f9fb'
              }}
            >
              <option value="active">Đã duyệt</option>
              <option value="inactive">Chưa duyệt</option>
            </select>
          </div>
        </div>
        <div className="row btn-row">
          {id && (
            <button 
              type="button" 
              className="delete-btn" 
              onClick={handleDelete}
              style={{
                height: '40px',
                padding: '0 20px',
                border: 'none',
                borderRadius: '8px',
                fontSize: '14px',
                fontWeight: '600',
                cursor: 'pointer',
                background: '#e53935',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxSizing: 'border-box',
                lineHeight: '40px',
                margin: 0,
                minWidth: '120px',
                maxWidth: '160px',
                flex: 1
              }}
            >
              DELETE
            </button>
          )}
          <button 
            type="submit"
            className="submit-btn"
            style={{
              height: '40px',
              padding: '0 20px',
              border: '2px solid #2EC4B6',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#FFFFFF',
              color: '#2EC4B6',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              lineHeight: '40px',
              margin: 0,
              minWidth: '120px',
              maxWidth: '160px',
              flex: 1
            }}
          >
            {id ? "Cập nhật" : "Thêm"}
          </button>
          <button 
            type="button" 
            className="cancel-btn" 
            onClick={() => navigate("/admin/coupons")}
            style={{
              height: '40px',
              padding: '0 20px',
              border: 'none',
              borderRadius: '8px',
              fontSize: '14px',
              fontWeight: '600',
              cursor: 'pointer',
              background: '#e53935',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxSizing: 'border-box',
              lineHeight: '40px',
              margin: 0,
              minWidth: '120px',
              maxWidth: '160px',
              flex: 1
            }}
          >
            CANCEL
          </button>
        </div>
      </form>
    </div>
  );
};

export default CouponForm; 