import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  getProductById,
  updateProduct,
  createProduct,
  deleteProduct,
  Product,
} from '@/api/productAPI';
import { fetchAllCategories, Category } from '@/api/categoryAPI';
import { fetchAllBrands } from '@/api/brandAPI';
import { fetchProductTypes } from '@/api/productTypeAPI';
import '@/styles/pages/admin/productDetail.scss';

// Define interfaces for local use
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

const ProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = Boolean(id);

  const [imagePreview, setImagePreview] = useState<string>('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [types, setTypes] = useState<ProductType[]>([]);

  const [product, setProduct] = useState<ProductFormData>({
    name: '',
    slug:'',
    description: '',
    price: 0,
    stock: 0,
    img_url: '',
    category_id: '',
    brand_id: '',
    product_type_id: '',
    sale: false,
    created_at: '',
    status: 'Đã duyệt',
  });

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        console.log('Fetching categories, brands, types...');
        const [cats, brs, tys] = await Promise.all([
          fetchAllCategories({}),
          fetchAllBrands({}),
          fetchProductTypes(),
        ]);
        console.log('Categories:', cats);
        console.log('Brands:', brs);
        console.log('Types:', tys);
        setCategories(cats);
        setBrands(brs);
        setTypes(tys);
      } catch (error) {
        console.error('Lỗi khi load dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    if (isEditMode && id) {
      console.log('Loading product with ID:', id);
      setLoading(true);
      getProductById(id)
        .then((res: Product) => {
          console.log('Product data received:', res);
          setProduct({
            name: res.name || '',
            slug: res.slug || '',
            description: res.description || '',
            price: res.price || 0,
            stock: res.stock || 0,
            img_url: res.img_url || '',
            category_id: res.category_id && typeof res.category_id === 'object' ? res.category_id._id : (res.category_id || ''),
            brand_id: res.brand_id && typeof res.brand_id === 'object' ? res.brand_id._id : (res.brand_id || ''),
            product_type_id: res.product_type_id && typeof res.product_type_id === 'object' ? res.product_type_id._id : (res.product_type_id || ''),
            sale: res.sale || false,
            created_at: res.created_at || '',
            status: 'Đã duyệt',
          });
          
          // ✅ Khi load sản phẩm để sửa (edit), nếu có img_url thì set preview
          if (res.img_url) {
            console.log('Original img_url from server:', res.img_url);
            const isFullUrl = res.img_url.startsWith('http');
            const previewUrl = isFullUrl ? res.img_url : `http://localhost:5000${res.img_url}`;
            console.log('Setting preview URL:', previewUrl);
            setImagePreview(previewUrl);
          }
        })
        .catch((error) => {
          console.error('Lỗi khi load sản phẩm:', error);
          alert('Không thể load thông tin sản phẩm');
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [id]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProduct({ ...product, [name]: value });
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log('File selected:', file);
    if (file) {
      setImageFile(file);
      const previewUrl = URL.createObjectURL(file);
      setImagePreview(previewUrl);
      console.log('Preview URL:', previewUrl);
    } else {
      console.log('No file selected');
    }
  };

  const generateSlug = (text: string) => {
  return text
    .toLowerCase()
    .normalize('NFD')                
    .replace(/[\u0300-\u036f]/g, '') 
    .replace(/[^a-z0-9 ]/g, '')      
    .trim()
    .replace(/\s+/g, '-');         
};

  const handleSubmit = async () => {
  // Kiểm tra ảnh: bắt buộc khi tạo mới, tùy chọn khi sửa
  if (!isEditMode && !imageFile) {
    alert('Vui lòng chọn ảnh sản phẩm!');
    return;
  }

  // ✅ Tự động sinh slug nếu chưa có
  if (!product.slug || product.slug.trim() === '') {
    product.slug = generateSlug(product.name);
  }

  console.log('Product data before sending:', product);
  console.log('Image file:', imageFile);
  console.log('Image preview:', imagePreview);

  const formData = new FormData();
  
  // Chỉ gửi các field có giá trị và cần thiết cho update
  Object.entries(product).forEach(([key, value]) => {
    console.log(`Processing ${key}: ${value} (type: ${typeof value})`);
    
    // Bỏ qua các field không cần thiết cho update
    if (key === 'created_at' || key === 'status' || key === 'img_url') {
      console.log(`Skipping ${key} (will be handled separately)`);
      return;
    }
    
    if (value !== undefined && value !== null && value !== '') {
      if (key === 'category_id' || key === 'brand_id' || key === 'product_type_id') {
        // Chỉ gửi nếu có giá trị thực sự
        if (value && value.trim() !== '') {
          formData.append(key, String(value));
          console.log(`Adding ${key}: ${value}`);
        } else {
          console.log(`Skipping empty ${key}: ${value}`);
        }
      } else if (typeof value !== 'object') {
        formData.append(key, String(value));
        console.log(`Adding ${key}: ${value}`);
      }
    } else {
      console.log(`Skipping null/undefined/empty ${key}: ${value}`);
    }
  });

  // ✅ Khi submit, nếu có file mới thì gửi file, nếu không thì gửi lại img_url cũ
  if (imageFile) {
    formData.append('image', imageFile);
    console.log('Adding image file:', imageFile.name);
  } else if (product.img_url && product.img_url.trim() !== '') {
    formData.append('img_url', product.img_url);
    console.log('Adding existing image URL:', product.img_url);
  } else {
    console.log('No image file or existing URL to send');
  }

  console.log('FormData entries:');
  for (const pair of formData.entries()) {
    console.log(`${pair[0]}: ${pair[1]}`);
  }

  try {
    if (isEditMode && id) {
      console.log('Sending update request for product ID:', id);
      const updatedProduct = await updateProduct(id, formData);
      alert('Cập nhật sản phẩm thành công!');
      
      // ✅ Quay về ProductTable với thông tin sản phẩm đã cập nhật
      navigate('/admin/products', { 
        state: { 
          updatedProduct: updatedProduct,
          message: 'Sản phẩm đã được cập nhật thành công!'
        }
      });
    } else {
      console.log('Sending create request');
      const newProduct = await createProduct(formData);
      alert('Thêm sản phẩm mới thành công!');
      
      // ✅ Quay về ProductTable với thông tin sản phẩm mới
      navigate('/admin/products', { 
        state: { 
          newProduct: newProduct,
          message: 'Sản phẩm mới đã được thêm thành công!'
        }
      });
    }
  } catch (error: unknown) {
    const err = error as { response?: { data?: { message?: string } } };
    console.error('Full error object:', error);
    console.error('Error response:', err.response);
    console.error('Error data:', err.response?.data);
    if (err.response?.data?.message) {
      alert(`Lỗi: ${err.response.data.message}`);
    } else {
      alert('Thao tác thất bại!');
    }
    console.error('Lỗi khi gửi sản phẩm:', error);
  }
};

  const handleDelete = async () => {
    if (!isEditMode || !id) return;
    if (!window.confirm('Bạn chắc chắn muốn xoá sản phẩm?')) return;
    try {
      await deleteProduct(id);
      navigate('/admin/products');
    } catch (error) {
      console.error(error);
      alert('Xoá thất bại!');
    }
  };

  return (
    
    <div className="container">
      <h2>Chi tiết sản phẩm</h2>
      {loading && <div style={{ textAlign: 'center', padding: '20px' }}>Đang tải...</div>}
      <div className="left">
        <label>Tên sản phẩm</label>
        <input name="name" value={product.name} onChange={handleInputChange} />

        <label>Mô tả</label>
        <textarea name="description" value={product.description} onChange={handleInputChange} />

        <div className="two-columns">
          <div>
            <label>Category</label>
            <select name="category_id" value={product.category_id} onChange={handleInputChange}>
              <option value="">-- chọn --</option>
              {categories.map((cat) => (
                <option key={cat._id} value={cat._id}>{cat.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label>Thương hiệu</label>
            <select name="brand_id" value={product.brand_id} onChange={handleInputChange}>
              <option value="">-- chọn --</option>
              {brands.map((b) => (
                <option key={b._id} value={b._id}>{b.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Ngày</label>
            <input value={product.created_at ? new Date(product.created_at).toLocaleDateString('vi-VN') : 'N/A'} disabled />
          </div>
          <div>
            <label>Loại</label>
            <select name="product_type_id" value={product.product_type_id} onChange={handleInputChange}>
              <option value="">-- chọn --</option>
              {types.map((t) => (
                <option key={t._id} value={t._id}>{t.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Giá gốc</label>
            <input type="number" name="price" value={product.price} onChange={handleInputChange} />
          </div>
          <div>
            <label>Giảm giá</label>
            <input type="text" value={product.sale ? 'Có' : '0'} readOnly />
          </div>
        </div>

        <div className="two-columns">
          <div>
            <label>Số lượng</label>
            <input type="number" name="stock" value={product.stock} onChange={handleInputChange} />
          </div>
          <div>
            <label>Tình trạng</label>
            <input type="text" value={product.status} readOnly />
          </div>
        </div>

        <div className="buttons">
          <button className="update" onClick={handleSubmit}>CẬP NHẬT</button>
          {isEditMode && <button className="delete" onClick={handleDelete}>XÓA</button>}
          <button className="back" onClick={() => navigate(-1)}>QUAY LẠI</button>
        </div>
      </div>

      <div className="right">
        <div className="upload-box">
          <p>Ảnh sản phẩm {isEditMode ? '(tùy chọn)' : '(bắt buộc)'}</p>
          <label htmlFor="image-upload" style={{ cursor: 'pointer' }}>
            <input 
              id="image-upload"
              type="file" 
              accept="image/*" 
              onChange={handleImageChange} 
              style={{ display: 'none' }}
            />
            <button type="button" style={{ 
              padding: '10px 20px', 
              backgroundColor: imageFile ? '#28a745' : '#007bff', 
              color: 'white', 
              border: 'none', 
              borderRadius: '5px',
              cursor: 'pointer'
            }}>
              {imageFile ? 'Thay đổi ảnh' : 'Chọn ảnh'}
            </button>
          </label>
          {imageFile && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Đã chọn: {imageFile.name} ({(imageFile.size / 1024).toFixed(1)} KB)
            </p>
          )}
          {isEditMode && !imageFile && imagePreview && (
            <p style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
              Giữ nguyên ảnh hiện tại
            </p>
          )}
        </div>

        <div className="upload-preview">
          {imagePreview && (
            <div className="upload-item" style={{ position: 'relative' }}>
              <div className="upload-thumb">
                <img 
                  src={imagePreview} 
                  alt="preview" 
                  style={{ maxWidth: '100%', height: 'auto' }}
                  onError={(e) => {
                    console.error('Image failed to load:', imagePreview);
                    e.currentTarget.style.display = 'none';
                    // Hiển thị placeholder khi ảnh lỗi
                    const placeholder = document.createElement('div');
                    placeholder.innerHTML = '❌ Ảnh không tải được';
                    placeholder.style.cssText = 'display: flex; align-items: center; justify-content: center; height: 100px; background: #f5f5f5; color: #666; border: 1px dashed #ccc;';
                    e.currentTarget.parentNode?.appendChild(placeholder);
                  }}
                />
              </div>
              <div className="progress-bar"><div style={{ width: '100%' }}></div></div>
              <span className="checkmark">✔</span>
              {isEditMode && imageFile && (
                <button 
                  type="button" 
                  onClick={() => {
                    setImageFile(null);
                    // ✅ Quay lại ảnh gốc từ server
                    if (product.img_url) {
                      const isFullUrl = product.img_url.startsWith('http');
                      const originalUrl = isFullUrl ? product.img_url : `http://localhost:5000${product.img_url}`;
                      setImagePreview(originalUrl);
                    } else {
                      setImagePreview('');
                    }
                  }}
                  style={{
                    position: 'absolute',
                    top: '5px',
                    right: '5px',
                    background: 'red',
                    color: 'white',
                    border: 'none',
                    borderRadius: '50%',
                    width: '20px',
                    height: '20px',
                    cursor: 'pointer'
                  }}
                >
                  ×
                </button>
              )}
            </div>
          )}
          {isEditMode && !imagePreview && (
            <p style={{ textAlign: 'center', color: '#666', fontSize: '14px' }}>
              Chưa có ảnh sản phẩm
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductForm;
