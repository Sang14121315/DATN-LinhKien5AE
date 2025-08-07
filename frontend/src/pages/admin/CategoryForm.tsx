import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory,
} from "@/api/categoryAPI";
import { fetchAllProductTypes } from "@/api/productTypeAPI";
import "@/styles/pages/admin/categoryForm.scss";

interface ProductType {
  _id: string;
  name: string;
  slug: string;
}

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [productTypes, setProductTypes] = useState<ProductType[]>([]);

  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
    productType: "", // ProductType ID
    created_at: "",
  });

  // Load product types for dropdown
  useEffect(() => {
    const loadProductTypes = async () => {
      try {
        const data = await fetchAllProductTypes();
        setProductTypes(data);
        console.log('Loaded product types:', data);
      } catch (error) {
        console.error('Lỗi khi tải loại sản phẩm:', error);
      }
    };

    loadProductTypes();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      getCategoryById(id).then((res) => {
        setCategory({
          name: res.name || "",
          slug: res.slug || "",
          description: res.description || "",
          productType: typeof res.productType === 'object' && res.productType ? res.productType._id : (res.productType || ""),
          created_at: res.created_at || "",
        });
      });
    }
  }, [id]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setCategory({ ...category, [e.target.name]: e.target.value });
  };

  const handleSubmit = async () => {
    const payload = {
      name: category.name,
      slug: category.slug || category.name.toLowerCase().replace(/\s+/g, "-"),
      description: category.description || "",
      productType: category.productType, // ProductType ID
    };

    try {
      if (isEditMode) {
        await updateCategory(id!, payload);
        alert("Cập nhật thành công!");
      } else {
        await createCategory(payload);
        alert("Thêm danh mục mới thành công!");
        navigate("/admin/category");
      }
    } catch (error: any) {
      console.error("Lỗi:", error?.response?.data?.message || error.message);
      alert("Thao tác thất bại!");
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    const confirmDelete = window.confirm("Bạn chắc chắn muốn xóa?");
    if (confirmDelete) {
      await deleteCategory(id);
      navigate("/admin/category");
    }
  };

  return (
    <div className="category-detail-page">
      <h2>{isEditMode ? "Chi tiết danh mục" : "Thêm danh mục mới"}</h2>

      <div className="detail-wrapper">
        {/* Upload ảnh (layout thôi, không lưu) */}
        <div className="image-upload-box">
          <p>Ảnh</p>
          <label className="image-box">
            {imagePreview ? (
              <img src={imagePreview} alt="Preview" />
            ) : (
              <div className="image-placeholder">
                <span>Ảnh, video.....</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <button type="button">Thêm ảnh</button>
          </label>
        </div>

        {/* Thông tin danh mục */}
        <div className="info-box">
          <div className="row-flex">
            <label className="half-width">
              Tên danh mục
              <input
                type="text"
                name="name"
                value={category.name}
                onChange={handleInputChange}
              />
            </label>

            <label className="half-width">
              Ngày tạo
              <input
                type="text"
                value={
                  category.created_at
                    ? new Date(category.created_at).toLocaleDateString("vi-VN")
                    : ""
                }
                disabled
              />
            </label>
          </div>

          <div className="row-flex">
            <label className="half-width">
              Loại sản phẩm (Danh mục cha)
              <select
                name="productType"
                value={category.productType}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn loại sản phẩm --</option>
                {productTypes.map(pt => (
                  <option key={pt._id} value={pt._id}>
                    {pt.name}
                  </option>
                ))}
              </select>
            </label>

            <label className="half-width">
              Slug (URL)
              <input
                type="text"
                name="slug"
                value={category.slug}
                onChange={handleInputChange}
                placeholder="auto-generated"
              />
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              name="description"
              value={category.description}
              onChange={handleInputChange}
              rows={11}
            />
          </label>

          <div className="actions">
            <button className="update" onClick={handleSubmit}>
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

export default CategoryForm;