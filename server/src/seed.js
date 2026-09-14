import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Destination from './models/Destination.js';
import BlogPost from './models/BlogPost.js';
import User from './models/User.js';
import bcrypt from 'bcryptjs';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/travelease';

const sampleDestinations = [
  {
    name: "Goa Beaches",
    slug: "goa-beaches",
    location: "Goa, India",
    category: "beach",
    description: "Sun-kissed golden beaches, vibrant nightlife, and Portuguese colonial heritage.",
    price: "₹8,500",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1560179406-1c6c60e0dc76?q=80&w=1674&auto=format&fit=crop",
    lat: 15.2993,
    lng: 74.1240,
    featured: true,
    highlights: ["Baga Beach", "Dudhsagar Falls", "Old Goa Churches"]
  },
  {
    name: "Taj Mahal",
    slug: "taj-mahal",
    location: "Agra, India",
    category: "heritage",
    description: "An ivory-white marble mausoleum and one of the Seven Wonders of the World.",
    price: "₹4,500",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1610361418971-50cb8d1f8339?q=80&w=1036&auto=format&fit=crop",
    lat: 27.1751,
    lng: 78.0421,
    featured: true,
    highlights: ["Taj Mahal Sunrise", "Agra Fort", "Mehtab Bagh"]
  },
  {
    name: "Kerala Backwaters",
    slug: "kerala-backwaters",
    location: "Kerala, India",
    category: "beach",
    description: "Tranquil houseboats floating through palm-fringed emerald lagoons.",
    price: "₹12,900",
    rating: 4.9,
    image: "https://images.unsplash.com/photo-1593693397690-362cb9666fc2?q=80&w=2069&auto=format&fit=crop",
    lat: 9.4981,
    lng: 76.3388,
    featured: true,
    highlights: ["Alleppey Houseboat", "Munnar Tea Gardens", "Kochi Fort"]
  },
  {
    name: "Jaipur Forts & Palaces",
    slug: "jaipur-forts",
    location: "Rajasthan, India",
    category: "heritage",
    description: "Historic pink palaces, grand hill forts, and royal heritage of Rajasthan.",
    price: "₹15,200",
    rating: 4.7,
    image: "https://images.unsplash.com/photo-1631867675167-90a456a90863?q=80&w=2079&auto=format&fit=crop",
    lat: 26.9124,
    lng: 75.7873,
    featured: true,
    highlights: ["Amber Palace", "Hawa Mahal", "City Palace"]
  },
  {
    name: "Manali & Himachal",
    slug: "manali-himachal",
    location: "Himachal Pradesh, India",
    category: "mountain",
    description: "Snow-capped Himalayan peaks, adventure sports, and scenic alpine valleys.",
    price: "₹10,800",
    rating: 4.8,
    image: "https://images.unsplash.com/photo-1652501834567-937de29c4533?q=80&w=1035&auto=format&fit=crop",
    lat: 32.2432,
    lng: 77.1892,
    featured: true,
    highlights: ["Solang Valley", "Rohtang Pass", "Old Manali"]
  },
  {
    name: "Maldives Overwater Villas",
    slug: "maldives-villas",
    location: "Maldives",
    category: "luxe",
    description: "Turquoise lagoons, luxury overwater villas, and vibrant coral reef diving.",
    price: "₹48,600",
    rating: 5.0,
    image: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?q=80&w=1674&auto=format&fit=crop",
    lat: 3.2028,
    lng: 73.2207,
    featured: true,
    highlights: ["Overwater Bungalow", "Snorkeling with Turtles", "Sunset Cruise"]
  }
];

const sampleBlogPosts = [
  {
    title: "The Ultimate Guide to Solo Travel in Southeast Asia",
    author: "Sarah Johnson",
    excerpt: "Everything you need to know to plan your perfect solo adventure through Thailand, Vietnam, and Cambodia.",
    image: "https://images.unsplash.com/photo-1527631746610-bca00a040d60?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80",
    readTime: "8 min read",
    category: "adventure"
  },
  {
    title: "Rajasthan's Royal Heritage: A 10-Day Itinerary",
    author: "Priya Sharma",
    excerpt: "From Jaipur's Pink City to Udaipur's lake palaces, discover the regal splendor of India's desert state.",
    image: "https://images.unsplash.com/photo-1670254812851-e59013163aee?q=80&w=989&auto=format&fit=crop",
    readTime: "12 min read",
    category: "cultural"
  }
];

const seedDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    await Destination.deleteMany({});
    await BlogPost.deleteMany({});
    await User.deleteMany({ email: 'alex.mercer@example.com' });

    await Destination.insertMany(sampleDestinations);
    await BlogPost.insertMany(sampleBlogPosts);

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);
    await User.create({
      name: 'Alex Mercer',
      email: 'alex.mercer@example.com',
      password: hashedPassword,
      role: 'user',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'
    });

    console.log('✅ MongoDB database seeded successfully with destinations, blog posts, and demo account!');
    process.exit(0);
  } catch (error) {
    console.error('Seed error:', error);
    process.exit(1);
  }
};

seedDB();
