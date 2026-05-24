const prisma = require('../config/prisma');
const redis = require('../config/redis');

// @desc    Fetch all products
// @route   GET /api/products
const getProducts = async (req, res) => {
  try {
    const keyword = req.query.keyword || '';
    const categoryQuery = req.query.category && req.query.category !== 'All' ? req.query.category : undefined;

    if (redis) {
       const cacheKey = `products:all:${keyword}:${categoryQuery || 'All'}`;
       const cachedData = await redis.get(cacheKey);
       if (cachedData) return res.json(cachedData);
    }

    const products = await prisma.product.findMany({
      where: {
        name: { contains: keyword, mode: 'insensitive' },
        ...(categoryQuery && { category: categoryQuery })
      },
      include: { sizes: true, images: true }
    });

    const formatted = products.map(p => ({
      ...p,
      _id: p.id,
      images: p.images || {}
    }));
    if (redis) await redis.set(`products:all:${keyword}:${categoryQuery || 'All'}`, formatted, { ex: 3600 });
    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Fetch single product
// @route   GET /api/products/:id
const getProductById = async (req, res) => {
  try {
    if (redis) {
       const cachedProduct = await redis.get(`product:${req.params.id}`);
       if (cachedProduct) return res.json(cachedProduct);
    }

    const product = await prisma.product.findUnique({
      where: { id: req.params.id },
      include: { sizes: true, images: true }
    });
    if (product) {
      const formatted = { ...product, _id: product.id, images: product.images || {} };
      if (redis) await redis.set(`product:${req.params.id}`, formatted, { ex: 3600 });
      res.json(formatted);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a product
// @route   POST /api/products
const createProduct = async (req, res) => {
  try {
    const { name, description, price, sizes, category, images, isFeatured, brand, color, material } = req.body;

    const createdProduct = await prisma.product.create({
      data: {
        name,
        description,
        price: price !== undefined && price !== '' ? parseFloat(price) : 0,
        category,
        isFeatured,
        brand,
        color,
        material,
        images: {
          create: {
            front: images?.front || '',
            side: images?.side || '',
            back: images?.back || '',
            perspective: images?.perspective || ''
          }
        },
        sizes: {
          create: sizes?.map(s => ({
            size: s.size,
            quantity: s.quantity !== undefined && s.quantity !== '' ? parseInt(s.quantity, 10) : 0
          })) || []
        }
      },
      include: { sizes: true, images: true }
    });

    await prisma.adminLog.create({
      data: {
        adminId: req.user.id,
        actionType: 'CREATE_PRODUCT',
        targetDocument: createdProduct.id,
        details: `Created product: ${createdProduct.name}`
      }
    });

    if (redis) await redis.flushdb();

    res.status(201).json({ ...createdProduct, _id: createdProduct.id, images: createdProduct.images || {} });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Update a product
// @route   PUT /api/products/:id
const updateProduct = async (req, res) => {
  try {
    const { name, price, description, images, category, sizes, brand, color, material } = req.body;

    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (product) {
      const updatedProduct = await prisma.product.update({
        where: { id: req.params.id },
        data: {
          ...(name && { name }),
          ...(price !== undefined && price !== '' && { price: parseFloat(price) }),
          ...(description && { description }),
          ...(category && { category }),
          ...(brand !== undefined && { brand }),
          ...(color !== undefined && { color }),
          ...(material !== undefined && { material }),
          ...(images && {
             images: {
               upsert: {
                 create: { front: images.front, side: images.side, back: images.back, perspective: images.perspective },
                 update: { front: images.front, side: images.side, back: images.back, perspective: images.perspective }
               }
             }
          })
        },
        include: { sizes: true, images: true }
      });

      if (sizes) {
         await prisma.productSize.deleteMany({ where: { productId: product.id } });
         await prisma.productSize.createMany({
            data: sizes.map(s => ({ 
              productId: product.id, 
              size: s.size, 
              quantity: s.quantity !== undefined && s.quantity !== '' ? parseInt(s.quantity, 10) : 0 
            }))
         });
      }

      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'UPDATE_PRODUCT',
          targetDocument: product.id,
          details: `Updated product: ${updatedProduct.name}`
        }
      });

      if (redis) await redis.flushdb();

      const finalProduct = await prisma.product.findUnique({ where: { id: req.params.id }, include: { sizes: true, images: true } });
      res.json({ ...finalProduct, _id: finalProduct.id, images: finalProduct.images || {} });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// @desc    Delete a product
// @route   DELETE /api/products/:id
const deleteProduct = async (req, res) => {
  try {
    const product = await prisma.product.findUnique({ where: { id: req.params.id } });

    if (product) {
      await prisma.product.delete({ where: { id: req.params.id } });

      await prisma.adminLog.create({
        data: {
          adminId: req.user.id,
          actionType: 'DELETE_PRODUCT',
          targetDocument: req.params.id,
          details: `Deleted product: ${product.name}`
        }
      });

      if (redis) await redis.flushdb();

      res.json({ message: 'Product removed' });
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
};
