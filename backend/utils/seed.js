import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Coupon from '../models/Coupon.js';
import Order from '../models/Order.js';
import connectDB from '../config/db.js';

dotenv.config();

// Standard categories requested
const categories = [
  'Electronics',
  'Fashion',
  'Footwear',
  'Watches',
  'Books',
  'Home Appliances',
  'Sports',
  'Beauty',
  'Grocery',
  'Accessories'
];

const typeImages = {
  // Electronics
  'Smartphone': 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop&q=60',
  'Laptop Pro': 'https://images.unsplash.com/photo-1496181130204-755241524eab?w=600&auto=format&fit=crop&q=60',
  'Tablet Air': 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?w=600&auto=format&fit=crop&q=60',
  'Wireless Headphones': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop&q=60',
  'Smart Display': 'https://images.unsplash.com/photo-1584006682522-dc17d6c0d06c?w=600&auto=format&fit=crop&q=60',
  'Powerbank': 'https://images.unsplash.com/photo-1609091839311-d5365f9ff1c5?w=600&auto=format&fit=crop&q=60',
  'Router Max': 'https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=600&auto=format&fit=crop&q=60',
  
  // Fashion
  'Cotton Crewneck': 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=60',
  'Waterproof Parka': 'https://images.unsplash.com/photo-1543087903-1ac2ec7aa8c5?w=600&auto=format&fit=crop&q=60',
  'Slim Fit Denim': 'https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=600&auto=format&fit=crop&q=60',
  'Summer Dress': 'https://images.unsplash.com/photo-1485230895905-ec40ba36b9bc?w=600&auto=format&fit=crop&q=60',
  'Chino Trousers': 'https://images.unsplash.com/photo-1473966968600-fa801b869a1a?w=600&auto=format&fit=crop&q=60',
  'Knitted Sweater': 'https://images.unsplash.com/photo-1614975059251-992f11792b9f?w=600&auto=format&fit=crop&q=60',

  // Footwear
  'Running Sneakers': 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600&auto=format&fit=crop&q=60',
  'Leather Boots': 'https://images.unsplash.com/photo-1539185441755-769473a23570?w=600&auto=format&fit=crop&q=60',
  'Cork Sandals': 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&auto=format&fit=crop&q=60',
  'Casual Loafers': 'https://images.unsplash.com/photo-1550399504-8953e1a6ac87?w=600&auto=format&fit=crop&q=60',
  'Trail Running Shoes': 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=600&auto=format&fit=crop&q=60',
  'Slip-on Slides': 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=600&auto=format&fit=crop&q=60',

  // Watches
  'Hybrid Smartwatch': 'https://images.unsplash.com/photo-1434494878577-86c23bcb06b9?w=600&auto=format&fit=crop&q=60',
  'Classic Analog': 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=60',
  'Sports Tracker': 'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?w=600&auto=format&fit=crop&q=60',
  'Titanium Automaton': 'https://images.unsplash.com/photo-1542496658-e33a6d0d50f6?w=600&auto=format&fit=crop&q=60',
  'Minimalist Dial': 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?w=600&auto=format&fit=crop&q=60',
  'Chronograph': 'https://images.unsplash.com/photo-1522312346375-d1a52e2b99b3?w=600&auto=format&fit=crop&q=60',

  // Books
  'Mystery Thriller Novel': 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=600&auto=format&fit=crop&q=60',
  'Cooking Recipe Guide': 'https://images.unsplash.com/photo-1506880018603-83d5b814b5a6?w=600&auto=format&fit=crop&q=60',
  'World History Digest': 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=60',
  'Quantum Physics Intro': 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=600&auto=format&fit=crop&q=60',
  'Startup Playbook': 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=600&auto=format&fit=crop&q=60',

  // Home Appliances
  'Personal Blender': 'https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=600&auto=format&fit=crop&q=60',
  'Smart Microwave': 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=600&auto=format&fit=crop&q=60',
  'Cordless Vacuum': 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=600&auto=format&fit=crop&q=60',
  'Convection Airfryer': 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=60',
  'Juice Extractor': 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=600&auto=format&fit=crop&q=60',

  // Sports
  'Adjustable Kettlebell': 'https://images.unsplash.com/photo-1599447421416-3414500d18a5?w=600&auto=format&fit=crop&q=60',
  'Non-Slip Yoga Mat': 'https://images.unsplash.com/photo-1592432678016-e910b452f9a2?w=600&auto=format&fit=crop&q=60',
  'Speed Jump Rope': 'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=600&auto=format&fit=crop&q=60',
  'Ergonomic Dumbbell Set': 'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop&q=60',
  'Compression Sleeve': 'https://images.unsplash.com/photo-1580087433295-ab2600c1030e?w=600&auto=format&fit=crop&q=60',

  // Beauty
  'Hydrating Face Cleanser': 'https://images.unsplash.com/photo-1596462502278-27bfdc403348?w=600&auto=format&fit=crop&q=60',
  'Matte Lip Gloss Set': 'https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?w=600&auto=format&fit=crop&q=60',
  'Vitamin C Serum': 'https://images.unsplash.com/photo-1608248597481-496100c80836?w=600&auto=format&fit=crop&q=60',
  'Organic Argan Hair Oil': 'https://images.unsplash.com/photo-1515688594390-b649af70d282?w=600&auto=format&fit=crop&q=60',
  'Facial Moisturizer': 'https://images.unsplash.com/photo-1629198688000-71f23e745b6e?w=600&auto=format&fit=crop&q=60',

  // Grocery
  'Specialty Coffee Beans': 'https://images.unsplash.com/photo-1576092768241-dec231879fc3?w=600&auto=format&fit=crop&q=60',
  'Organic Green Tea Bag': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=600&auto=format&fit=crop&q=60',
  'Cold Pressed Olive Oil': 'https://images.unsplash.com/photo-1547592180-85f173990554?w=600&auto=format&fit=crop&q=60',
  'Gluten-Free Penne Pasta': 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=600&auto=format&fit=crop&q=60',
  'Rolled Oats': 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=600&auto=format&fit=crop&q=60',

  // Accessories
  'Minimalist Leather Wallet': 'https://images.unsplash.com/photo-1627124118303-624c89432f82?w=600&auto=format&fit=crop&q=60',
  'Anti-UV Sunglasses': 'https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=600&auto=format&fit=crop&q=60',
  'Full Grain Leather Belt': 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=60',
  'Canvas Travel Backpack': 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=60',
  'Laptop Sleeve': 'https://images.unsplash.com/photo-1603539947678-cd3954ed515d?w=600&auto=format&fit=crop&q=60'
};

const brands = {
  Electronics: ['TechMax', 'ElectroGlow', 'Nexus', 'Volt', 'PixelEdge'],
  Fashion: ['UrbanWear', 'VogueFit', 'DenimCo', 'AuraStyle', 'ThreadArt'],
  Footwear: ['Strider', 'Velocis', 'CloudStep', 'AeroWalk', 'TrekShield'],
  Watches: ['Chronos', 'SmartPhase', 'AeroTime', 'Vanguard', 'ApexDial'],
  Books: ['Apex Press', 'WisdomBooks', 'Beacon Pubs', 'Horizon Press', 'Novelty Books'],
  'Home Appliances': ['KitchenAid', 'PureBreeze', 'PowerVibe', 'HomeShield', 'ThermoGlow'],
  Sports: ['ActiveGear', 'ZenMat', 'IronPulse', 'FitCore', 'SummitPeak'],
  Beauty: ['SkinDew', 'GlowCo', 'VelvetNectar', 'PureElixir', 'Radiance'],
  Grocery: ['OrganicPick', 'BeanBurst', 'DailyHarvest', 'NaturaGrain', 'VitaBite'],
  Accessories: ['CaseCrux', 'BespokeLeather', 'LuminaLense', 'VanguardBags', 'Spectra']
};

const adjectives = ['Premium', 'Ultra', 'Essential', 'Smart', 'Elite', 'Classic', 'Pro', 'Modern', 'Eco', 'Active'];
const itemTypes = {
  Electronics: ['Smartphone', 'Laptop Pro', 'Tablet Air', 'Wireless Headphones', 'Smart Display', 'Powerbank', 'Router Max'],
  Fashion: ['Cotton Crewneck', 'Waterproof Parka', 'Slim Fit Denim', 'Summer Dress', 'Chino Trousers', 'Knitted Sweater'],
  Footwear: ['Running Sneakers', 'Leather Boots', 'Cork Sandals', 'Casual Loafers', 'Trail Running Shoes', 'Slip-on Slides'],
  Watches: ['Hybrid Smartwatch', 'Classic Analog', 'Sports Tracker', 'Titanium Automaton', 'Minimalist Dial', 'Chronograph'],
  Books: ['Mystery Thriller Novel', 'Cooking Recipe Guide', 'World History Digest', 'Quantum Physics Intro', 'Startup Playbook'],
  'Home Appliances': ['Personal Blender', 'Smart Microwave', 'Cordless Vacuum', 'Convection Airfryer', 'Juice Extractor'],
  Sports: ['Adjustable Kettlebell', 'Non-Slip Yoga Mat', 'Speed Jump Rope', 'Ergonomic Dumbbell Set', 'Compression Sleeve'],
  Beauty: ['Hydrating Face Cleanser', 'Matte Lip Gloss Set', 'Vitamin C Serum', 'Organic Argan Hair Oil', 'Facial Moisturizer'],
  Grocery: ['Specialty Coffee Beans', 'Organic Green Tea Bag', 'Cold Pressed Olive Oil', 'Gluten-Free Penne Pasta', 'Rolled Oats'],
  Accessories: ['Minimalist Leather Wallet', 'Anti-UV Sunglasses', 'Full Grain Leather Belt', 'Canvas Travel Backpack', 'Laptop Sleeve']
};

const comments = [
  'Incredible quality! Exceeded my expectations completely.',
  'Good value for the price, would definitely buy again.',
  'Decent product, but delivery was a bit delayed.',
  'Satisfactory product. It works as advertised.',
  'Absolutely love it! Looks premium and functions perfectly.',
  'The materials feel a bit cheap, but it works okay.',
  'Outstanding performance. Strongly recommend to everyone!',
  'Great packaging, fast shipping, and top-tier product.',
  'Average item, could be cheaper.'
];

const seedData = async () => {
  try {
    console.log('Connecting to database...');
    // Connect to MongoDB
    await connectDB();

    // 1. Clear database collections
    console.log('Clearing existing data...');
    await User.deleteMany({});
    await Product.deleteMany({});
    await Review.deleteMany({});
    await Coupon.deleteMany({});
    await Order.deleteMany({});

    // 2. Create Default Users
    console.log('Creating default users...');
    const adminUser = await User.create({
      name: 'ShopEZ Admin',
      email: 'admin@shopez.com',
      password: 'admin1234', // user model pre-save hook hashes this
      role: 'admin'
    });

    const userJohn = await User.create({
      name: 'John Doe',
      email: 'john@gmail.com',
      password: 'john1234',
      role: 'customer',
      addresses: [
        {
          type: 'Home',
          fullName: 'John Doe',
          phone: '+1 555-0199',
          street: '123 Main St',
          city: 'New York',
          state: 'NY',
          zipCode: '10001'
        },
        {
          type: 'Office',
          fullName: 'John Doe at Work',
          phone: '+1 555-0244',
          street: '500 Corporate Pkwy, Suite 4',
          city: 'New York',
          state: 'NY',
          zipCode: '10022'
        }
      ]
    });

    const userAlice = await User.create({
      name: 'Alice Cooper',
      email: 'alice@gmail.com',
      password: 'alice1234',
      role: 'customer',
      addresses: [
        {
          type: 'Home',
          fullName: 'Alice Cooper',
          phone: '+1 555-0311',
          street: '789 Elm Rd',
          city: 'Los Angeles',
          state: 'CA',
          zipCode: '90001'
        }
      ]
    });

    console.log(`Users created: Admin (admin@shopez.com), John (john@gmail.com), Alice (alice@gmail.com)`);

    // 3. Create Coupons
    console.log('Creating promotional coupons...');
    await Coupon.create([
      {
        code: 'WELCOME10',
        discountType: 'percentage',
        discountValue: 10,
        minPurchase: 50,
        expiryDate: new Date('2028-12-31')
      },
      {
        code: 'FLAT50',
        discountType: 'flat',
        discountValue: 50,
        minPurchase: 150,
        expiryDate: new Date('2028-12-31')
      },
      {
        code: 'FLASH20',
        discountType: 'percentage',
        discountValue: 20,
        minPurchase: 30,
        expiryDate: new Date('2028-12-31')
      },
      {
        code: 'MEGA30',
        discountType: 'percentage',
        discountValue: 30,
        minPurchase: 200,
        expiryDate: new Date('2028-12-31')
      }
    ]);
    console.log('Coupons created: WELCOME10, FLAT50, FLASH20, MEGA30');

    // 4. Generate 200+ Products (21 per category -> 210 total)
    console.log('Generating 210 products with variants, images, and reviews...');
    const users = [userJohn, userAlice];
    const generatedProducts = [];

    for (const category of categories) {
      const brandList = brands[category];
      const typeList = itemTypes[category];

      for (let i = 1; i <= 21; i++) {
        const brand = brandList[Math.floor(Math.random() * brandList.length)];
        const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
        const type = typeList[Math.floor(Math.random() * typeList.length)];
        const name = `${adj} ${brand} ${type} ${i}`;
        
        // Price ranges based on category to feel realistic
        let basePrice = 20;
        if (category === 'Electronics') basePrice = 100 + (i * 40);
        else if (category === 'Home Appliances') basePrice = 50 + (i * 15);
        else if (category === 'Watches') basePrice = 30 + (i * 20);
        else if (category === 'Footwear') basePrice = 25 + (i * 5);
        else if (category === 'Fashion') basePrice = 15 + (i * 3);
        else basePrice = 10 + (i * 2);

        // Images rotation (match exactly to product type)
        const images = [typeImages[type] || 'https://via.placeholder.com/600x600?text=No+Image'];

        // Discount percentage
        const discountPercentage = i % 3 === 0 ? 10 + (i % 4) * 5 : 0; // some products have discounts

        // Tags
        const tags = [];
        if (i <= 3) tags.push('Best Seller');
        if (i >= 18) tags.push('New Arrival');
        if (i % 5 === 0) tags.push('Trending');
        if (i % 7 === 0) tags.push('Flash Sale');

        // BOGO
        const isBOGO = i % 9 === 0;

        // Generate specific variants based on category
        const variants = [];
        if (category === 'Fashion' || category === 'Footwear') {
          // sizes: S, M, L, XL
          const sizes = category === 'Fashion' ? ['S', 'M', 'L', 'XL'] : ['7', '8', '9', '10'];
          const colors = ['Black', 'Blue', 'White', 'Gray'];
          
          sizes.forEach((s) => {
            colors.forEach((c) => {
              variants.push({
                size: s,
                color: c,
                priceAdjustment: s === 'XL' || s === '10' ? 5 : 0,
                stockQuantity: 10 + Math.floor(Math.random() * 40)
              });
            });
          });
        } else if (category === 'Electronics') {
          // Storage: 128GB, 256GB
          const storages = ['128GB', '256GB'];
          const colors = ['Midnight', 'Silver', 'Space Gray'];
          
          storages.forEach((s) => {
            colors.forEach((c) => {
              variants.push({
                storage: s,
                color: c,
                priceAdjustment: s === '256GB' ? 100 : 0,
                stockQuantity: 5 + Math.floor(Math.random() * 20)
              });
            });
          });
        } else if (category === 'Grocery' || category === 'Beauty') {
          // Weight/Volume
          const weights = category === 'Grocery' ? ['500g', '1kg'] : ['100ml', '250ml'];
          weights.forEach((w) => {
            variants.push({
              weight: w,
              priceAdjustment: w.includes('1') || w.includes('250') ? 8 : 0,
              stockQuantity: 20 + Math.floor(Math.random() * 80)
            });
          });
        } else {
          // Generic color variants
          const colors = ['Standard Black', 'Standard Silver'];
          colors.forEach((c) => {
            variants.push({
              color: c,
              priceAdjustment: 0,
              stockQuantity: 15 + Math.floor(Math.random() * 35)
            });
          });
        }

        // Make sure at least one variant exists, even if stock is low or empty
        if (variants.length === 0) {
          variants.push({
            stockQuantity: 10 + i
          });
        }

        // Features list
        const features = [
          `High performance ${category.toLowerCase()} product`,
          'Crafted with premium durable materials',
          'Modern design with ergonomics in mind',
          'Offers high reliability and long lifetime',
          'Easy to use out of the box'
        ];

        const description = `This is a high-quality ${name} by ${brand}. Perfect choice for premium ${category.toLowerCase()} enthusiasts looking for high quality, durable, and cost-effective solutions. Includes full manufacturer warranty.`;

        // Write Product to array
        const product = new Product({
          name,
          description,
          brand,
          category,
          price: basePrice,
          discountPercentage,
          images,
          features,
          variants,
          tags,
          isBOGO,
          rating: 0,
          numReviews: 0
        });

        const savedProduct = await product.save();

        // 5. Generate Reviews for this product
        const numProductReviews = 2 + Math.floor(Math.random() * 5); // 2 to 6 reviews per product
        let ratingSum = 0;
        const reviewObjects = [];

        for (let r = 0; r < numProductReviews; r++) {
          const reviewer = users[r % users.length];
          const reviewRating = 3 + Math.floor(Math.random() * 3); // ratings from 3 to 5 stars
          ratingSum += reviewRating;

          const newReview = await Review.create({
            product: savedProduct._id,
            user: reviewer._id,
            userName: reviewer.name,
            rating: reviewRating,
            comment: comments[Math.floor(Math.random() * comments.length)],
            verifiedPurchase: Math.random() > 0.3,
            helpfulVotes: Math.floor(Math.random() * 5)
          });
          reviewObjects.push(newReview);
        }

        // Update Product average rating
        savedProduct.rating = Number((ratingSum / numProductReviews).toFixed(1));
        savedProduct.numReviews = numProductReviews;
        await savedProduct.save();

        generatedProducts.push(savedProduct);
      }
    }

    console.log(`Generated ${generatedProducts.length} products with initial reviews successfully!`);

    // 6. Seed one completed Order to test dashboards
    console.log('Seeding demo completed order...');
    const demoProduct1 = generatedProducts[0]; // Electronics item
    const demoProduct2 = generatedProducts[25]; // Fashion item
    
    // Deduct stock for demo purchase
    demoProduct1.variants[0].stockQuantity -= 1;
    await demoProduct1.save();
    demoProduct2.variants[0].stockQuantity -= 1;
    await demoProduct2.save();

    const demoOrder = await Order.create({
      user: userJohn._id,
      orderItems: [
        {
          product: demoProduct1._id,
          name: demoProduct1.name,
          qty: 1,
          price: demoProduct1.price,
          image: demoProduct1.images[0],
          variant: {
            storage: demoProduct1.variants[0].storage,
            color: demoProduct1.variants[0].color
          }
        },
        {
          product: demoProduct2._id,
          name: demoProduct2.name,
          qty: 1,
          price: demoProduct2.price,
          image: demoProduct2.images[0],
          variant: {
            size: demoProduct2.variants[0].size,
            color: demoProduct2.variants[0].color
          }
        }
      ],
      shippingAddress: userJohn.addresses[0],
      paymentMethod: 'Card',
      paymentResult: {
        id: 'simulated_txn_998877',
        status: 'SUCCESS',
        updateTime: new Date().toISOString()
      },
      itemsPrice: demoProduct1.price + demoProduct2.price,
      taxPrice: (demoProduct1.price + demoProduct2.price) * 0.08,
      shippingPrice: 10,
      discountAmount: 0,
      totalPrice: (demoProduct1.price + demoProduct2.price) * 1.08 + 10,
      isPaid: true,
      paidAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      deliveryStatus: 'Delivered',
      deliveredAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
    });

    console.log('Order seeded: ', demoOrder._id);

    console.log('DATABASE SEEDING COMPLETED SUCCESSFULLY!');
    process.exit(0);
  } catch (error) {
    console.error(`Error during seeding: ${error.message}`);
    process.exit(1);
  }
};

seedData();
