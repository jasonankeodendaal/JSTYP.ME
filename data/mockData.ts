import type { Brand, Product, Catalogue, Pamphlet, Settings, ScreensaverAd, AdminUser, TvContent, Category, FontStyleSettings, ThemeColors, Client, Quote, ViewCounts, ActivityLog } from '../types';

export const adminUsers: AdminUser[] = [
  {
    id: "au_1723",
    firstName: "Main",
    lastName: "Admin",
    tel: "000 000 0000",
    pin: "1723",
    isMainAdmin: true,
    permissions: {
      canManageBrandsAndProducts: true,
      canManageCatalogues: true,
      canManagePamphlets: true,
      canManageScreensaver: true,
      canManageSettings: true,
      canManageSystem: true,
      canManageTvContent: true,
      canViewAnalytics: true,
      canManageQuotesAndClients: true,
    },
    imageUrl: ""
  },
  {
    id: "au_1234",
    firstName: "Jane",
    lastName: "Doe",
    tel: "082 123 4567",
    pin: "1234",
    isMainAdmin: false,
    permissions: {
      canManageBrandsAndProducts: true,
      canManageCatalogues: true,
      canManagePamphlets: false,
      canManageScreensaver: false,
      canManageSettings: false,
      canManageSystem: false,
      canManageTvContent: false,
      canViewAnalytics: false,
      canManageQuotesAndClients: false,
    },
    imageUrl: ""
  }
];

export const brands: Brand[] = [
    // Existing Brands
    { "id": "b-quantum", "name": "Quantum Audio", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23111827'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Orbitron, sans-serif' font-size='26' font-weight='700' fill='%2393c5fd'%3eQUANTUM%3c/text%3e%3c/svg%3e", isTvBrand: true },
    { "id": "b-zenith", "name": "Zenith Appliances", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23f0f9ff'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Poppins, sans-serif' font-size='28' font-weight='600' fill='%230c4a6e'%3eZENITH%3c/text%3e%3c/svg%3e" },
    { "id": "b-evergreen", "name": "Evergreen Outdoor", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23f0fdf4'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Merriweather, serif' font-size='22' font-weight='900' fill='%23166534'%3eEvergreen Outdoor%3c/text%3e%3c/svg%3e" },
    { "id": "b-stellar-tv", "name": "Stellar TV", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23f5f3ff'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Cinzel, serif' font-size='32' font-weight='700' fill='%235b21b6'%3eSTELLAR%3c/text%3e%3c/svg%3e", isTvBrand: true },
    { "id": "b-visionix-tv", "name": "Visionix Displays", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23eef2ff'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%233730a3'%3eVISIONIX%3c/text%3e%3c/svg%3e", isTvBrand: true },
    
    // New Brands
    { "id": "b-aura", "name": "Aura Living", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23fafaf9'/%3e%3cg transform='translate(150, 75)'%3e%3cpath d='M-40 -20 L-20 0 L-40 20' stroke='%2378716c' stroke-width='8' fill='none'/%3e%3cpath d='M-10 25 C 20 25, 30 -25, 0 -25 C -30 -25, -20 25, -10 25 Z' fill='%23a8a29e'/%3e%3c/g%3e%3ctext x='150' y='120' text-anchor='middle' font-family='Garamond, serif' font-size='20' fill='%2344403c'%3eAURA LIVING%3c/text%3e%3c/svg%3e" },
    { "id": "b-kinetic", "name": "Kinetic", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%230a0a0a'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Saira, sans-serif' font-size='48' font-weight='800' fill='%23fafafa' letter-spacing='-2px'%3eKINETIC%3c/text%3e%3c/svg%3e" },
    { "id": "b-nexus", "name": "Nexus", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23f9fafb'/%3e%3cg transform='translate(150, 75)'%3e%3cpath d='M-50 -30 L0 0 L-50 30 M50 -30 L0 0 L50 30' stroke='%236366f1' stroke-width='12' fill='none'/%3e%3ccircle cx='0' cy='0' r='8' fill='%236366f1'/%3e%3c/g%3e%3c/svg%3e" },
    { "id": "b-apex-gaming", "name": "Apex Gaming", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23171717'/%3e%3cpolygon points='100,100 150,50 200,100' stroke='%23be123c' stroke-width='5' fill='none'/%3e%3ctext x='50%25' y='60%25' dominant-baseline='middle' text-anchor='middle' font-family='Aldrich, sans-serif' font-size='36' font-weight='bold' fill='%23fca5a5'%3eAPEX%3c/text%3e%3c/svg%3e", isTvBrand: true },
    { "id": "b-generic", "name": "Generic Brand", "logoUrl": "data:image/svg+xml,%3csvg width='300' height='150' viewBox='0 0 300 150' xmlns='http://www.w3.org/2000/svg'%3e%3crect width='300' height='150' fill='%23e2e8f0'/%3e%3ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='Montserrat, sans-serif' font-size='24' font-weight='800' fill='%23475569'%3eGENERIC BRAND%3c/text%3e%3c/svg%3e" }
];

export const categories: Category[] = [
    // Existing Categories
    { id: "cat-quantum-1", name: "Soundbars", brandId: "b-quantum" },
    { id: "cat-quantum-2", name: "Headphones", brandId: "b-quantum" },
    { id: "cat-zenith-1", name: "Refrigeration", brandId: "b-zenith" },
    { id: "cat-zenith-2", name: "Cooking", brandId: "b-zenith" },
    { id: "cat-evergreen-1", name: "Tents & Shelters", brandId: "b-evergreen" },
    { id: "cat-evergreen-2", name: "Camping Gear", brandId: "b-evergreen" },
    { id: "cat-generic-1", name: "Miscellaneous", brandId: "b-generic" },

    // New Categories
    { id: "cat-aura-1", name: "Home Fragrance", brandId: "b-aura" },
    { id: "cat-aura-2", name: "Furniture", brandId: "b-aura" },
    { id: "cat-kinetic-1", name: "Performance Apparel", brandId: "b-kinetic" },
    { id: "cat-kinetic-2", name: "Footwear", brandId: "b-kinetic" },
    { id: "cat-nexus-1", name: "Tablets & Mobile", brandId: "b-nexus" },
    { id: "cat-nexus-2", name: "Audio Devices", brandId: "b-nexus" },
    { id: "cat-apex-1", name: "Gaming Monitors", brandId: "b-apex-gaming" }
];

export const products: Product[] = [
    // Existing Products
    {
        "id": "p-zenith-fridge", "name": "Zenith FrostFree 450L", "sku": "ZEN-FF-450", "brandId": "b-zenith", "categoryId": "cat-zenith-1",
        "description": "Experience the pinnacle of freshness with the Zenith FrostFree 450L refrigerator. Its advanced multi-flow air system ensures even cooling, while the spacious interior and smart storage solutions make organization a breeze. Finished in sleek stainless steel, it's the perfect centerpiece for any modern kitchen.",
        "images": ["https://images.unsplash.com/photo-1616474328229-cad57a2cf1a0?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1571175443880-49e1d25b2b55?q=80&w=800&auto=format&fit=crop"],
        "video": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        "specifications": [{"id":"s7","key":"Capacity","value":"450 Litres"},{"id":"s8","key":"Energy Rating","value":"A++"},{"id":"s9","key":"Finish","value":"Brushed Stainless Steel"}], "whatsInTheBox": ["Refrigerator Unit", "Ice Tray", "Egg Holder", "User Manual"]
    },
    {
        "id": "p-zenith-oven", "name": "Zenith Convection Oven", "sku": "ZEN-CO-90", "brandId": "b-zenith", "categoryId": "cat-zenith-2",
        "description": "Unleash your culinary potential with the Zenith 90cm Convection Oven. Featuring 12 versatile cooking functions and a precision temperature probe, it delivers perfect results every time. The stylish black glass finish and intuitive touch controls add a touch of elegance to your kitchen.",
        "images": ["https://images.unsplash.com/photo-1588695273392-62b11d889981?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s10","key":"Functions","value":"12 (including Steam & AirFry)"},{"id":"s11","key":"Capacity","value":"90 Litres"},{"id":"s12","key":"Control","value":"Touch TFT Display"}], "whatsInTheBox": ["Oven Unit", "Baking Tray", "Grill Rack", "Temperature Probe"]
    },
    {
        "id": "p-quantum-soundbar", "name": "Quantum Wave Soundbar", "sku": "QTM-WAVE-512", "brandId": "b-quantum", "categoryId": "cat-quantum-1",
        "description": "Immerse yourself in cinematic audio with the Quantum Wave 5.1.2 soundbar. With Dolby Atmos support and dedicated upward-firing speakers, it creates a true 3D soundscape that brings movies and music to life. Wireless subwoofer included for deep, impactful bass.",
        "images": ["https://images.unsplash.com/photo-1593452424683-9b04f67c0350?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1618384281358-d84122d2169a?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s13","key":"Channels","value":"5.1.2"},{"id":"s14","key":"Connectivity","value":"HDMI eARC, Bluetooth 5.2, Optical"},{"id":"s15","key":"Special","value":"Dolby Atmos, DTS:X"}], "whatsInTheBox": ["Soundbar", "Wireless Subwoofer", "Remote Control", "HDMI Cable"]
    },
    {
        "id": "p-quantum-headphones", "name": "Quantum Aura ANC", "sku": "QTM-AURA-ANC", "brandId": "b-quantum", "categoryId": "cat-quantum-2",
        "description": "Escape the noise and enter your world of sound with Quantum Aura ANC headphones. Featuring hybrid active noise cancellation and plush memory foam earcups, they provide exceptional comfort and immersion. Enjoy up to 40 hours of playtime on a single charge.",
        "images": ["https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1618335829737-2228915674e0?q=80&w=800&auto=format&fit=crop"],
        "video": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        "specifications": [{"id":"s16","key":"Playtime","value":"40 hours (ANC on)"},{"id":"s17","key":"Noise Cancellation","value":"Hybrid Active"},{"id":"s18","key":"Weight","value":"250g"}], "whatsInTheBox": ["Headphones", "Carrying Case", "USB-C Cable", "3.5mm Audio Cable"]
    },
    {
        "id": "p-evergreen-tent", "name": "Evergreen Vista 4P Tent", "sku": "EVG-VISTA-4", "brandId": "b-evergreen", "categoryId": "cat-evergreen-1",
        "description": "The perfect home away from home for your family adventures. The Evergreen Vista 4-person tent features a simple setup design, a spacious interior, and a full-coverage rainfly to keep you dry in any weather. Large mesh windows provide excellent ventilation and stargazing opportunities.",
        "images": ["https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1598131238426-17b5f25a9144?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s19","key":"Capacity","value":"4 Person"},{"id":"s20","key":"Weight","value":"5.5 kg"},{"id":"s21","key":"Waterproofing","value":"3000mm PU Coating"}], "whatsInTheBox": ["Tent Body", "Rainfly", "Poles", "Stakes", "Carry Bag"]
    },
     {
        "id": "p-evergreen-chair", "name": "Evergreen Trail Chair", "sku": "EVG-TRAIL-CHR", "brandId": "b-evergreen", "categoryId": "cat-evergreen-2",
        "description": "Relax in comfort wherever you are with the ultralight Evergreen Trail Chair. Packing down smaller than a water bottle, this chair is a must-have for backpacking, festivals, or just relaxing in the backyard. The durable aluminum frame supports up to 120kg.",
        "images": ["https://images.unsplash.com/photo-1563298723-dcfebaa392e3?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s22","key":"Weight","value":"980g"},{"id":"s23","key":"Capacity","value":"120 kg"},{"id":"s24","key":"Packed Size","value":"35cm x 10cm"}], "whatsInTheBox": ["Chair Fabric", "Pole Set", "Carry Bag"]
    },
    // New Products
    {
        "id": "p-aura-diffuser", "name": "Serenity Stone Diffuser", "sku": "AURA-DIFF-01", "brandId": "b-aura", "categoryId": "cat-aura-1",
        "description": "Transform your space into a tranquil oasis with the Serenity Stone Diffuser. Crafted from handcrafted porcelain, this ultrasonic diffuser gently disperses your favorite essential oils, filling the air with a calming, fragrant mist. Its minimalist design complements any decor.",
        "images": ["https://images.unsplash.com/photo-1627993092285-b072c44243b7?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s25","key":"Material","value":"Handcrafted Porcelain"},{"id":"s26","key":"Capacity","value":"100ml"},{"id":"s27","key":"Run Time","value":"Up to 8 hours"}], "whatsInTheBox": ["Diffuser", "Power Adapter", "User Guide"]
    },
    {
        "id": "p-kinetic-shorts", "name": "Velocity Running Shorts", "sku": "KIN-SHORT-M-01", "brandId": "b-kinetic", "categoryId": "cat-kinetic-1",
        "description": "Engineered for speed and comfort, the Velocity Running Shorts feature a lightweight, sweat-wicking fabric and a built-in liner for support. A secure zip pocket holds your essentials, letting you focus on your run.",
        "images": ["https://images.unsplash.com/photo-1591195853828-11db59a44f6b?q=80&w=800&auto=format&fit=crop"],
        "specifications": [{"id":"s28","key":"Fabric","value":"Kine-Dry™ Polyester/Spandex Blend"},{"id":"s29","key":"Inseam","value":"5 inches"},{"id":"s30","key":"Features","value":"Reflective details, zip pocket"}], "whatsInTheBox": ["Running Shorts"]
    },
    {
        "id": "p-nexus-tablet", "name": "NexusTab Pro 11", "sku": "NEX-TAB-P11", "brandId": "b-nexus", "categoryId": "cat-nexus-1",
        "description": "Unleash your productivity and creativity with the NexusTab Pro 11. Featuring a stunning 120Hz Liquid-Edge display, the powerful Nexus N1 chip, and all-day battery life. Perfect for work, play, and everything in between.",
        "images": ["https://images.unsplash.com/photo-1561152019-411a5a0138ce?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1544228865-7d73678da864?q=80&w=800&auto=format&fit=crop"],
        "video": "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        "specifications": [{"id":"s31","key":"Display","value":"11-inch 120Hz Liquid-Edge"},{"id":"s32","key":"Processor","value":"Nexus N1 Chip"},{"id":"s33","key":"Storage","value":"128GB / 256GB / 512GB"}], "whatsInTheBox": ["NexusTab Pro 11", "USB-C Charging Cable", "20W Power Adapter"]
    },
    {
        "id": "p-generic-item", "name": "Sample Product", "sku": "SKU-001", "brandId": "b-generic", "categoryId": "cat-generic-1",
        "description": "This is a sample product description. You can edit this or add new products in the admin panel. Use the bulk import feature to add multiple products at once from a CSV or ZIP file.",
        "images": [ "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=800&auto=format&fit=crop", "https://images.unsplash.com/photo-1572635196237-14b3f281503f?q=80&w=800&auto=format&fit=crop" ],
        "specifications": [ { "id": "s1", "key": "Feature A", "value": "Value A" }, { "id": "s2", "key": "Feature B", "value": "Value B" } ], "documents": [], "whatsInTheBox": ["Sample Item", "User Manual"], "termsAndConditions": "This is a sample terms and conditions section."
    }
];

export const clients: Client[] = [
    {
        id: "client-1",
        companyName: "The Corner Cafe",
        contactPerson: "Alice Johnson",
        contactEmail: "alice@cornercafe.com",
        contactTel: "111-222-3333"
    },
    {
        id: "client-2",
        companyName: "Gourmet Solutions Ltd.",
        contactPerson: "Robert Chen",
        contactEmail: "rob@gourmet.co",
        contactTel: "444-555-6666"
    }
];

export const quotes: Quote[] = [];

export const catalogues: Catalogue[] = [
    // Existing Catalogues
    {
        "id": "cat-zenith-2024",
        "title": "Zenith 2024 Collection",
        "thumbnailUrl": "https://images.unsplash.com/photo-1579725842526-a931057d3637?q=80&w=800&auto=format&fit=crop",
        "brandId": "b-zenith",
        "year": 2024,
        "type": "image",
        "imageUrls": [
            "https://images.unsplash.com/photo-1579725842526-a931057d3637?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1604405282933-281893451a66?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1574758394412-243d1a355ed5?q=80&w=1200&auto=format&fit=crop"
        ]
    },
    {
        "id": "cat-evergreen-2024",
        "title": "Evergreen Adventure Guide",
        "thumbnailUrl": "https://images.unsplash.com/photo-1525171254930-643c656b23a9?q=80&w=800&auto=format&fit=crop",
        "brandId": "b-evergreen",
        "year": 2024,
        "type": "image",
        "imageUrls": [
            "https://images.unsplash.com/photo-1525171254930-643c656b23a9?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1534991959881-3f124e6a8836?q=80&w=1200&auto=format&fit=crop"
        ]
    },
    // New Catalogues
    {
        "id": "cat-aura-2024",
        "title": "Aura Winter Collection",
        "thumbnailUrl": "https://images.unsplash.com/photo-1531991113949-a1e27a40954b?q=80&w=800&auto=format&fit=crop",
        "brandId": "b-aura",
        "year": 2024,
        "type": "image",
        "imageUrls": [
            "https://images.unsplash.com/photo-1531991113949-a1e27a40954b?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1554995207-c18c203602cb?q=80&w=1200&auto=format&fit=crop"
        ]
    }
];

export const pamphlets: Pamphlet[] = [
    {
        "id": "pam-quantum-launch",
        "title": "Quantum Audio Launch Sale",
        "imageUrl": "https://images.unsplash.com/photo-1511370235399-1802ca523234?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-07-01",
        "endDate": "2024-08-31",
        "type": "image",
        "imageUrls": [
            "https://images.unsplash.com/photo-1511370235399-1802ca523234?q=80&w=1200&auto=format&fit=crop",
            "https://images.unsplash.com/photo-1612333798487-37a544604533?q=80&w=1200&auto=format&fit=crop"
        ]
    },
    {
        "id": "pam-zenith-summer",
        "title": "Zenith Summer Savings",
        "imageUrl": "https://images.unsplash.com/photo-1607992922514-adc54c9256db?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-06-15",
        "endDate": "2024-09-15",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1607992922514-adc54c9256db?q=80&w=1200&auto=format&fit=crop" ]
    },
    {
        "id": "pam-kinetic-spring",
        "title": "Kinetic Spring Sale",
        "imageUrl": "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-08-15",
        "endDate": "2024-09-30",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop" ]
    },
    {
        "id": "pam-evergreen-clearance",
        "title": "Evergreen Season Clearance",
        "imageUrl": "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-08-01",
        "endDate": "2024-09-15",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1517824806704-9040b037703b?q=80&w=1200&auto=format&fit=crop" ]
    },
    {
        "id": "pam-aura-cozy",
        "title": "Aura Cozy Home Event",
        "imageUrl": "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-09-01",
        "endDate": "2024-10-31",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1615873968403-89e068629265?q=80&w=800&auto=format&fit=crop" ]
    },
    {
        "id": "pam-nexus-backtoschool",
        "title": "Nexus Back to School Deals",
        "imageUrl": "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-07-15",
        "endDate": "2024-08-31",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1526738549149-8e07eca6c147?q=80&w=1200&auto=format&fit=crop" ]
    },
    {
        "id": "pam-apex-levelup",
        "title": "Level Up Your Setup Sale",
        "imageUrl": "https://images.unsplash.com/photo-1598550476439-6847785f5607?q=80&w=800&auto=format&fit=crop",
        "startDate": "2024-08-01",
        "endDate": "2024-08-31",
        "type": "image",
        "imageUrls": [ "https://images.unsplash.com/photo-1598550476439-6847785f5607?q=80&w=1200&auto=format&fit=crop" ]
    }
];

export const screensaverAds: ScreensaverAd[] = [
    { "id": "ad-3", "title": "Feel the Bass. Hear the Future.", "media": [{ "id": "media-ad3-1", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "type": "video" }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "product", "id": "p-quantum-soundbar" } },
    { "id": "ad-4", "title": "Your Adventure Awaits", "media": [{ "id": "media-ad4-1", "url": "https://images.unsplash.com/photo-1470246973918-29a93221c455?q=80&w=1920&auto=format&fit=crop", "type": "image", "duration": 10, "overlay": { "headline": "Your Adventure Awaits", "subheadline": "Explore the Evergreen Outdoor Collection", "textColor": "#FFFFFF", "backgroundColor": "rgba(0, 0, 0, 0.4)" } }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "brand", "id": "b-evergreen" } },
    { "id": "ad-5", "title": "The Art of Cool", "media": [{ "id": "media-ad5-1", "url": "https://images.unsplash.com/photo-1588691523445-3942a3a5c215?q=80&w=1920&auto=format&fit=crop", "type": "image" }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "product", "id": "p-zenith-fridge" } },
    { "id": "ad-6", "title": "Unleash Your Potential", "media": [{ "id": "media-ad6-1", "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/WeAreGoingOnBullrun.mp4", "type": "video" }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "brand", "id": "b-kinetic" } },
    { "id": "ad-7", "title": "The Future is Now. The Future is Nexus.", "media": [{ "id": "media-ad7-1", "url": "https://images.unsplash.com/photo-1535378620166-273708d44e4c?q=80&w=1920&auto=format&fit=crop", "type": "image", "overlay": { "headline": "NexusTab Pro 11", "textColor": "#FFFFFF", "backgroundColor": "rgba(0, 0, 0, 0.5)" } }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "product", "id": "p-nexus-tablet" } },
    { "id": "ad-8", "title": "Create Your Sanctuary", "media": [{ "id": "media-ad8-1", "url": "https://images.unsplash.com/photo-1618220179428-22790b461013?q=80&w=1920&auto=format&fit=crop", "type": "image" }], "startDate": "2024-01-01", "endDate": "2025-12-31", "link": { "type": "brand", "id": "b-aura" } }
];

export const tvContent: TvContent[] = [
    // Existing Content
    { "id": "tv-stellar-1", "brandId": "b-stellar-tv", "modelName": "Nebula Series 65\"", "media": [{ "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4", "type": "video" }] },
    { "id": "tv-visionix-1", "brandId": "b-visionix-tv", "modelName": "ProArt Monitor 32\"", "media": [{ "url": "https://images.unsplash.com/photo-1551645120-d70b9685a3a2?q=80&w=1920&auto=format&fit=crop", "type": "image" }, { "url": "https://images.unsplash.com/photo-1616588589676-62b3bd4d2b96?q=80&w=1920&auto=format&fit=crop", "type": "image" }] },
    { "id": "tv-quantum-sb", "brandId": "b-quantum", "modelName": "Quantum Wave Demo", "media": [{ "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "type": "video" }] },
    // New Content
    { "id": "tv-apex-1", "brandId": "b-apex-gaming", "modelName": "Predator 32\" Curved", "media": [{ "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4", "type": "video" }] }
];

const defaultLight: ThemeColors = {
  appBg: "#f3f4f6",
  appBgImage: "",
  mainBg: "#ffffff",
  mainText: "#1f2937",
  mainShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
  mainBorder: "1px solid #e5e7eb",
  primary: "#4f46e5",
  primaryButton: {
    background: "#4f46e5",
    text: "#ffffff",
    hoverBackground: "#4338ca",
  },
  destructiveButton: {
    background: "#dc2626",
    text: "#ffffff",
    hoverBackground: "#b91c1c"
  }
};

const defaultDark: ThemeColors = {
  appBg: "#111827",
  appBgImage: "radial-gradient(at 15% 20%, hsla(220, 80%, 30%, 0.25) 0px, transparent 50%), radial-gradient(at 85% 80%, hsla(280, 70%, 45%, 0.2) 0px, transparent 50%)",
  mainBg: "#1f2937",
  mainText: "#e5e7eb",
  mainShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.03)",
  mainBorder: "1px solid rgba(255, 255, 255, 0.08)",
  primary: "#818cf8",
  primaryButton: {
    background: "#4f46e5",
    text: "#ffffff",
    hoverBackground: "#6366f1",
  },
  destructiveButton: {
    background: "#be123c",
    text: "#ffffff",
    hoverBackground: "#9f1239"
  }
};

const defaultBodyFont: FontStyleSettings = { fontFamily: "Inter", fontWeight: "400", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };
const defaultHeadingsFont: FontStyleSettings = { fontFamily: "Montserrat", fontWeight: "800", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };
const defaultItemTitlesFont: FontStyleSettings = { fontFamily: "Poppins", fontWeight: "600", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };

export const settings: Settings = {
    appName: "Product Catalogue",
    appDescription: "An interactive digital catalogue for any brand, allowing users to browse products, view details, and explore collections.",
    logoUrl: "https://iili.io/KAn4ekl.png",
    pwaIconUrl: "https://iili.io/KAn4ekl.png",
    sharedUrl: "",
    customApiUrl: "",
    customApiKey: "",
    lightTheme: defaultLight,
    darkTheme: defaultDark,
    screensaverDelay: 15,
    videoVolume: 0.75,
    backgroundMusicUrl: "",
    backgroundMusicVolume: 0.5,
    touchSoundUrl: "",
    screensaverImageDuration: 8,
    screensaverTransitionEffect: 'gentle-drift',
    screensaverTouchPromptText: "Touch to Explore",
    screensaverContentSource: 'products_and_ads',
    screensaverItemsPerPrompt: 3,
    screensaverShowClock: true,
    screensaverShowProductInfo: true,
    screensaverProductInfoStyle: 'overlay',
    typography: {
        googleFontUrl: "",
        body: defaultBodyFont,
        headings: defaultHeadingsFont,
        itemTitles: defaultItemTitlesFont
    },
    header: {
        backgroundColor: "transparent",
        textColor: "#e5e7eb",
        backgroundImageUrl: "",
        backgroundImageOpacity: 0.5,
        effect: "glassmorphism",
    },
    footer: {
        backgroundColor: "transparent",
        textColor: "#e5e7eb",
        backgroundImageUrl: "",
        backgroundImageOpacity: 0.5,
        effect: "glassmorphism",
    },
    pamphletPlaceholder: {
        text: "No Active Promotions",
        font: { fontFamily: 'Playfair Display', fontWeight: '900', fontStyle: 'italic', textDecoration: 'none', letterSpacing: 'normal', textTransform: 'none' },
        color1: "#a78bfa",
        color2: "#f472b6"
    },
    cardStyle: {
        cornerRadius: 'rounded-2xl',
        shadow: 'shadow-xl'
    },
    layout: {
        width: 'standard'
    },
    pageTransitions: {
        effect: 'fade'
    },
    kiosk: {
        idleRedirectTimeout: 90,
        profiles: [],
        disableContextMenu: false,
        pinProtectScreensaver: false,
    },
    navigation: {
        links: [
            { id: 'nav-home', label: 'Home', path: '/', enabled: true },
            { id: 'nav-tvs', label: 'TVs', path: '/tvs', enabled: true },
            { id: 'nav-catalogues', label: 'Catalogues', path: '/catalogues', enabled: true },
        ]
    },
    sync: {
        autoSyncEnabled: true,
    },
    loginScreen: {
      backgroundImageUrl: "",
      backgroundColor: "#111827",
      boxBackgroundColor: "linear-gradient(to bottom right, #4f46e5, #7c3aed)",
      textColor: "#ffffff"
    },
    creatorProfile: {
      enabled: true,
      name: "JSTYP.me",
      title: "Jason's Solution To Your Problems... yes me!",
      imageUrl: "https://iili.io/FGWJCtj.jpg",
      logoUrlLight: "https://iili.io/KxPZTT7.png",
      logoUrlDark: "https://iili.io/KxPZTT7.png",
      phone: "+27695989427",
      email: "odendaaljason454@gmail.com",
      website: "https://jstyp.me",
      websiteText: "JSTYP.me - Your Solution to Digital Problems",
      whatsapp: "https://wa.link/5ajnc6"
    }
};

export const viewCounts: ViewCounts = {};

export const activityLogs: ActivityLog[] = [];