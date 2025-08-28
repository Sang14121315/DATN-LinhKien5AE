const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const forgotPasswordController = require("../controllers/forgotPasswordController");
const productController = require("../controllers/productController");
const categoryController = require("../controllers/categoryController");
const brandController = require("../controllers/brandController");
const couponController = require("../controllers/couponController");
const orderController = require("../controllers/orderController");
const notificationController = require("../controllers/notificationController");
const messageController = require("../controllers/messageController");
const homeController = require("../controllers/homeController");
const contactController = require("../controllers/contactController");
const productTypeController = require("../controllers/productTypeController");
const cartController = require("../controllers/cartController");
const favoriteController = require("../controllers/favoriteController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");

// Home
router.get("/home", homeController.getHomeData);

// Search
router.get("/search", auth, productController.searchProducts);

// Contact
router.post("/contact", contactController.createContact);

// Auth
router.post("/register", userController.register);
router.post("/login", userController.login);
router.post(
  "/forgot-password",
  forgotPasswordController.sendForgotPasswordEmail
);
router.post("/reset-password", forgotPasswordController.resetPassword);

router.get("/auth/validate", auth, userController.validateToken);

// Cart
router.post("/cart", auth, cartController.addItem);
router.get("/cart", auth, cartController.getCart);
router.put("/cart", auth, cartController.updateItem);
router.delete("/cart", auth, cartController.removeItem);
router.delete("/cart/clear", auth, cartController.clearCart);

// Products
router.get("/products/search", productController.searchProducts);
router.get("/products", productController.getProducts);
// FIX: Thêm route stock-info cho product
// router.get("/product/stock-info/:id", productController.getInventoryInfo);
router.post(
  "/products",
  auth,
  upload.single("image"),
  productController.createProduct
);
router.get("/products/:id", productController.getProductById);
router.put(
  "/products/:id",
  auth,
  upload.single("image"),
  productController.updateProduct
);
router.delete("/products/:id", auth, productController.deleteProduct);
// ✅ THÊM: Inventory Management Routes
router.post("/products/check-availability", productController.checkAvailability);
router.get("/products/:id/inventory", productController.getInventoryInfo);

// Categories - Gộp thành 1 endpoint duy nhất
router.get("/categories", categoryController.getCategories);
router.get("/categories/hierarchy", categoryController.getCategoriesHierarchy);
router.get("/categories/parent-dropdown", categoryController.getParentCategoriesForDropdown);
router.get("/categories/:id", categoryController.getCategoryById);
router.post("/categories", categoryController.createCategory);
router.put("/categories/:id", categoryController.updateCategory);
router.delete("/categories/:id", categoryController.deleteCategory);

// Brands
router.get("/brands", brandController.getBrands);
router.get("/brands/:id", brandController.getBrandById);
router.post("/brands", upload.single("logo"), brandController.createBrand);
router.put("/brands/:id", upload.single("logo"), brandController.updateBrand);
router.delete("/brands/:id", brandController.deleteBrand);

// Product Types
router.get("/product-types", productTypeController.getProductTypes);
router.get("/product-types/:id", productTypeController.getProductTypeById);
router.post("/product-types", productTypeController.createProductType);
router.put("/product-types/:id", productTypeController.updateProductType);
router.delete("/product-types/:id", productTypeController.deleteProductType);

// Coupons
router.get("/coupons", couponController.getCoupons);
router.get("/coupons/:id", couponController.getCouponById);
router.post("/coupons", couponController.createCoupon);
router.put("/coupons/:id", couponController.updateCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);
router.post("/coupons/redeem", auth, couponController.redeemCoupon);
router.get("/coupons/user-count-in-month/:couponId", auth, couponController.getUserCouponCountInMonth);
// Thêm route lấy voucher đã đổi điểm
router.get("/my-coupons", auth, couponController.getMyCoupons);

// Orders
router.get("/orders", auth, orderController.getOrders);
router.get("/orders/:id", auth, orderController.getOrderById);
router.post("/orders", auth, orderController.createOrder);
router.put("/orders/:id", auth, orderController.updateOrder);
router.delete("/orders/:id", auth, orderController.deleteOrder);

// Test route để kiểm tra authentication
router.get("/test-auth", auth, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
    isAdmin: req.user.role === "admin",
  });
});

// Notifications
router.get("/notifications", auth, notificationController.getNotifications);
router.get(
  "/notifications/:id",
  auth,
  notificationController.getNotificationById
);
router.post("/notifications", auth, notificationController.createNotification);
router.put(
  "/notifications/:id",
  auth,
  notificationController.updateNotification
);
router.delete(
  "/notifications/:id",
  auth,
  notificationController.deleteNotification
);

// Messages
router.get("/messages", auth, messageController.getConversation);
router.post("/messages", auth, messageController.sendMessage);
router.get("/admins", auth, messageController.getAdmins);

// Momo payment
router.post("/momo/create", auth, orderController.createMomoOrder);
router.post("/momo/webhook", orderController.momoWebhook);

// User management (admin)
router.get("/users", userController.getUsers);
router.get("/users/:id", userController.getUserById);
router.put("/users/:id", userController.updateUser);
router.delete("/users/:id", userController.deleteUser);
router.patch("/users/:id/block", userController.blockUser);

// User profile (user)
router.get("/profile", auth, userController.getCurrentUser);
router.put("/profile", auth, userController.updateProfile);
router.put("/profile/change-password", auth, userController.changePassword);

// Loyalty (Khách hàng thân thiết)
router.get('/loyalty/info', auth, userController.getLoyaltyInfo);
router.get('/loyalty/history', auth, userController.getLoyaltyHistory);
router.post('/loyalty/redeem', auth, userController.redeemLoyaltyPoints);

// Rewards (ưu đãi/quà tặng)
router.get('/rewards', userController.getRewardList);
router.post('/rewards/redeem', auth, userController.redeemReward);

// Contact management (admin)
router.get("/contacts", contactController.getContacts);
router.patch("/contacts/:id/status", contactController.updateContactStatus);
router.patch("/contacts/:id/open", contactController.openContact);
router.delete("/contacts/:id", contactController.deleteContact);
router.get("/contacts/:id", contactController.getContactById);
router.post("/contacts/:id/reply", contactController.replyContact);

// Favorite (user)
router.post("/favorite/add", auth, favoriteController.addFavorite);
router.post("/favorite/remove", auth, favoriteController.removeFavorite);
router.get("/favorite/my", auth, favoriteController.getUserFavorites);

// Review (user)
router.post('/review/add', auth, reviewController.addReview);
router.post('/review/remove', auth, reviewController.removeReview);
router.get('/review/product/:product_id', reviewController.getProductReviews);
router.get('/review/user/:product_id', auth, reviewController.getUserReviewsForProduct);
router.get('/review/unreviewed-orders/:product_id', auth, reviewController.getUnreviewedOrderDetails);
router.put('/review/update/:review_id', auth, reviewController.updateReview);

// New routes for enhanced review functionality
router.get('/review/user-latest/:product_id', auth, reviewController.getUserLatestReviewForProduct);
router.get('/review/can-review/:product_id', auth, reviewController.canUserReviewProduct);
router.get('/review/check-reviewed/:orderId/:productId', auth, reviewController.checkIfUserReviewedProductFromOrder);

// Review (admin)
router.post("/review/admin-reply", auth, reviewController.adminReply);

module.exports = router;