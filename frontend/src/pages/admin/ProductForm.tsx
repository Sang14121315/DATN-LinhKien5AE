import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
  Product,
} from "@/api/productAPI";
import { fetchCategories, Category } from "@/api/categoryAPI";
import { fetchAllBrands } from "@/api/brandAPI";
import { fetchProductTypes } from "@/api/productTypeAPI";
import "@/styles/pages/admin/productDetail.scss";

interface Brand {
  _id: string;
  name: string;
}

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  brand_id: string;
  product_type_id: string;
  sale: boolean;
  created_at: string;
  status: string;
  img_url?: string;
}

// Hàm xử lý đường dẫn ảnh
const getImageUrl = (url?: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/products/")) {
    return `http://localhost:5000${url}`;
  }
  return `http://localhost:5000/uploads/products/${url}`;
};

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [defaultProductTypeId, setDefaultProductTypeId] = useState<string>("");

  const [product, setProduct] = useState<ProductFormData>({
    name: "",
    slug: "",
    description: "",
    price: 0,
    stock: 0,
    img_url: "",
    category_id: "",
    brand_id: "",
    product_type_id: "",
    sale: false,
    created_at: "",
    status: "Đã duyệt",
  });

  // Load dữ liệu filter
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [cats, brs, productTypes] = await Promise.all([
          fetchCategories({}),
          fetchAllBrands({}),
          fetchProductTypes(),
        ]);
        setCategories(cats);
        setBrands(brs);
        // Lấy ID của product type đầu tiên làm mặc định
        if (productTypes.length > 0) {
          setDefaultProductTypeId(productTypes[0]._id);
        }
      } catch (error) {
        console.error("Lỗi khi load dữ liệu:", error);
      }
    };

    fetchData();

    if (isEditMode && id) {
      setLoading(true);
      getProductById(id)
        .then((res: Product) => {
          setProduct({
            name: res.name || "",
            slug: res.slug || "",
            description: res.description || "",
            price: res.price || 0,
            stock: res.stock || 0,
            img_url: res.img_url || "",
            category_id:
              res.category_id && typeof res.category_id === "object"
                ? res.category_id._id
                : res.category_id || "",
            brand_id:
              res.brand_id && typeof res.brand_id === "object"
                ? res.brand_id._id
                : res.brand_id || "",
            product_type_id:
              res.product_type_id && typeof res.product_type_id === "object"
                ? res.product_type_id._id
                : res.product_type_id || "",
            sale: res.sale || false,
            created_at: res.created_at || "",
            status: "Đã duyệt",
          });

          if (res.img_url) {
            setImagePreview(getImageUrl(res.img_url));
          }
        })
        .catch(() => {
          alert("Không thể load thông tin sản phẩm");
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    // Ensure price and stock are non-negative
    if (name === "price" || name === "stock") {
      const numValue = parseFloat(value);
      if (numValue < 0) return; // Prevent negative values
      setProduct({ ...product, [name]: numValue });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9 ]/g, "")
      .trim()
      .replace(/\s+/g, "-");
  };

  const handleSubmit = async () => {
    if (!isEditMode && !imageFile) {
      alert("Vui lòng chọn ảnh sản phẩm!");
      return;
    }

    // Validate required fields
    if (!product.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    if (!product.category_id) {
      alert("Vui lòng chọn danh mục!");
      return;
    }
    if (!product.brand_id) {
      alert("Vui lòng chọn thương hiệu!");
      return;
    }
    if (product.price <= 0) {
      alert("Vui lòng nhập giá sản phẩm lớn hơn 0!");
      return;
    }
    if (product.stock < 0) {
      alert("Vui lòng nhập số lượng không âm!");
      return;
    }

    // Generate slug if empty
    if (!product.slug || product.slug.trim() === "") {
      product.slug = generateSlug(product.name);
    }

    const formData = new FormData();
    
    // Add all required fields
    formData.append("name", product.name);
    formData.append("slug", product.slug);
    formData.append("description", product.description || "");
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString());
    formData.append("category_id", product.category_id);
    formData.append("brand_id", product.brand_id);
    // Tự động gán product_type_id mặc định hoặc giữ nguyên nếu đang edit
    if (isEditMode && product.product_type_id) {
      formData.append("product_type_id", product.product_type_id);
    } else if (defaultProductTypeId) {
      formData.append("product_type_id", defaultProductTypeId);
    } else {
      // Fallback nếu không có product type nào
      formData.append("product_type_id", "65f1234567890abcdef12345");
    }
    formData.append("sale", product.sale.toString());

    // Add image
    if (imageFile) {
      formData.append("image", imageFile);
    } else if (product.img_url && product.img_url.trim() !== "") {
      formData.append("img_url", product.img_url);
    }

    try {
      if (isEditMode && id) {
        await updateProduct(id, formData);
        alert("Cập nhật sản phẩm thành công!");
      } else {
        await createProduct(formData);
        alert("Thêm sản phẩm mới thành công!");
      }
      navigate("/admin/products");
    } catch (error: unknown) {
      console.error("Lỗi:", error);
      const errorMessage = error instanceof Error ? error.message : "Thao tác thất bại!";
      alert(errorMessage);
    }
  };

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    if (!window.confirm("Bạn chắc chắn muốn xoá sản phẩm?")) return;
    try {
      await deleteProduct(id);
      alert("Xóa sản phẩm thành công!");
      navigate("/admin/products");
    } catch {
      alert("Xoá thất bại!");
    }
  };

  return (
    <div className="containerr">
      <h2>{isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
      {loading && (
        <div className="loading">Đang tải dữ liệu...</div>
      )}

      <div className="form-container">
        <div className="form-section">
          <label>Tên sản phẩm: </label>
          <input
            name="name"
            value={product.name}
            onChange={handleInputChange}
            placeholder="Nhập tên sản phẩm"
          />

          <label>Mô tả:</label>
          <textarea
            name="description"
            value={product.description}
            onChange={handleInputChange}
            placeholder="Nhập mô tả sản phẩm"
          />

          <div className="form-row">
            <div className="form-group">
              <label>Danh mục: </label>
              <select
                name="category_id"
                value={product.category_id}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn danh mục --</option>
                {categories.map((cat) => (
                  <option key={cat._id} value={cat._id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Thương hiệu: </label>
              <select
                name="brand_id"
                value={product.brand_id}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map((b) => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Giá: </label>
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Nhập giá sản phẩm"
              />
            </div>
            <div className="form-group">
              <label>Số lượng: </label>
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="Nhập số lượng"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-groupp">
              <label>Giảm giá:</label>
              <select
                name="sale"
                value={product.sale ? 'true' : 'false'}
                onChange={(e) => setProduct({ ...product, sale: e.target.value === 'true' })}
              >
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </div>
          </div>

          <div className="buttons">
            <button className="btn btn-primary" onClick={handleSubmit}>
              {isEditMode ? "CẬP NHẬT" : "THÊM"}
            </button>
            <button className="btn btn-secondary" onClick={() => navigate(-1)}>
              QUAY LẠI
            </button>
            {isEditMode && (
              <button className="btn btn-danger" onClick={handleDelete}>
                XÓA
              </button>
            )}
          </div>
        </div>

        <div className="image-section">
          <div className="upload-box">
            <p>Ảnh sản phẩm {isEditMode ? "(tùy chọn)" : "(bắt buộc)"}</p>
            <label htmlFor="image-upload" className="upload-label">
              <input
                id="image-upload"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                style={{ display: "none" }}
              />
              <button type="button" className="upload-btn">
                {imageFile ? "Thay đổi ảnh" : "Chọn ảnh"}
              </button>
            </label>
          </div>

          <div className="upload-preview">
            {imagePreview ? (
              <div className="upload-item">
                <div className="upload-thumb">
                  <img
                    src={imagePreview}
                    alt="preview"
                    onError={(e) => {
                      e.currentTarget.src = "/images/no-image.png";
                    }}
                  />
                </div>
                {isEditMode && imageFile && (
                  <button
                    type="button"
                    className="remove-image"
                    onClick={() => {
                      setImageFile(null);
                      setImagePreview(getImageUrl(product.img_url));
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ) : (
              <div className="upload-placeholder">
                Chưa có ảnh được chọn
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductForm;