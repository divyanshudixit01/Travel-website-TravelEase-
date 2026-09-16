import React from 'react';
import HeroSection from '../components/home/HeroSection';
import ServiceBentoGrid from '../components/home/ServiceBentoGrid';
import TrendingDestinations from '../components/home/TrendingDestinations';
import CulturalExpedition from '../components/home/CulturalExpedition';
import FlashDeals from '../components/home/FlashDeals';
import Testimonials from '../components/home/Testimonials';
import MobileSuite from '../components/home/MobileSuite';
import Newsletter from '../components/home/Newsletter';
import JsonLd from '../components/seo/JsonLd';
import { getWebPageSchema, getBreadcrumbSchema, getPlatformRatingSchema, getItemListSchema } from '../utils/schemas';

const Home = () => {
  const homeSchemas = [
    getWebPageSchema({
      type: 'CollectionPage',
      name: 'TravelEase — Multi-Modal Travel Platform | IRCTC, Flights, Stays & Custom Itineraries',
      description: 'TravelEase is India\'s multi-modal travel platform. High-performance trip planning, real-time IRCTC & flight deals, and curated stays. Trusted by travelers nationwide.',
      url: '/',
      breadcrumb: true,
    }),
    getBreadcrumbSchema([{ name: 'Home' }], '/'),
    getPlatformRatingSchema(),
    getItemListSchema({
      name: 'Trending Destinations',
      description: 'Most popular travel destinations on TravelEase',
      url: '/',
      items: [
        { name: 'Bali, Indonesia', url: '/destinations', image: 'https://images.unsplash.com/photo-1742677356610-e9bcea7a41c3?auto=format&fit=crop&w=1920&q=80' },
        { name: 'Paris, France', url: '/destinations', image: 'https://images.unsplash.com/photo-1431274172761-fca41d930114?auto=format&fit=crop&w=1920&q=80' },
        { name: 'Tokyo, Japan', url: '/destinations', image: 'https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?auto=format&fit=crop&w=1920&q=80' },
        { name: 'Dubai, UAE', url: '/destinations', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?auto=format&fit=crop&w=1920&q=80' },
        { name: 'Maldives', url: '/destinations', image: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?auto=format&fit=crop&w=1920&q=80' },
        { name: 'Goa, India', url: '/destinations', image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1920&q=80' },
      ],
    }),
  ];

  return (
    <div className="home-page relative bg-slate-50 dark:bg-[#06080d] min-h-screen text-slate-900 dark:text-slate-100 transition-colors duration-500 selection:bg-amber-400 selection:text-black">
      <JsonLd data={homeSchemas} />
      
      {/* 1. CINEMATIC MULTI-MODAL TRAVEL HERO SHOWCASE (5 CHAPTERS) */}
      <HeroSection />

      {/* 2. 3D BENTO GRID FOR CORE SERVICES (TRAINS TATKAL, FLIGHTS, HOTELS, AI ARCHITECT) */}
      <ServiceBentoGrid />

      {/* 3. CURATED TRENDING DESTINATIONS WITH 3D TILT CARDS */}
      <TrendingDestinations />

      {/* 4. THREEUI KAGE-INSPIRED CULTURAL EXPEDITION: INCREDIBLE INDIA */}
      <CulturalExpedition />

      {/* 5. FLASH DEALS & LIMITED WINDOW COUNTDOWN */}
      <FlashDeals />

      {/* 6. VERIFIED TRAVELER PROOF & COMMUNITY STORIES */}
      <Testimonials />

      {/* 7. THREEUI 3D TITANIUM MOBILE SUITE SHOWCASE */}
      <MobileSuite />

      {/* 8. INTELLIGENT FARE RADAR & NEWSLETTER */}
      <Newsletter />
    </div>
  );
};

export default Home;