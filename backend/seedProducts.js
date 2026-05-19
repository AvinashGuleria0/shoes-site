const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const products = [
  {
    name: 'Air Max 270',
    description: 'The Nike Air Max 270 delivers visible cushioning under every step. Updated for modern comfort, it nods to the original 180.',
    price: 11495,
    category: 'Lifestyle',
    isFeatured: true,
    images: {
      front: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      back: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80',
      perspective: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=1000&q=80'
    },
    sizes: [
      { size: 'UK 7', quantity: 5 },
      { size: 'UK 8', quantity: 15 },
      { size: 'UK 9', quantity: 10 },
      { size: 'UK 10', quantity: 5 }
    ]
  },
  {
    name: 'Air Jordan 1 Retro High',
    description: "Familiar but always fresh. The iconic Air Jordan 1 is reimagined for today's sneakerhead culture.",
    price: 15995,
    category: 'Basketball',
    isFeatured: false,
    images: {
      front: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80',
      back: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80',
      perspective: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?auto=format&fit=crop&w=1000&q=80'
    },
    sizes: [
      { size: 'UK 8', quantity: 2 },
      { size: 'UK 9', quantity: 1 },
      { size: 'UK 10', quantity: 2 }
    ]
  },
  {
    name: 'Nike Dunk Low',
    description: 'Created for the hardwood but taken to the streets, the Nike Dunk Low returns with crisp overlays and original team colors.',
    price: 8295,
    category: 'Lifestyle',
    isFeatured: false,
    images: {
      front: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      side: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      back: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80',
      perspective: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?auto=format&fit=crop&w=1000&q=80'
    },
    sizes: [
      { size: 'UK 7', quantity: 10 },
      { size: 'UK 8', quantity: 20 },
      { size: 'UK 9', quantity: 20 },
      { size: 'UK 10', quantity: 10 },
      { size: 'UK 11', quantity: 5 }
    ]
  }
];

const seedData = async () => {
  try {
    console.log('Connecting to Neon DB Prisma...');
    
    // Clear old data safely (Cascades down to sizes and images)
    await prisma.productSize.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.product.deleteMany();
    console.log('Old catalog cleared.');

    console.log('Seeding new catalog...');
    for (const p of products) {
      await prisma.product.create({
        data: {
          name: p.name,
          description: p.description,
          price: p.price,
          category: p.category,
          isFeatured: p.isFeatured,
          images: {
            create: p.images
          },
          sizes: {
            create: p.sizes
          }
        }
      });
    }

    console.log('PostgreSQL Database Seeded Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding Error:', error);
    process.exit(1);
  }
};

seedData();