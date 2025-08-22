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

interface ProductType {
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

// ✅ Hàm xử lý đường dẫn ảnh
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
  const [types, setTypes] = useState<ProductType[]>([]);

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
        const [cats, brs, tys] = await Promise.all([
          fetchCategories({}),
          fetchAllBrands({}),
          fetchProductTypes(),
        ]);
        setCategories(cats);
        setBrands(brs);
        setTypes(tys);
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
    setProduct({ ...product, [name]: value });
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

    if (!product.slug || product.slug.trim() === "") {
      product.slug = generateSlug(product.name);
    }

    const formData = new FormData();
    Object.entries(product).forEach(([key, value]) => {
      if (key === "created_at" || key === "status" || key === "img_url") return;
      if (value !== undefined && value !== null && value !== "") {
        formData.append(key, String(value));
      }
    });

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
    } catch {
      alert("Thao tác thất bại!");
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
    <div className="containe">
      <h2>{isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm"}</h2>
      {loading && (
        <div style={{ textAlign: "center", padding: "20px" }}>Đang tải...</div>
      )}

      <div className="left">
        <label>Tên sản phẩm</label>
        <input
          name="name"
          value={product.name}
          onChange={handleInputChange}
          placeholder="Nhập tên sản phẩm"
        />

        <label>Mô tả</label>
        <textarea
          name="description"
          value={product.description}
          onChange={handleInputChange}
          placeholder="Nhập mô tả sản phẩm"
        />

        <div className="two-columns">
          <div>
            <label>Danh mục</label>
            <select
              name="category_id"
              value={product.category_id}
              onChange={handleInputChange}
            >
              <option value="">-- chọn --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label>Thương hiệu</label>
            <select
              name="brand_id"
              value={product.brand_id}
              onChange={handleInputChange}
            >
              <option value="">-- chọn --</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>
                  {b.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="two-columns">
          
          <div>
            <label>Giá</label>
            <input
              type="number"
              name="price"
              value={product.price}
              onChange={handleInputChange}
            />
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Số lượng</label>
            <input
              type="number"
              name="stock"
              value={product.stock}
              onChange={handleInputChange}
            />
          </div>
        <div>
  <label>Giảm giá</label>
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
          <button className="update" onClick={handleSubmit}>
            {isEditMode ? "CẬP NHẬT" : "THÊM"}
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

      <div className="right">
        <div className="upload-box">
          <p>Ảnh sản phẩm {isEditMode ? "(tùy chọn)" : "(bắt buộc)"}</p>
          <label htmlFor="image-upload" style={{ cursor: "pointer" }}>
            <input
              id="image-upload"
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            <button type="button">
              {imageFile ? "Thay đổi ảnh" : "Chọn ảnh"}
            </button>
          </label>
        </div>

        <div className="upload-preview">
          {imagePreview && (
            <div className="upload-item" style={{ position: "relative" }}>
              <div className="upload-thumb">
                <img
                  src={imagePreview}
                  alt="preview"
                  style={{ maxWidth: "100%", height: "auto" }}
                  onError={(e) => {
                    e.currentTarget.src = "/images/no-image.png";
                  }}
                />
              </div>
              {isEditMode && imageFile && (
                <button
                  type="button"
                  onClick={() => {
                    setImageFile(null);
                    setImagePreview(getImageUrl(product.img_url));
                  }}
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "50%",
                    width: "20px",
                    height: "20px",
                    cursor: "pointer",
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
