const mongoose = require('mongoose');
const ProductType = require('../models/ProductType');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/linhkien5ae', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function createDefaultProductType() {
  try {
    console.log('🔍 Checking for existing product types...');

    const existingTypes = await ProductType.find();
    console.log('📊 Found', existingTypes.length, 'product types');

    if (existingTypes.length === 0) {
      console.log('📝 Creating default product type...');
      
      const defaultType = new ProductType({
        name: 'Sản phẩm thường',
        slug: 'san-pham-thuong',
        description: 'Loại sản phẩm mặc định'
      });

      const savedType = await defaultType.save();
      console.log('✅ Created default product type:', {
        id: savedType._id,
        name: savedType.name,
        slug: savedType.slug
      });
    } else {
      console.log('✅ Product types already exist');
      existingTypes.forEach(type => {
        console.log('-', type.name, '(ID:', type._id, ')');
      });
    }

  } catch (error) {
    console.error('❌ Error:', error.message);
  } finally {
    mongoose.connection.close();
  }
}

createDefaultProductType();
