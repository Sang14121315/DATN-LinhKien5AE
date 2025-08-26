import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { searchProductsAPI } from "@/api/user/searchAPI";
import { Product } from "@/api/user/productAPI";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "@/context/CartContext";
import "@/styles/pages/user/productList.scss";

const SearchResult: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get("query") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const { addToCart } = useCart();
  const navigate = useNavigate();

  useEffect(() => {
    if (query.trim()) {
      searchProductsAPI(query)
        .then(setProducts)
        .catch(() => setProducts([]));
    }
  }, [query]);

  const formatCurrency = (amount: number): string =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);

  return (
    <div className="product-page-container">
      <div className="product-layout">
        <main className="product-content">
          <div className="product-header">
            <h2 style={{ textAlign: "center" }}>
              Kết quả tìm kiếm cho: <em>{query}</em>
            </h2>
            <p
              style={{
                textAlign: "center",
                marginTop: "8px",
                fontSize: "15px",
                color: "#666",
              }}
            >
              Có <strong> {products.length} sản phẩm </strong> cho tìm kiếm
            </p>
          </div>

          <div className="product-grid">
            {products.length > 0 ? (
              products.map((product) => (
                <div className="product-card" key={product._id}>
                  <img
                    src={product.img_url}
                    alt={product.name}
                    style={{ cursor: "pointer" }}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                  <p className="product-brand">
                    {typeof product.brand_id === "object"
                      ? product.brand_id.name
                      : product.brand_id}
                  </p>
                  <h4 className="product-name">{product.name}</h4>

                  <div className="price-block">
                    <div className="price-left">
                      {product.sale ? (
                        <>
                          <div className="discount-price">
                            {formatCurrency(product.price * 0.66)}
                          </div>
                          <div className="original-price">
                            {formatCurrency(product.price)}
                          </div>
                        </>
                      ) : (
                        <div className="discount-price">
                          {formatCurrency(product.price)}
                        </div>
                      )}
                    </div>
                    {product.sale > 0 && product.price > 0 && (
                      <div className="discount-percent">
                        -{Math.round((product.sale / product.price) * 100)}%
                      </div>
                    )}
                  </div>

                  <button
                    className="add-to-cart"
                    onClick={() =>
                      addToCart({
                        _id: product._id,
                        name: product.name,
                        price: product.price,
                        quantity: 1,
                        img_url: product.img_url,
                      })
                    }
                  >
                    <FaShoppingCart /> Thêm vào giỏ
                  </button>
                </div>
              ))
            ) : (
              <p style={{ padding: "16px", textAlign: "center" }}>
                Không có sản phẩm phù hợp.
              </p>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SearchResult;


