import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  FaShoppingCart,
  FaFacebook,
  FaFacebookMessenger,
  FaPinterest,
  FaCartPlus,
} from "react-icons/fa";
import { AiFillTwitterCircle } from "react-icons/ai";
import {
  Product,
  fetchFilteredProducts,
  fetchProductById,
} from "@/api/user/productAPI";
import "@/styles/pages/user/productDetail.scss";
import { useCart } from "@/context/CartContext";
const ProductDetail: React.FC = () => {
  const { id } = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [viewedProducts, setViewedProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const data = await fetchProductById(id as string);
        setProduct(data);

        // Lưu sản phẩm đã xem vào localStorage
        const viewedRaw = localStorage.getItem("viewedProducts");
        const viewed: Product[] = viewedRaw ? JSON.parse(viewedRaw) : [];

        // Kiểm tra nếu sản phẩm đã có trong danh sách thì loại ra (tránh trùng)
        const updatedViewed = [
          data,
          ...viewed.filter((p) => p._id !== data._id),
        ].slice(0, 10); // Giới hạn 10 sản phẩm
        localStorage.setItem("viewedProducts", JSON.stringify(updatedViewed));

        const stored = localStorage.getItem("viewedProducts");
        if (stored) {
          setViewedProducts(JSON.parse(stored));
        }

        // Sản phẩm liên quan
        if (data?.category_id && typeof data.category_id === "object") {
          const categoryId = data.category_id._id || data.category_id;
          const allInSameCategory = await fetchFilteredProducts({
            category_id: categoryId,
          });

          const related = allInSameCategory.filter(
            (p) => String(p._id) !== String(data._id)
          );
          setRelatedProducts(related);
        }
      } catch (error) {
        console.error("Lỗi khi lấy sản phẩm:", error);
      }
    };

    fetchData();
  }, [id]);

  if (!product) return <div>Đang tải sản phẩm...</div>;

  const discountPercent = product.sale ? Math.round((1 - 0.66) * 100) : 0;
  const priceAfterSale = product.sale ? product.price * 0.66 : product.price;

  return (
    <div className="product-detail-container">
      <div className="product-container">
        <div className="image-section">
          {product.sale && (
            <span className="discount-badge">-{discountPercent}% OFF</span>
          )}
          <img
            className="product-image"
            src={product.img_url}
            alt={product.name}
          />
        </div>

        <div className="info-section">
          <h1 className="product-name">{product.name}</h1>

          <div className="rating-brand">
            <div className="brand">
              Thương hiệu:{" "}
              <strong>
                {typeof product.brand_id === "object"
                  ? product.brand_id.name
                  : product.brand_id}
              </strong>
            </div>
            <div className="availability">
              Tình trạng:{" "}
              <strong>{product.stock > 0 ? "Còn hàng" : "Hết hàng"}</strong>
            </div>
          </div>

          <div className="price-section">
            <div className="discount-price">
              {formatCurrency(priceAfterSale)}
            </div>
            {product.sale && (
              <>
                <div className="original-price">
                  {formatCurrency(product.price)}
                </div>
                <div className="discount-percent">-{discountPercent}%</div>
              </>
            )}
          </div>
          <div className="quantity-section">
            <label htmlFor="quantity">Số lượng:</label>
            <div className="quantity-input">
              <button
                onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
              >
                -
              </button>
              <input
                type="number"
                value={quantity}
                min={1}
                onChange={(e) => {
                  const val = parseInt(e.target.value);
                  if (!isNaN(val) && val >= 1) {
                    setQuantity(val);
                  }
                }}
              />
              <button onClick={() => setQuantity((prev) => prev + 1)}>+</button>
            </div>
          </div>

          <div className="cta">
            <button className="add-cart" onClick={() => addToCart({ ...product, quantity: 1 })}>
                    <FaCartPlus /> THÊM VÀO GIỎ
                  </button>
            <button className="buy-now">MUA NGAY</button>
          </div>

          <div className="share">
            <span>Chia sẻ:</span>
            <div className="icons">
              <FaFacebook />
              <FaFacebookMessenger />
              <AiFillTwitterCircle />
              <FaPinterest />
            </div>
          </div>
        </div>

        <div className="side-policy">
          <div className="policy-box">
            <div className="chinh-sach">
              <h5>Chính sách bán hàng</h5>
              <p>Cam kết 100% chính hãng</p>
              <p>Hỗ trợ 24/7</p>
            </div>
            <div className="chinh-sach">
              <h5>Thông tin thêm</h5>
              <p>Hoàn tiền 200% nếu hàng giả</p>
              <p>Mở hộp kiểm tra nhận hàng</p>
              <p>Đổi trả trong 7 ngày</p>
            </div>
          </div>
          <img
            src="/assets/banner_sale_productList.png"
            alt="Sale Banner"
            className="side-banner"
          />
        </div>
      </div>

      <div className="description-box">
        <h3>MÔ TẢ SẢN PHẨM</h3>
        <p>{product.description}</p>
      </div>

      <div className="related-products">
        <h2>Sản phẩm liên quan</h2>
        <div className="product-grid">
          {relatedProducts.slice(0, 6).map((rp) => (
  <div
    className="product-card"
    key={rp._id}
    onClick={() => (window.location.href = `/product/${rp._id}`)}
    style={{ cursor: "pointer" }}
  >
    <img src={rp.img_url} alt={rp.name} />
    <p className="product-brand">
      {typeof rp.brand_id === "object" ? rp.brand_id.name : rp.brand_id}
    </p>
    <h4 className="product-name">{rp.name}</h4>
    <div className="price-block">
      {rp.sale ? (
        <>
          <span className="discount">
            {formatCurrency(rp.price * 0.66)}
          </span>
          <span className="original">{formatCurrency(rp.price)}</span>
        </>
      ) : (
        <span className="discount">{formatCurrency(rp.price)}</span>
      )}
    </div>
<button
  className="add-cart"
  onClick={(e) => {
    e.stopPropagation(); 
    addToCart({ ...rp, quantity: 1 }); 
  }}
>
  <FaCartPlus /> THÊM VÀO GIỎ
</button>
  </div>
))}

        </div>
      </div>

      {viewedProducts.length > 0 && (
        <div className="related-products">
          <h2>Các sản phẩm đã xem</h2>
          <div className="product-grid">
            {viewedProducts
              .filter((p) => p._id !== product._id) // loại sản phẩm hiện tại
              .slice(0, 6)
              .map((vp) => (
                <div
                  className="product-card"
                  key={vp._id}
                  onClick={() => (window.location.href = `/product/${vp._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <img src={vp.img_url} alt={vp.name} />
                  <p className="product-brand">
                    {typeof product.brand_id === "object"
                      ? product.brand_id.name
                      : product.brand_id}
                  </p>
                  <h4 className="product-name">{vp.name}</h4>
                  <div className="price-block">
                    {vp.sale ? (
                      <>
                        <span className="discount">
                          {formatCurrency(vp.price * 0.66)}
                        </span>
                        <span className="original">
                          {formatCurrency(vp.price)}
                        </span>
                      </>
                    ) : (
                      <span className="discount">
                        {formatCurrency(vp.price)}
                      </span>
                    )}
                  </div>
                  <button className="add-cart" onClick={() => addToCart({ ...product, quantity: 1 })}>
                          <FaShoppingCart /> THÊM VÀO GIỎ
                        </button>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductDetail;
