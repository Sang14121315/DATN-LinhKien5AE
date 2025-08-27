import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
} from "@/api/productAPI";
import { fetchCategories, fetchParentCategoriesForDropdown, Category } from "@/api/categoryAPI";
import { fetchAllBrands } from "@/api/brandAPI";
import { fetchProductTypes } from "@/api/productTypeAPI";
import "@/styles/pages/admin/productDetail.scss";

interface Brand {
  _id: string;
  name: string;
}

// Parent categories reuse Category type

interface ProductFormData {
  name: string;
  slug: string;
  description: string;
  price: number;
  stock: number;
  category_id: string;
  brand_id: string;
  product_type_id: string;
  sale: number;
  hot?: boolean;
  created_at: string;
  status: string;
  img_url?: string;
}

const getImageUrl = (url?: string): string => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  if (url.startsWith("/uploads/products/")) {
    return `http://localhost:5000${url}`;
  }
  return `http://localhost:5000/uploads/products/${url}`;
};

const ProductForm: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [loadingChildCategories, setLoadingChildCategories] = useState(false);
  const [parentCategories, setParentCategories] = useState<Category[]>([]);
  const [childCategories, setChildCategories] = useState<Category[]>([]);
  const [selectedParent, setSelectedParent] = useState<string>("");
  const [brands, setBrands] = useState<Brand[]>([]);
  const [defaultProductTypeId, setDefaultProductTypeId] = useState<string>("");
  const [error, setError] = useState<string | null>(null);

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
    sale: 0,
    hot: false,
    created_at: "",
    status: "Đã duyệt",
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const [parents, brs, productTypes] = await Promise.all([
          fetchParentCategoriesForDropdown(),
          fetchAllBrands({}),
          fetchProductTypes(),
        ]);
        console.log("Parent categories loaded:", parents);
        setParentCategories(parents && Array.isArray(parents) ? parents : []);
        setBrands(brs && Array.isArray(brs) ? brs : []);
        if (productTypes && Array.isArray(productTypes) && productTypes.length > 0) {
          setDefaultProductTypeId(productTypes[0]._id);
        }

        if (isEditMode && id) {
          const res = await getProductById(id);
          console.log("Product data loaded:", res);
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
            sale: res.sale || 0,
            hot: Boolean((res as unknown as { hot?: boolean }).hot),
            created_at: res.created_at || "",
            status: "Đã duyệt",
          });

          if (res.img_url) {
            setImagePreview(getImageUrl(res.img_url));
          }

          if (res.category_id) {
            const categories = await fetchCategories({});
            console.log("All categories loaded:", categories);
            const selectedCategory = categories.find(cat => cat._id === res.category_id);
            if (selectedCategory) {
              console.log("Selected category:", selectedCategory);
              if (selectedCategory.parent) {
                const parentId = typeof selectedCategory.parent === "object"
                  ? selectedCategory.parent._id
                  : selectedCategory.parent || "";
                console.log("Setting selected parent:", parentId);
                setSelectedParent(parentId);
                try {
                  setLoadingChildCategories(true);
                  console.log(`Fetching child categories for parentId: ${parentId}`);
                  const children = await fetchCategories({ parent: parentId });
                  console.log("Child categories loaded:", children);
                  setChildCategories(children && Array.isArray(children) ? children : []);
                } catch (childError) {
                  console.error("Lỗi khi tải danh mục con:", childError);
                  setChildCategories([]);
                  setError("Không thể tải danh mục con");
                } finally {
                  setLoadingChildCategories(false);
                }
              } else {
                setSelectedParent("");
                console.log("No parent, setting childCategories to selected category");
                setChildCategories([selectedCategory]);
                setProduct(prev => ({ ...prev, category_id: selectedCategory._id || "" }));
              }
            } else {
              setSelectedParent("");
              setChildCategories([]);
              setError("Danh mục của sản phẩm không tồn tại trong hệ thống");
            }
          }
        } else {
          setChildCategories([]);
        }
      } catch (error: unknown) {
        console.error("Lỗi khi load dữ liệu:", error);
        const message = (error as { message?: string })?.message || "Không thể tải dữ liệu sản phẩm";
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    if (name === "price" || name === "stock" || name === "sale") {
      const numValue = parseFloat(value);
      if (isNaN(numValue) || numValue < 0) return;
      setProduct({ ...product, [name]: numValue });
    } else {
      setProduct({ ...product, [name]: value });
    }
  };

  const handleParentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value;
    console.log(`Selected parent category: ${parentId}`);
    setSelectedParent(parentId);
    setProduct(prev => ({ ...prev, category_id: "" }));
    setError(null);
    try {
      setLoadingChildCategories(true);
      if (parentId) {
        console.log(`Fetching child categories for parentId: ${parentId}`);
        const children = await fetchCategories({ parent: parentId });
        console.log("Child categories received:", children);
        setChildCategories(children && Array.isArray(children) ? children : []);
        if (!children || children.length === 0) {
          setError(`Danh mục cha "${getParentName(parentId)}" không có danh mục con`);
        }
      } else {
        setChildCategories([]);
      }
    } catch (error: unknown) {
      console.error("Lỗi khi tải danh mục con:", error);
      const message = (error as { message?: string })?.message || "Lỗi không xác định";
      setError(`Không thể tải danh mục con: ${message}`);
      setChildCategories([]);
    } finally {
      setLoadingChildCategories(false);
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

    if (!product.name.trim()) {
      alert("Vui lòng nhập tên sản phẩm!");
      return;
    }
    // Nếu danh mục cha không có danh mục con, cho phép dùng danh mục cha làm category
    const effectiveCategoryId =
      product.category_id && product.category_id.trim() !== ""
        ? product.category_id
        : (selectedParent && childCategories.length === 0 ? selectedParent : "");

    if (!effectiveCategoryId) {
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

    const formData = new FormData();
    formData.append("name", product.name);
    formData.append("slug", product.slug || generateSlug(product.name));
    formData.append("description", product.description || "");
    formData.append("price", product.price.toString());
    formData.append("stock", product.stock.toString());
    formData.append("category_id", effectiveCategoryId);
    formData.append("brand_id", product.brand_id);
    if (isEditMode && product.product_type_id) {
      formData.append("product_type_id", product.product_type_id);
    } else if (defaultProductTypeId) {
      formData.append("product_type_id", defaultProductTypeId);
    } else {
      formData.append("product_type_id", "65f1234567890abcdef12345");
    }
    formData.append("sale", product.sale.toString());
    formData.append("hot", String(Boolean(product.hot)));

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
      const errorMessage = (error as { message?: string })?.message || "Thao tác thất bại!";
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

  const getParentName = (parentId: string) => {
    if (!parentId) return "Không có danh mục cha";
    const found = parentCategories.find(p => p._id === parentId);
    return found ? found.name : "Không xác định";
  };

  return (
    <div className="category-detail-page">
      <h2>{isEditMode ? "Cập nhật sản phẩm" : "Thêm sản phẩm mới"}</h2>
      {loading && (
        <div className="message">Đang tải dữ liệu...</div>
      )}
      {error && (
        <div className="error-message" style={{ color: "red", marginBottom: "10px" }}>
          {error}
        </div>
      )}

      <div className="detail-wrapper">
      <div className="image-upload-box">
          <p>Ảnh sản phẩm {isEditMode ? "(tùy chọn)" : "(bắt buộc)"}</p>
          <label className="image-box">
            {imagePreview ? (
              <div className="upload-item">
                <img src={imagePreview} alt="Preview" />
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
              <div className="image-placeholder">
                <span>Chưa có ảnh được chọn</span>
              </div>
            )}
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              hidden
            />
            <button type="button">
              {imageFile ? "Thay đổi ảnh" : "Chọn ảnh"}
            </button>
          </label>
        </div>

        <div className="info-box">
          <div className="row-flex">
            <label className="half-width">
              Tên sản phẩm
              <input
                type="text"
                name="name"
                value={product.name}
                onChange={handleInputChange}
                placeholder="Nhập tên sản phẩm"
              />
            </label>
            <label className="half-width">
              Ngày tạo
              <input
                type="text"
                value={
                  product.created_at
                    ? new Date(product.created_at).toLocaleDateString("vi-VN")
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
                name="parentCategory"
                value={selectedParent}
                onChange={handleParentChange}
              >
                <option value="">-- Chọn danh mục cha --</option>
                {parentCategories.map(parent => (
                  <option key={parent._id} value={parent._id}>
                    {parent.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="half-width">
              Danh mục
              <select
                name="category_id"
                value={product.category_id}
                onChange={handleInputChange}
                disabled={loadingChildCategories}
              >
                <option value="">-- Chọn danh mục --</option>
                {loadingChildCategories ? (
                  <option value="" disabled>Đang tải danh mục con...</option>
                ) : childCategories.length > 0 ? (
                  childCategories.map(cat => (
                    <option key={cat._id} value={cat._id}>
                      {cat.name}
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Không có danh mục con</option>
                )}
              </select>
              {!selectedParent && (
                <small className="helper-text">
                  Vui lòng chọn danh mục cha trước
                </small>
              )}
              {selectedParent && childCategories.length === 0 && !loadingChildCategories && (
                <small className="helper-text">
                  Không có danh mục con cho danh mục cha "{getParentName(selectedParent)}"
                </small>
              )}
              {selectedParent && product.category_id && !loadingChildCategories && (
                <small className="helper-text">
                  Danh mục con của "{getParentName(selectedParent)}"
                </small>
              )}
            </label>
          </div>

          <div className="row-flex">
            <label className="half-width">
              Thương hiệu
              <select
                name="brand_id"
                value={product.brand_id}
                onChange={handleInputChange}
              >
                <option value="">-- Chọn thương hiệu --</option>
                {brands.map(b => (
                  <option key={b._id} value={b._id}>
                    {b.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="half-width">
              Giá (VNĐ)
              <input
                type="number"
                name="price"
                value={product.price}
                onChange={handleInputChange}
                min="0"
                step="0.01"
                placeholder="Nhập giá sản phẩm"
              />
            </label>
          </div>

          <div className="row-flex">
            <label className="half-width">
              Số lượng
              <input
                type="number"
                name="stock"
                value={product.stock}
                onChange={handleInputChange}
                min="0"
                step="1"
                placeholder="Nhập số lượng"
              />
            </label>
            <label className="half-width">
              Giảm giá (VNĐ)
              <input
                type="number"
                name="sale"
                value={product.sale}
                onChange={handleInputChange}
                min="0"
                max={product.price}
                placeholder="Nhập số tiền giảm giá"
              />
              {product.price > 0 && product.sale > 0 && (
                <small className="helper-text success">
                  Giảm {((product.sale / product.price) * 100).toFixed(2)}%
                </small>
              )}
            </label>
          </div>

          <div className="row-flex">
            <label className="half-width">
              Slug (URL)
              <input
                type="text"
                name="slug"
                value={product.slug}
                onChange={handleInputChange}
                placeholder="auto-generated từ tên"
              />
              <small className="helper-text">Tự động tạo từ tên sản phẩm</small>
            </label>
            <label className="half-width">
              Sản phẩm HOT
              <select name="hot" value={product.hot ? 'true' : 'false'} onChange={handleInputChange}>
                <option value="false">Không</option>
                <option value="true">Có</option>
              </select>
            </label>
          </div>

          <label>
            Mô tả
            <textarea
              name="description"
              value={product.description}
              onChange={handleInputChange}
              rows={8}
              placeholder="Mô tả về sản phẩm này..."
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

export default ProductForm;