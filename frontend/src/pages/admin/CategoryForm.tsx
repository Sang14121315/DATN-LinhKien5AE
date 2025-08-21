import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  getCategoryById,
  updateCategory,
  deleteCategory,
  createCategory,
  fetchParentCategoriesForDropdown,
} from "@/api/categoryAPI";
import "@/styles/pages/admin/categoryForm.scss";

interface ParentCategory {
  _id: string;
  name: string;
  slug: string;
}

const CategoryForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [parentCategories, setParentCategories] = useState<ParentCategory[]>([]);

  const [category, setCategory] = useState({
    name: "",
    slug: "",
    description: "",
    parent: "", // '' = parent category, có giá trị = child category
    created_at: "",
  });

  // Load parent categories for dropdown
  useEffect(() => {
    const loadParentCategories = async () => {
      try {
        const data = await fetchParentCategoriesForDropdown();
        setParentCategories(data);
        console.log('Loaded parent categories:', data);
      } catch (error) {
        console.error('Lỗi khi tải danh mục cha:', error);
      }
    };

    loadParentCategories();
  }, []);

  useEffect(() => {
    if (isEditMode && id) {
      getCategoryById(id).then((res) => {
        setCategory({
          name: res.name || "",
          slug: res.slug || "",
          description: res.description || "",
          parent: typeof res.parent === 'object' && res.parent ? res.parent._id : (res.parent || ""),
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
      parent: category.parent || null, // Nếu không chọn parent thì là parent category
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
      try {
        await deleteCategory(id);
        navigate("/admin/category");
      } catch (error: any) {
        console.error("Lỗi xóa:", error);
        alert(error?.response?.data?.message || "Xóa thất bại!");
      }
    }
  };

  const isParentCategory = !category.parent;
  const categoryTypeText = isParentCategory ? "danh mục cha" : "danh mục con";

  return (
    <div className="category-detail-page">
      <h2>
        {isEditMode 
          ? `Chi tiết ${categoryTypeText}`
          : "Thêm danh mục mới"
        }
      </h2>

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
                placeholder="Nhập tên danh mục"
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
              Danh mục cha
              <select
                name="parent"
                value={category.parent}
                onChange={handleInputChange}
              >
                <option value="">-- Không có (Danh mục cha) --</option>
                {parentCategories.map(parent => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
              <small className="helper-text">
                {isParentCategory 
                  ? "Đây sẽ là danh mục cha" 
                  : `Đây sẽ là danh mục con của "${getParentName(category.parent)}"`
                }
              </small>
            </label>

            <label className="half-width">
              Slug (URL)
              <input
                type="text"
                name="slug"
                value={category.slug}
                onChange={handleInputChange}
                placeholder="auto-generated từ tên"
              />
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              name="description"
              value={category.description}
              onChange={handleInputChange}
              rows={8}
              placeholder="Mô tả về danh mục này..."
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

  // Helper function để lấy tên parent (dùng trong component)
  function getParentName(parentId: string) {
    if (!parentId) return '';
    const found = parentCategories.find(p => p._id === parentId);
    return found ? found.name : '';
  }
};

export default CategoryForm;