import Product from '../models/Product.js';

// @desc    Get all products with pagination, search, filter, and sort
// @route   GET /api/products
// @access  Public
export const getProducts = async (req, res) => {
  const pageSize = Number(req.query.limit) || 12;
  const page = Number(req.query.page) || 1;

  const keyword = req.query.keyword
    ? {
        $or: [
          { name: { $regex: req.query.keyword, $options: 'i' } },
          { brand: { $regex: req.query.keyword, $options: 'i' } },
          { description: { $regex: req.query.keyword, $options: 'i' } }
        ]
      }
    : {};

  const category = req.query.category ? { category: req.query.category } : {};
  const brand = req.query.brand ? { brand: req.query.brand } : {};

  // Ratings filter: minimum rating
  const minRating = req.query.rating ? { rating: { $gte: Number(req.query.rating) } } : {};

  // Price filter: range price
  let priceFilter = {};
  if (req.query.minPrice || req.query.maxPrice) {
    priceFilter = {
      price: {
        ...(req.query.minPrice ? { $gte: Number(req.query.minPrice) } : {}),
        ...(req.query.maxPrice ? { $lte: Number(req.query.maxPrice) } : {})
      }
    };
  }

  // Discount filter
  const hasDiscount = req.query.discount === 'true' ? { discountPercentage: { $gt: 0 } } : {};

  // Availability filter (in stock)
  const inStock = req.query.inStock === 'true' ? { 'variants.stockQuantity': { $gt: 0 } } : {};

  // Merge all filters
  const filterQuery = {
    ...keyword,
    ...category,
    ...brand,
    ...minRating,
    ...priceFilter,
    ...hasDiscount,
    ...inStock
  };

  // Sorting
  let sortQuery = {};
  const sortBy = req.query.sortBy;
  if (sortBy === 'priceAsc') {
    sortQuery = { price: 1 };
  } else if (sortBy === 'priceDesc') {
    sortQuery = { price: -1 };
  } else if (sortBy === 'newest') {
    sortQuery = { createdAt: -1 };
  } else if (sortBy === 'highestRated') {
    sortQuery = { rating: -1 };
  } else if (sortBy === 'bestSelling') {
    // Best selling simulated by ranking reviews/rating or stock
    sortQuery = { numReviews: -1, rating: -1 };
  } else {
    // Default: Sort by rating/creation
    sortQuery = { createdAt: -1 };
  }

  try {
    const count = await Product.countDocuments(filterQuery);
    const products = await Product.find(filterQuery)
      .sort(sortQuery)
      .limit(pageSize)
      .skip(pageSize * (page - 1));

    res.json({
      products,
      page,
      pages: Math.ceil(count / pageSize),
      totalProducts: count
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get single product by ID
// @route   GET /api/products/:id
// @access  Public
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (product) {
      res.json(product);
    } else {
      res.status(404).json({ message: 'Product not found' });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get recommendations (Related, Similar, Frequently Bought Together)
// @route   GET /api/products/:id/recommendations
// @access  Public
export const getProductRecommendations = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({ message: 'Product not found' });
    }

    // Related products (same category, excluding this product)
    const related = await Product.find({
      category: product.category,
      _id: { $ne: product._id }
    })
      .sort({ rating: -1 })
      .limit(5);

    // Similar products (same category or similar brand, excluding this product)
    const similar = await Product.find({
      $or: [
        { category: product.category },
        { brand: product.brand }
      ],
      _id: { $ne: product._id }
    })
      .limit(5);

    // Frequently bought together (random products in the system or same category with high reviews)
    const frequentlyBought = await Product.find({
      _id: { $ne: product._id }
    })
      .sort({ numReviews: -1 })
      .limit(3);

    res.json({
      related,
      similar,
      frequentlyBought
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique categories
// @route   GET /api/products/meta/categories
// @access  Public
export const getProductCategories = async (req, res) => {
  try {
    const categories = await Product.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all unique brands
// @route   GET /api/products/meta/brands
// @access  Public
export const getProductBrands = async (req, res) => {
  try {
    const brands = await Product.distinct('brand');
    res.json(brands);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
