import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  createBrand,
  deleteBrand,
  getBrandById,
  updateBrand,
} from "@/api/brandAPI";
import "@/styles/pages/admin/categoryForm.scss"; // Dùng chung CSS

const BrandForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;

  const [brand, setBrand] = useState({
    name: "",
    slug: "",
    logo_data: "",
    logo_url: "",
    created_at: "", // chỉ hiển thị, không gửi lên backend
  });

  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null); // Thêm state cho lỗi

  useEffect(() => {
    if (isEditMode) {
      getBrandById(id as string).then((res) => {
        setBrand({
          name: res.name || "",
          slug: res.slug || "",
          logo_data: res.logo_data || "",
          logo_url: res.logo_url || "",
          created_at: res.created_at?.split("T")[0] || "",
        });

        // Ưu tiên hiển thị logo_data (base64) nếu có
        if (res.logo_data) {
          setLogoPreview(res.logo_data);
        } else if (res.logo_url?.startsWith("http")) {
          setLogoPreview(res.logo_url);
        } else if (res.logo_url) {
          setLogoPreview(`http://localhost:5000${res.logo_url}`);
        } else {
          setLogoPreview(null);
        }
      });
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setBrand((prev) => ({ ...prev, [name]: value }));
    setError(null); // Xóa lỗi khi người dùng nhập
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setLogoFile(file);
      const preview = URL.createObjectURL(file);
      setLogoPreview(preview);
    }
  };

  const handleSave = async () => {
    // Kiểm tra name không rỗng
    const trimmedName = brand.name.trim();
    if (!trimmedName) {
      setError("Tên thương hiệu là bắt buộc!");
      return;
    }

    // Create FormData object for file upload
    const formData = new FormData();
    formData.append("name", trimmedName);
    formData.append(
      "slug",
      brand.slug.trim() || trimmedName.toLowerCase().replace(/\s+/g, "-")
    );
    if (logoFile) {
      formData.append("logoFile", logoFile);
    }

    try {
      if (isEditMode) {
        await updateBrand(id as string, formData);
        alert("Cập nhật thành công!");
      } else {
        await createBrand(formData);
        alert("Thêm mới thành công!");
        navigate("/admin/brand");
      }
    } catch (error: any) {
      console.error("Lỗi xử lý:", error?.response?.data?.message || error.message);
      setError(error?.response?.data?.message || "Thao tác thất bại!");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm("Bạn chắc chắn muốn xóa?");
    if (confirm && id) {
      try {
        await deleteBrand(id);
        navigate("/admin/brand");
      } catch (error) {
        console.error("Lỗi xóa:", error);
        setError("Xóa thất bại!");
      }
    }
  };

  return (
    <div className="category-detail-page">
      <h2>{isEditMode ? "Chi tiết thương hiệu" : "Thêm thương hiệu mới"}</h2>

      {error && <div className="error-message" style={{ color: 'red' }}>{error}</div>}

      <div className="detail-wrapper">
        {/* Upload logo */}
        <div className="image-upload-box">
          <p>Logo</p>
          <label className="image-box">
            {logoPreview ? (
              <img src={logoPreview} alt="Logo Preview" />
            ) : (
              <div className="image-placeholder">
                <span>Logo thương hiệu...</span>
              </div>
            )}
            <input type="file" accept="image/*" onChange={handleLogoChange} hidden />
            <button type="button">Thêm ảnh</button>
          </label>
        </div>

        {/* Thông tin thương hiệu */}
        <div className="info-box">
          <label>
            Tên thương hiệu
            <input
              type="text"
              name="name"
              value={brand.name}
              onChange={handleInputChange}
              required
            />
          </label>

          <label>
            Slug
            <input
              type="text"
              name="slug"
              value={brand.slug}
              onChange={handleInputChange}
            />
          </label>

          {isEditMode && (
            <label>
              Ngày tạo
              <input
                type="text"
                name="created_at"
                value={brand.created_at}
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

export default BrandForm;