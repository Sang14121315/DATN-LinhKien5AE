const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const productController = require("../controllers/productController");
const orderController = require("../controllers/orderController");
const adminController = require("../controllers/adminController");
const brandController = require("../controllers/brandController");
const reviewController = require("../controllers/reviewController");
const auth = require("../middleware/auth");
const upload = require("../middleware/upload");
const adminAuth = require("../middleware/adminAuth");
const notificationController = require("../controllers/notificationController");
const messageController = require("../controllers/messageController");
const couponController = require("../controllers/couponController");
const contactController = require("../controllers/contactController");
const categoryController = require("../controllers/categoryController");

// Admin routes
router.get("/users", adminAuth, userController.getUsers);
router.put("/users/:id", adminAuth, userController.updateUser);
router.delete("/users/:id", adminAuth, userController.deleteUser);

router.get("/products/manage", adminAuth, productController.getProducts);
router.post(
  "/products/manage",
  adminAuth,
  upload.single("image"),
  productController.createProduct
);

router.get("/orders/manage", adminAuth, orderController.getOrders);
router.put("/orders/:id/status", adminAuth, orderController.updateOrder);
router.patch("/users/:id/block", adminAuth, userController.blockUser);

// Admin routes: Review Management
router.get("/reviews", auth, adminAuth, reviewController.getAllReviews);
router.put("/reviews/:review_id/reply", auth, adminAuth, reviewController.adminReply);
router.delete("/reviews/:review_id", auth, adminAuth, reviewController.deleteReview);

// Admin routes: Notification Management
router.get(
  "/notifications",
  auth,
  adminAuth,
  notificationController.getNotifications
);
router.get(
  "/notifications/:id",
  auth,
  adminAuth,
  notificationController.getNotificationById
);
router.post(
  "/notifications",
  auth,
  adminAuth,
  notificationController.createNotification
);
router.put(
  "/notifications/:id",
  auth,
  adminAuth,
  notificationController.updateNotification
);
router.delete(
  "/notifications/:id",
  auth,
  adminAuth,
  notificationController.deleteNotification
);

// Admin Coupons
router.get("/coupons", auth, adminAuth, couponController.getCoupons);
router.get("/coupons/:id", auth, adminAuth, couponController.getCouponById);
router.post("/coupons", auth, adminAuth, couponController.createCoupon);
router.put("/coupons/:id", auth, adminAuth, couponController.updateCoupon);
router.delete("/coupons/:id", auth, adminAuth, couponController.deleteCoupon);

// Admin routes: Chat Management
router.get("/messages", auth, adminAuth, messageController.getConversation);
router.post("/messages", auth, adminAuth, messageController.sendMessage);
router.get("/users-for-chat", auth, adminAuth, userController.getUsers);

// Admin routes: Contact Management
router.get("/contacts", auth, adminAuth, contactController.getContacts);
router.put("/contacts/:id", auth, adminAuth, contactController.updateContact);

// Dashboard
router.get("/dashboard", auth, adminAuth, adminController.getDashboardData);
router.get(
  "/dashboard/revenue-orders-by-date",
  auth,
  adminAuth,
  adminController.getRevenueAndOrdersByDate
);
router.get(
  "/dashboard/top5-bestseller-products",
  auth,
  adminAuth,
  adminController.getTop5BestSellerProducts
);

// Categories (Gộp thành 1 trang quản lý)
router.get("/categories", auth, adminAuth, categoryController.getCategories);
router.get("/categories/hierarchy", auth, adminAuth, categoryController.getCategoriesHierarchy);
router.get("/categories/parent-dropdown", auth, adminAuth, categoryController.getParentCategoriesForDropdown);
router.get("/categories/:id", auth, adminAuth, categoryController.getCategoryById);
router.post("/categories", auth, adminAuth, categoryController.createCategory);
router.put("/categories/:id", auth, adminAuth, categoryController.updateCategory);
router.delete("/categories/:id", auth, adminAuth, categoryController.deleteCategory);

// Brands
router.get("/brands", auth, adminAuth, brandController.getBrands);
router.get("/brands/:id", auth, adminAuth, brandController.getBrandById);
router.post(
  "/brands",
  auth,
  adminAuth,
  upload.single("logoFile"),
  brandController.createBrand
);
router.put(
  "/brands/:id",
  auth,
  adminAuth,
  upload.single("logoFile"),
  brandController.updateBrand
);
router.delete("/brands/:id", auth, adminAuth, brandController.deleteBrand);

// Email admin info route - EmailJS được sử dụng ở frontend
router.get("/admin-emails", auth, adminAuth, async (req, res) => {
  res.json({
    success: true,
    message: "EmailJS được sử dụng ở frontend",
    adminEmails: [],
  });
});

module.exports = router;