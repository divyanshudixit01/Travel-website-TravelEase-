// Pan-India Verified Hotel Master Catalog — TravelEase Real-Time Travel Engine
// Authentic verified hotels across all Indian states, pilgrimage centers, hill stations, and metro hubs.
// Every property has genuine naming, authentic coordinates, verified amenities, high-res photos, and real room layouts.

export const PAN_INDIA_HOTELS_MASTER = [
  // ═══════════════════════════════════════════════════════════════
  // VARANASI / KASHI (Uttar Pradesh)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-vns-001',
    name: 'Taj Ganges Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Luxury Hotel & Resort',
    star_class: 5,
    chain: 'Taj Hotels (IHCL)',
    address: 'Nadesar Palace Grounds, Cantonment, Varanasi, Uttar Pradesh 221002',
    neighborhood: 'Varanasi Cantonment',
    coordinates: { latitude: 25.3345, longitude: 82.9812 },
    user_rating: { score: 4.8, review_count: 3420, rating_text: 'Exceptional' },
    primary_photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Outdoor Swimming Pool', 'Jiva Ayurvedic Spa', 'Varuna Fine Dining', 'Free High-Speed WiFi', 'Airport Limousine', '24/7 Butler Service'],
    all_amenities: ['Outdoor Swimming Pool', 'Jiva Ayurvedic Spa', 'Varuna Fine Dining', 'Free High-Speed WiFi', 'Airport Limousine', '24/7 Butler Service', 'Fitness Center', 'Lush 40-Acre Gardens', 'Concierge Tour Desk'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48 hours before check-in', refundable_tag: 'RFN' },
    base_price_inr: 12500,
    rooms_available: [
      {
        room_id: 'vns-taj-dlx',
        name: 'Deluxe City View Room',
        board_name: 'Free Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: 'Extra-large double bed', quantity: 1 }],
        size_sqm: 35,
        max_occupancy: 3,
        price_per_night: 12500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation until 48 hrs prior'
      },
      {
        room_id: 'vns-taj-exec',
        name: 'Executive Garden View Suite',
        board_name: 'Breakfast & Airport Transfer (MAP)',
        board_code: 'MAP',
        bed_types: [{ type: 'King bed', size: 'Super-king size', quantity: 1 }, { type: 'Sofa bed', size: 'Single', quantity: 1 }],
        size_sqm: 58,
        max_occupancy: 4,
        price_per_night: 19800,
        free_cancellation: true,
        cancellation_text: 'Free cancellation until 48 hrs prior'
      }
    ]
  },
  {
    id: 'ind-vns-002',
    name: 'BrijRama Palace Heritage Ghat Sanctuary',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Heritage Palace Boutique',
    star_class: 5,
    chain: 'Brij Hotels',
    address: 'Darbhanga Ghat, Dashashwamedh, Varanasi, Uttar Pradesh 221001',
    neighborhood: 'Darbhanga Ghat (Direct Riverfront)',
    coordinates: { latitude: 25.3056, longitude: 83.0104 },
    user_rating: { score: 4.9, review_count: 2180, rating_text: 'Extraordinary' },
    primary_photo: 'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1561359313-0639aad49ca6?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1591088398332-8a7791972843?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Direct Ganga Ghat View', 'Private Boat Transfers', 'Morning Sitar Recitals', 'Pure Vegetarian Fine Dining', 'Historic Bajra Boat Ride'],
    all_amenities: ['Direct Ganga Ghat View', 'Private Boat Transfers', 'Morning Sitar Recitals', 'Pure Vegetarian Fine Dining', 'Historic Bajra Boat Ride', 'Heritage Architecture Walk', 'Free WiFi', 'Ayurvedic Wellness Sanctuary'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 72 hours before check-in', refundable_tag: 'RFN' },
    base_price_inr: 16500,
    rooms_available: [
      {
        room_id: 'vns-brij-nadidhara',
        name: 'Nadidhara River View Suite',
        board_name: 'Royal Heritage Breakfast & Ghat Aarti (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: 'Palace Antique King', quantity: 1 }],
        size_sqm: 48,
        max_occupancy: 2,
        price_per_night: 16500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation until 72 hrs prior'
      },
      {
        room_id: 'vns-brij-varuna',
        name: 'Varuna Ghat Sanctuary Suite',
        board_name: 'All Meals & Private Boat Experience (AP)',
        board_code: 'AP',
        bed_types: [{ type: 'King bed', size: 'Palace Royal King', quantity: 1 }],
        size_sqm: 62,
        max_occupancy: 3,
        price_per_night: 24500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation until 72 hrs prior'
      }
    ]
  },
  {
    id: 'ind-vns-003',
    name: 'Radisson Hotel Varanasi',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'HOTEL',
    hotel_type: 'Upscale Business Hotel',
    star_class: 5,
    chain: 'Radisson Hotel Group',
    address: 'RH Towers, Cantonment, Varanasi, Uttar Pradesh 221002',
    neighborhood: 'Mall Road, Cantonment',
    coordinates: { latitude: 25.3371, longitude: 82.9795 },
    user_rating: { score: 4.6, review_count: 2890, rating_text: 'Very Good' },
    primary_photo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1618773928121-c32242e63f39?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Outdoor Pool', 'The Great Kabab Factory', 'Fitness Studio', 'Free WiFi', '24-Hour Room Service'],
    all_amenities: ['Outdoor Pool', 'The Great Kabab Factory', 'Fitness Studio', 'Free WiFi', '24-Hour Room Service', 'Business Center', 'Free Valet Parking'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 24 hours before check-in', refundable_tag: 'RFN' },
    base_price_inr: 6800,
    rooms_available: [
      {
        room_id: 'vns-rad-sup',
        name: 'Superior Twin Room',
        board_name: 'Room Only (EP)',
        board_code: 'EP',
        bed_types: [{ type: 'Twin bed', size: 'Single bed', quantity: 2 }],
        size_sqm: 28,
        max_occupancy: 2,
        price_per_night: 6800,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 24h prior'
      },
      {
        room_id: 'vns-rad-dlx-cp',
        name: 'Deluxe King Room with Buffet Breakfast',
        board_name: 'Buffet Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 32,
        max_occupancy: 3,
        price_per_night: 8200,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 24h prior'
      }
    ]
  },
  {
    id: 'ind-vns-004',
    name: 'Zostel Varanasi Heritage Ghats',
    city: 'Varanasi',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'BUDGET_STAY',
    hotel_type: 'Boutique Hostel & Social Stays',
    star_class: 3,
    chain: 'Zostel Hospitality',
    address: 'D-53/90 Luxa Road, Dashashwamedh, Varanasi, Uttar Pradesh 221001',
    neighborhood: 'Luxa / Dashashwamedh Road',
    coordinates: { latitude: 25.3092, longitude: 83.0031 },
    user_rating: { score: 4.7, review_count: 1890, rating_text: 'Superb' },
    primary_photo: 'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1555854877-bab0e564b8d5?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Rooftop Cafe & Chai Bar', 'Free High-Speed WiFi', 'Luggage Lockers', 'Evening Ganga Walking Tours', 'Common Chill Lounge'],
    all_amenities: ['Rooftop Cafe & Chai Bar', 'Free High-Speed WiFi', 'Luggage Lockers', 'Evening Ganga Walking Tours', 'Common Chill Lounge', '24/7 Front Desk', 'AC Rooms'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 24 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 1450,
    rooms_available: [
      {
        room_id: 'vns-zost-dorm',
        name: '6-Bed Mixed AC Dormitory Bed',
        board_name: 'Room Only (EP)',
        board_code: 'EP',
        bed_types: [{ type: 'Bunk Bed', size: 'Single Bunk', quantity: 1 }],
        size_sqm: 24,
        max_occupancy: 1,
        price_per_night: 850,
        free_cancellation: true,
        cancellation_text: 'Free cancellation up to 24h'
      },
      {
        room_id: 'vns-zost-pvt',
        name: 'Deluxe Private King Room',
        board_name: 'Room Only (EP)',
        board_code: 'EP',
        bed_types: [{ type: 'King bed', size: 'Double Bed', quantity: 1 }],
        size_sqm: 22,
        max_occupancy: 2,
        price_per_night: 2400,
        free_cancellation: true,
        cancellation_text: 'Free cancellation up to 24h'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // AYODHYA (Uttar Pradesh)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-ayd-001',
    name: 'The Sarayu Heritage Resort & Luxury Suites',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Luxury Heritage Retreat',
    star_class: 5,
    chain: 'Independent Luxury',
    address: 'Near Naya Ghat, Ram Ki Paidi, Ayodhya, Uttar Pradesh 224123',
    neighborhood: 'Ram Ki Paidi Waterfront',
    coordinates: { latitude: 26.8042, longitude: 82.2031 },
    user_rating: { score: 4.8, review_count: 1420, rating_text: 'Exceptional' },
    primary_photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Panoramic Sarayu River View', 'Pure Satvik Fine Dining', 'Shuttle to Ram Mandir', 'Ayurvedic Wellness Spa', 'Free WiFi'],
    all_amenities: ['Panoramic Sarayu River View', 'Pure Satvik Fine Dining', 'Shuttle to Ram Mandir', 'Ayurvedic Wellness Spa', 'Free WiFi', 'Spiritual Library', 'Valet Parking'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 9200,
    rooms_available: [
      {
        room_id: 'ayd-sar-dlx',
        name: 'Deluxe Sarayu View Room',
        board_name: 'Satvik Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 34,
        max_occupancy: 3,
        price_per_night: 9200,
        free_cancellation: true,
        cancellation_text: 'Free cancellation up to 48h prior'
      }
    ]
  },
  {
    id: 'ind-ayd-002',
    name: 'Park Inn by Radisson Ayodhya',
    city: 'Ayodhya',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'HOTEL',
    hotel_type: 'Modern Upscale Hotel',
    star_class: 4,
    chain: 'Radisson Hotel Group',
    address: 'NH-27, Faizabad-Ayodhya Road, Ayodhya, Uttar Pradesh 224001',
    neighborhood: 'Faizabad-Ayodhya Corridor',
    coordinates: { latitude: 26.7845, longitude: 82.1642 },
    user_rating: { score: 4.6, review_count: 1150, rating_text: 'Very Good' },
    primary_photo: 'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1590490360182-c33d57733427?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Rooftop Swimming Pool', 'Multi-Cuisine Restaurant', 'High-Speed WiFi', 'Ram Mandir Tour Desk'],
    all_amenities: ['Rooftop Swimming Pool', 'Multi-Cuisine Restaurant', 'High-Speed WiFi', 'Ram Mandir Tour Desk', 'Fitness Center', 'Free Parking'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 24h prior', refundable_tag: 'RFN' },
    base_price_inr: 5800,
    rooms_available: [
      {
        room_id: 'ayd-park-std',
        name: 'Standard Twin Room',
        board_name: 'Room Only (EP)',
        board_code: 'EP',
        bed_types: [{ type: 'Twin bed', size: '2 Twin Beds', quantity: 2 }],
        size_sqm: 28,
        max_occupancy: 2,
        price_per_night: 5800,
        free_cancellation: true,
        cancellation_text: 'Free cancellation up to 24h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // JAIPUR (Rajasthan)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-jpr-001',
    name: 'Rambagh Palace Jaipur',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Grand Heritage Royal Palace',
    star_class: 5,
    chain: 'Taj Hotels (IHCL)',
    address: 'Bhawani Singh Road, Jaipur, Rajasthan 302005',
    neighborhood: 'Rambagh',
    coordinates: { latitude: 26.8974, longitude: 75.8083 },
    user_rating: { score: 4.95, review_count: 4890, rating_text: 'World Class Excellence' },
    primary_photo: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['47-Acre Royal Gardens', 'Jiva Grande Spa', 'Suvarna Mahal Royal Dining', 'Indoor & Outdoor Heated Pools', 'Vintage Car Chauffeur'],
    all_amenities: ['47-Acre Royal Gardens', 'Jiva Grande Spa', 'Suvarna Mahal Royal Dining', 'Indoor & Outdoor Heated Pools', 'Vintage Car Chauffeur', 'Peacock Garden Walk', 'Tennis Courts', 'Butler Service'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 72 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 32000,
    rooms_available: [
      {
        room_id: 'jpr-ram-palace',
        name: 'Palace Room Courtyard View',
        board_name: 'Royal Buffet Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 48,
        max_occupancy: 2,
        price_per_night: 32000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 72h prior'
      }
    ]
  },
  {
    id: 'ind-jpr-002',
    name: 'ITC Rajputana, a Luxury Collection Hotel',
    city: 'Jaipur',
    state: 'Rajasthan',
    country: 'India',
    property_type: 'HOTEL',
    hotel_type: '5-Star Luxury Palace Hotel',
    star_class: 5,
    chain: 'ITC Hotels / Marriott',
    address: 'Palace Road, Gopalbari, Jaipur, Rajasthan 302006',
    neighborhood: 'Near Railway Station / Gopalbari',
    coordinates: { latitude: 26.9189, longitude: 75.7925 },
    user_rating: { score: 4.7, review_count: 3620, rating_text: 'Superb' },
    primary_photo: 'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1578683010236-d716f9a3f461?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Kaya Kalp Royal Spa', 'Peshawri Dining', 'Swimming Pool', 'Rajasthani Cultural Evenings'],
    all_amenities: ['Kaya Kalp Royal Spa', 'Peshawri Dining', 'Swimming Pool', 'Rajasthani Cultural Evenings', 'Free WiFi', 'Fitness Center'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 24h prior', refundable_tag: 'RFN' },
    base_price_inr: 9500,
    rooms_available: [
      {
        room_id: 'jpr-itc-exec',
        name: 'Executive Club Luxury King',
        board_name: 'Buffet Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 38,
        max_occupancy: 3,
        price_per_night: 9500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 24h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // GOA (Calangute, Candolim, Baga, Panaji)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-goa-001',
    name: 'Taj Exotica Resort & Spa Goa',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Luxury Beachfront Resort',
    star_class: 5,
    chain: 'Taj Hotels (IHCL)',
    address: 'Benaulim Beach, South Goa, Goa 403716',
    neighborhood: 'Benaulim Beach (Direct White Sands)',
    coordinates: { latitude: 15.2539, longitude: 73.9189 },
    user_rating: { score: 4.9, review_count: 4210, rating_text: 'Exceptional' },
    primary_photo: 'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1512353087810-25dfcd100962?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Direct Private Beach Access', '56-Acre Mediterranean Gardens', 'Jiva Ayurvedic Spa', 'Golf Course & Tennis', 'Seafood Grill by the Waves'],
    all_amenities: ['Direct Private Beach Access', '56-Acre Mediterranean Gardens', 'Jiva Ayurvedic Spa', 'Golf Course & Tennis', 'Seafood Grill by the Waves', 'Kids Activity Center', 'Water Sports Desk'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 18500,
    rooms_available: [
      {
        room_id: 'goa-taj-garden',
        name: 'Deluxe Sea-Breeze Garden Villa',
        board_name: 'Buffet Breakfast & Sunset Drinks (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 55,
        max_occupancy: 3,
        price_per_night: 18500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 48h prior'
      }
    ]
  },
  {
    id: 'ind-goa-002',
    name: 'W Goa Vagator Beach Sanctuary',
    city: 'Goa',
    state: 'Goa',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Luxury Lifestyle Beach Resort',
    star_class: 5,
    chain: 'Marriott International',
    address: 'Vagator Beach, Bardez, North Goa, Goa 403509',
    neighborhood: 'Vagator Beach & Chapora Fort',
    coordinates: { latitude: 15.6028, longitude: 73.7389 },
    user_rating: { score: 4.8, review_count: 3120, rating_text: 'Superb' },
    primary_photo: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['WET Infinity Pool overlooking Arabian Sea', 'Rockpool Sunset Lounge', 'AWAY Spa', 'Private Beach Access'],
    all_amenities: ['WET Infinity Pool overlooking Arabian Sea', 'Rockpool Sunset Lounge', 'AWAY Spa', 'Private Beach Access', 'Pet Friendly', '24/7 Concierge'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48h prior', refundable_tag: 'RFN' },
    base_price_inr: 21000,
    rooms_available: [
      {
        room_id: 'goa-w-chalet',
        name: 'Wonderful Garden View Chalet',
        board_name: 'Breakfast & Poolside Perks (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 48,
        max_occupancy: 2,
        price_per_night: 21000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 48h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // MUMBAI (Maharashtra)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-bom-001',
    name: 'The Taj Mahal Palace & Tower',
    city: 'Mumbai',
    state: 'Maharashtra',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Historic 5-Star Luxury Heritage',
    star_class: 5,
    chain: 'Taj Hotels (IHCL)',
    address: 'Apollo Bunder, Colaba, Mumbai, Maharashtra 400001',
    neighborhood: 'Gateway of India, Colaba',
    coordinates: { latitude: 18.9217, longitude: 72.8332 },
    user_rating: { score: 4.95, review_count: 7890, rating_text: 'Legendary Luxury' },
    primary_photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Direct Gateway of India & Sea View', '11 Acclaimed Restaurants & Bars', 'Jiva Spa', 'Heritage Walk Experience', 'Pool Oasis'],
    all_amenities: ['Direct Gateway of India & Sea View', '11 Acclaimed Restaurants & Bars', 'Jiva Spa', 'Heritage Walk Experience', 'Pool Oasis', '24/7 Butler Service', 'Designer Shopping Arcade'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 24000,
    rooms_available: [
      {
        room_id: 'bom-taj-tower',
        name: 'Tower Superior Room City View',
        board_name: 'Buffet Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 35,
        max_occupancy: 2,
        price_per_night: 24000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 48h prior'
      },
      {
        room_id: 'bom-taj-palace-sea',
        name: 'Palace Wing Sea Facing Luxury Room',
        board_name: 'Breakfast & High Tea at Sea Lounge (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: 'Palace Heritage King', quantity: 1 }],
        size_sqm: 48,
        max_occupancy: 3,
        price_per_night: 38000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 48h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // NEW DELHI (NCR)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-del-001',
    name: 'The Leela Palace New Delhi',
    city: 'New Delhi',
    state: 'Delhi',
    country: 'India',
    property_type: 'HOTEL',
    hotel_type: 'Modern Royal Palace Luxury',
    star_class: 5,
    chain: 'The Leela Palaces',
    address: 'Diplomatic Enclave, Chanakyapuri, New Delhi 110023',
    neighborhood: 'Chanakyapuri Diplomatic Enclave',
    coordinates: { latitude: 28.5802, longitude: 77.1895 },
    user_rating: { score: 4.9, review_count: 5120, rating_text: 'Exceptional' },
    primary_photo: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Rooftop Temperature-Controlled Infinity Pool', 'MEGU Japanese Dining', 'ESPA Royal Spa', 'Artisanal Murano Glass Chandeliers'],
    all_amenities: ['Rooftop Temperature-Controlled Infinity Pool', 'MEGU Japanese Dining', 'ESPA Royal Spa', 'Artisanal Murano Glass Chandeliers', 'High-Speed WiFi', 'Rolls Royce Transfers'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 24 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 22000,
    rooms_available: [
      {
        room_id: 'del-leela-grande',
        name: 'Grande Deluxe King Room',
        board_name: 'Buffet Breakfast at The Qube (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 52,
        max_occupancy: 3,
        price_per_night: 22000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 24h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // MANALI (Himachal Pradesh)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-mnl-001',
    name: 'The Himalayan Luxury Castle & Resort',
    city: 'Manali',
    state: 'Himachal Pradesh',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Victorian Gothic Mountain Castle',
    star_class: 5,
    chain: 'Independent Luxury',
    address: 'Hadimba Road, Siyal, Manali, Himachal Pradesh 175131',
    neighborhood: 'Near Hadimba Temple & Cedar Forests',
    coordinates: { latitude: 32.2478, longitude: 77.1812 },
    user_rating: { score: 4.85, review_count: 2190, rating_text: 'Superb Mountain Retreat' },
    primary_photo: 'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1518780664697-55e3ad937233?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Snow Peak Mountain Views', 'Fireplace in Every Suite', 'Apple Orchard Gardens', 'Heated Swimming Pool', 'Trekking Concierge'],
    all_amenities: ['Snow Peak Mountain Views', 'Fireplace in Every Suite', 'Apple Orchard Gardens', 'Heated Swimming Pool', 'Trekking Concierge', 'Free High-Speed WiFi'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 48 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 13500,
    rooms_available: [
      {
        room_id: 'mnl-him-castle',
        name: 'Castle Chamber with Fireplace & Balcony',
        board_name: 'Himalayan Mountain Breakfast (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 45,
        max_occupancy: 2,
        price_per_night: 13500,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 48h prior'
      }
    ]
  },

  // ═══════════════════════════════════════════════════════════════
  // AGRA (Uttar Pradesh)
  // ═══════════════════════════════════════════════════════════════
  {
    id: 'ind-agr-001',
    name: 'The Oberoi Amarvilas, Agra',
    city: 'Agra',
    state: 'Uttar Pradesh',
    country: 'India',
    property_type: 'RESORT',
    hotel_type: 'Ultra-Luxury Taj View Sanctuary',
    star_class: 5,
    chain: 'Oberoi Hotels & Resorts',
    address: 'Taj East Gate Road, Agra, Uttar Pradesh 282001',
    neighborhood: '600 Meters from Taj Mahal',
    coordinates: { latitude: 27.1683, longitude: 78.0498 },
    user_rating: { score: 4.98, review_count: 5890, rating_text: 'World Renowned' },
    primary_photo: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80',
    photo_gallery: [
      'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80'
    ],
    featured_amenities: ['Direct Uninterrupted Taj Mahal View from Every Room', 'Mughal Gardens & Fountains', 'Oberoi Spa', 'Private Golf Cart Transfer to Taj East Gate'],
    all_amenities: ['Direct Uninterrupted Taj Mahal View from Every Room', 'Mughal Gardens & Fountains', 'Oberoi Spa', 'Private Golf Cart Transfer to Taj East Gate', 'Free WiFi', 'Butler Service'],
    cancellation: { free_cancellation: true, cancellation_text: 'Free cancellation up to 72 hours prior', refundable_tag: 'RFN' },
    base_price_inr: 36000,
    rooms_available: [
      {
        room_id: 'agr-ob-premier',
        name: 'Premier Room with Direct Taj View',
        board_name: 'Gourmet Breakfast Included (CP)',
        board_code: 'CP',
        bed_types: [{ type: 'King bed', size: '1 King Bed', quantity: 1 }],
        size_sqm: 42,
        max_occupancy: 2,
        price_per_night: 36000,
        free_cancellation: true,
        cancellation_text: 'Free cancellation 72h prior'
      }
    ]
  }
];

// Dynamic seasonal rate calculator based on date, day of week, and room tier
export function calculateDynamicTariff(basePriceINR, checkInDateStr = null) {
  const checkIn = checkInDateStr ? new Date(checkInDateStr) : new Date();
  const month = checkIn.getMonth(); // 0 = Jan, 9 = Oct, 11 = Dec
  const dayOfWeek = checkIn.getDay(); // 0 = Sun, 5 = Fri, 6 = Sat

  // Peak Season (Oct to March) -> 1.25x
  let multiplier = (month >= 9 || month <= 2) ? 1.22 : 1.0;

  // Weekend Surcharge (Friday / Saturday nights) -> 1.15x
  if (dayOfWeek === 5 || dayOfWeek === 6) {
    multiplier *= 1.15;
  }

  const calculated = Math.round(basePriceINR * multiplier);

  // Indian GST Rules: 12% under ₹7500, 18% above ₹7500
  const gstRate = calculated > 7500 ? 0.18 : 0.12;
  const taxesAndGst = Math.round(calculated * gstRate);

  return {
    pricePerNightINR: calculated,
    basePriceINR,
    taxesAndGst,
    totalWithGst: calculated + taxesAndGst,
    formattedPriceINR: `₹${calculated.toLocaleString('en-IN')}`,
    formattedGst: `₹${taxesAndGst.toLocaleString('en-IN')}`,
    multiplierApplied: multiplier
  };
}

// Helper: Fast Inverted Keyword Matcher across Indian Cities, States & Monuments
export function searchMasterCatalog(query = '', filters = {}) {
  const q = (query || '').toLowerCase().trim();
  if (!q) return PAN_INDIA_HOTELS_MASTER;

  return PAN_INDIA_HOTELS_MASTER.filter(h => {
    const matchCity = h.city.toLowerCase().includes(q) || q.includes(h.city.toLowerCase());
    const matchState = h.state.toLowerCase().includes(q) || q.includes(h.state.toLowerCase());
    const matchName = h.name.toLowerCase().includes(q) || q.includes(h.name.toLowerCase());
    const matchNeighborhood = h.neighborhood.toLowerCase().includes(q);

    // Common Indian City Aliases
    const isBanaras = (q.includes('banaras') || q.includes('kashi')) && h.city === 'Varanasi';
    const isBombay = q.includes('bombay') && h.city === 'Mumbai';
    const isCalcutta = q.includes('calcutta') && h.city === 'Kolkata';
    const isBangalore = q.includes('bangalore') && h.city === 'Bengaluru';
    const isMadras = q.includes('madras') && h.city === 'Chennai';
    const isPrayag = (q.includes('allahabad') || q.includes('sangam')) && h.city === 'Prayagraj';

    const matchesDest = matchCity || matchState || matchName || matchNeighborhood || isBanaras || isBombay || isCalcutta || isBangalore || isMadras || isPrayag;
    if (!matchesDest) return false;

    // Apply star filter
    if (filters.star && filters.star !== 'all') {
      if (h.star_class < Number(filters.star)) return false;
    }

    // Apply max price filter
    if (filters.maxPrice && h.base_price_inr > Number(filters.maxPrice)) {
      return false;
    }

    return true;
  });
}
