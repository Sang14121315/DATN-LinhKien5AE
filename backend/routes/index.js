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
const favoriteController = require('../controllers/favoriteController');
const reviewController = require('../controllers/reviewController');
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

// Product Types
router.get("/product-types", productTypeController.getProductTypes);
router.get(
  "/product-types-with-categories",
  productTypeController.getProductTypesWithCategories
);
router.get("/product-types/:id", productTypeController.getProductTypeById);
router.post("/product-types", auth, productTypeController.createProductType);
router.put("/product-types/:id", auth, productTypeController.updateProductType);
router.delete(
  "/product-types/:id",
  auth,
  productTypeController.deleteProductType
);

// Categories
router.get('/categories', categoryController.getCategories);
router.get('/categories/by-product-type/:productTypeId', categoryController.getCategoriesByProductType);
router.get('/categories/:id', categoryController.getCategoryById);
router.post('/categories', categoryController.createCategory);
router.put('/categories/:id', categoryController.updateCategory);
router.delete('/categories/:id', categoryController.deleteCategory);

// Brands
router.get("/brands", brandController.getBrands);
router.get("/brands/:id", brandController.getBrandById);
router.post("/brands", upload.single("logo"), brandController.createBrand);
router.put("/brands/:id", upload.single("logo"), brandController.updateBrand);
router.delete("/brands/:id", brandController.deleteBrand);

// Coupons
router.get("/coupons", couponController.getCoupons);
router.get("/coupons/:id", couponController.getCouponById);
router.post("/coupons", couponController.createCoupon);
router.put("/coupons/:id", couponController.updateCoupon);
router.delete("/coupons/:id", couponController.deleteCoupon);

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

// Contact management (admin)
router.get("/contacts", contactController.getContacts);
router.patch("/contacts/:id/status", contactController.updateContactStatus);
router.patch("/contacts/:id/open", contactController.openContact);
router.delete("/contacts/:id", contactController.deleteContact);
router.get("/contacts/:id", contactController.getContactById);
router.post("/contacts/:id/reply", contactController.replyContact);

// Favorite (user)
router.post('/favorite/add', auth, favoriteController.addFavorite);
router.post('/favorite/remove', auth, favoriteController.removeFavorite);
router.get('/favorite/my', auth, favoriteController.getUserFavorites);

// Review (user)
router.post('/review/add', auth, reviewController.addOrUpdateReview);
router.post('/review/remove', auth, reviewController.removeReview);
router.get('/review/product/:product_id', reviewController.getProductReviews);
router.get('/review/user/:product_id', auth, reviewController.getUserReviewsForProduct);
router.get('/orders/check/:product_id', auth, reviewController.getValidOrderCount);

// Review (admin)
router.post('/review/admin-reply', auth, reviewController.adminReply);

module.exports = router;