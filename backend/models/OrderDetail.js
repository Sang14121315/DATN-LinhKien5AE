const mongoose = require("mongoose");

const OrderDetailSchema = new mongoose.Schema({
  order_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Order', required: true },
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
  quantity: { type: Number, required: true },
  price: { type: Number, required: true },
  name: { type: String, required: true },
  img_url: { type: String, default: '' },
  
  // Fields for Hybrid Stock Management
  stock_status: { 
    type: String, 
    enum: ['reserved', 'confirmed', 'released'], 
    default: 'reserved' 
  },
  reserved_at: { type: Date, default: Date.now },
  confirmed_at: { type: Date },
  released_at: { type: Date },
  
  // Fields for review system
  reviewed: { type: Boolean, default: false },
  review_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Review' },
  
  // Additional tracking fields
  unit_cost: { type: Number }, // Cost price for profit calculation
  discount_amount: { type: Number, default: 0 },
  tax_amount: { type: Number, default: 0 },
  
  // Product snapshot at time of order (for data integrity)
  product_snapshot: {
    name: String,
    description: String,
    category: String,
    brand: String,
    sku: String
  }
}, { 
  timestamps: true,
  // Add indexes for better query performance
  indexes: [
    { order_id: 1 },
    { product_id: 1 },
    { stock_status: 1 },
    { reviewed: 1 },
    { 'product_id': 1, 'reviewed': 1 } // Compound index for review queries
  ]
});

// Middleware to automatically set confirmed_at when stock_status changes to 'confirmed'
OrderDetailSchema.pre('save', function(next) {
  if (this.isModified('stock_status')) {
    if (this.stock_status === 'confirmed' && !this.confirmed_at) {
      this.confirmed_at = new Date();
    } else if (this.stock_status === 'released' && !this.released_at) {
      this.released_at = new Date();
    }
  }
  next();
});

// Virtual for checking if item can be reviewed
OrderDetailSchema.virtual('can_review').get(function() {
  return this.stock_status === 'confirmed' && !this.reviewed;
});

// Static method to get unreviewed order details for a user and product
OrderDetailSchema.statics.getUnreviewedForUserAndProduct = function(userId, productId) {
  return this.aggregate([
    {
      $lookup: {
        from: 'orders',
        localField: 'order_id',
        foreignField: '_id',
        as: 'order'
      }
    },
    {
      $unwind: '$order'
    },
    {
      $match: {
        'order.user_id': new mongoose.Types.ObjectId(userId),
        'product_id': new mongoose.Types.ObjectId(productId),
        'stock_status': 'confirmed',
        'reviewed': false
      }
    },
    {
      $sort: { createdAt: -1 }
    }
  ]);
};

// Static method to reserve stock for order details
OrderDetailSchema.statics.reserveStock = async function(orderDetails) {
  const bulkOps = orderDetails.map(detail => ({
    updateOne: {
      filter: { _id: detail._id },
      update: { 
        stock_status: 'reserved',
        reserved_at: new Date()
      }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Static method to confirm stock for order details (when order is completed/delivered)
OrderDetailSchema.statics.confirmStock = async function(orderDetails) {
  const bulkOps = orderDetails.map(detail => ({
    updateOne: {
      filter: { _id: detail._id },
      update: { 
        stock_status: 'confirmed',
        confirmed_at: new Date()
      }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Static method to release stock for order details (when order is cancelled)
OrderDetailSchema.statics.releaseStock = async function(orderDetails) {
  const bulkOps = orderDetails.map(detail => ({
    updateOne: {
      filter: { _id: detail._id },
      update: { 
        stock_status: 'released',
        released_at: new Date()
      }
    }
  }));
  
  return this.bulkWrite(bulkOps);
};

// Instance method to mark as reviewed
OrderDetailSchema.methods.markAsReviewed = function(reviewId) {
  this.reviewed = true;
  this.review_id = reviewId;
  return this.save();
};

// Instance method to unmark as reviewed (when review is deleted)
OrderDetailSchema.methods.unmarkAsReviewed = function() {
  this.reviewed = false;
  this.review_id = undefined;
  return this.save();
};

module.exports = mongoose.model("OrderDetail", OrderDetailSchema);