import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createProductType,
  deleteProductType,
  getProductTypeById,
  updateProductType,
} from "@/api/productTypeAPI";
import "@/styles/pages/admin/categoryForm.scss"; // Dùng chung CSS

const ProductTypeForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [productType, setProductType] = useState({
    name: "",
    created_at: "", // chỉ hiển thị, không gửi lên backend
  });

  useEffect(() => {
    if (isEditMode) {
      getProductTypeById(id as string).then((res) => {
        setProductType({
          name: res.name || "",
          created_at: res.created_at?.split("T")[0] || "",
        });
      });
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setProductType((prev) => ({ ...prev, [name]: value }));
  };



  const handleSave = async () => {
    try {
      // Validation
      if (!productType.name || productType.name.trim() === '') {
        alert("Vui lòng nhập tên loại sản phẩm!");
        return;
      }

      const trimmedName = productType.name.trim();
      if (trimmedName.length > 100) {
        alert("Tên loại sản phẩm không được quá 100 ký tự!");
        return;
      }

      const payload = { name: trimmedName };
      console.log('Sending payload:', payload);
      
      if (isEditMode) {
        await updateProductType(id as string, payload);
        alert("Cập nhật thành công!");
      } else {
        await createProductType(payload);
        alert("Thêm mới thành công!");
        navigate("/admin/product-types");
      }
    } catch (error: unknown) {
      console.error("Lỗi xử lý:", error);
      alert("Thao tác thất bại!");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Bạn chắc chắn muốn xóa?");
    if (confirm && id) {
      try {
        await deleteProductType(id);
        navigate("/admin/product-types");
      } catch (error) {
        console.error("Lỗi xóa:", error);
        alert("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="category-detail-page">
      <h2>{isEditMode ? "Chi tiết loại sản phẩm" : "Thêm loại sản phẩm mới"}</h2>

      <div className="detail-wrapper">


        {/* Thông tin loại sản phẩm */}
        <div className="info-box">
          <label>
            Tên loại sản phẩm
            <input
              type="text"
              name="name"
              value={productType.name}
              onChange={handleInputChange}
              placeholder="Nhập tên loại sản phẩm..."
            />
          </label>





          {isEditMode && (
            <label>
              Ngày tạo
              <input
                type="date"
                name="created_at"
                value={productType.created_at}
                disabled
              />
            </label>
          )}

          <div className="actions">
            <button className="update" onClick={handleSave}>
              {isEditMode ? "CẬP NHẬT" : "THÊM MỚI"}
            </button>
            {isEditMode && (
              <button className="delete" onClick={handleDelete}>
                XÓA
              </button>
            )}
            <button className="back" onClick={() => navigate(-1)}>
              QUAY LẠI
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductTypeForm; 