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
    { id: "b-defy", name: "DEFY", logoUrl: "https://iili.io/KATH3Eg.png" },
    { id: "b-edblo", name: "Edblo", logoUrl: "https://iili.io/KATHF4a.png" },
    { id: "b-hisense", name: "Hisense", logoUrl: "https://iili.io/KATHJQ1.png", isTvBrand: true },
    { id: "b-bosch", name: "Bosch", logoUrl: "https://iili.io/KATHHhP.png" },
    { id: "b-whirlpool", name: "Whirlpool", logoUrl: "https://iili.io/KATHqYv.png" },
];

export const categories: Category[] = [
    { id: "cat-defy-fridge", name: "Refrigeration", brandId: "b-defy" },
    { id: "cat-defy-cook", name: "Cooking", brandId: "b-defy" },
    { id: "cat-defy-laundry", name: "Laundry", brandId: "b-defy" },
    { id: "cat-edblo-comfort", name: "Home Comfort", brandId: "b-edblo" },
    { id: "cat-hisense-tv", name: "TV & AV", brandId: "b-hisense" },
    { id: "cat-hisense-fridge", name: "Refrigeration", brandId: "b-hisense" },
    { id: "cat-bosch-laundry", name: "Laundry", brandId: "b-bosch" },
    { id: "cat-bosch-dish", name: "Dishwashers", brandId: "b-bosch" },
    { id: "cat-bosch-cook", name: "Cooking", brandId: "b-bosch" },
    { id: "cat-whirlpool-laundry", name: "Laundry", brandId: "b-whirlpool" },
    { id: "cat-whirlpool-fridge", name: "Refrigeration", brandId: "b-whirlpool" },
    { id: "cat-whirlpool-cook", name: "Cooking", brandId: "b-whirlpool" },
];

export const products: Product[] = [
    // DEFY (6)
    { id: "p-defy-fridge-1", name: "DEFY 228L Bottom Freezer Fridge", sku: "DAC447", brandId: "b-defy", categoryId: "cat-defy-fridge",
        description: "A reliable and energy-efficient bottom freezer fridge with an A+ energy rating, featuring adjustable shelving and a large crisper drawer to keep your produce fresh.",
        images: ["https://images.unsplash.com/photo-1616474328229-cad57a2cf1a0?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s1", key:"Total Capacity", value:"228 Litres"}, {id:"s2", key:"Energy Rating", value:"A+"}, {id:"s3", key:"Finish", value:"Metallic"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4",
        documents: [
            { id: "doc-defy-fridge-1", title: "Energy Label", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"},
            { id: "doc-defy-fridge-2", title: "Installation Guide", type: "image", imageUrls: ["https://images.unsplash.com/photo-1633511479833-22879685a782?q=80&w=800", "https://images.unsplash.com/photo-1588594924333-afc45b36b53b?q=80&w=800"] }
        ],
        whatsInTheBox: ["Refrigerator Unit", "Ice Tray", "User Manual"]
    },
    { id: "p-defy-fridge-2", name: "DEFY 555L Side-by-Side Fridge", sku: "DSBS555", brandId: "b-defy", categoryId: "cat-defy-fridge",
        description: "Experience superior space and convenience with this No Frost side-by-side refrigerator. It includes a water and ice dispenser for ultimate modern luxury.",
        images: ["https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s4", key:"Total Capacity", value:"555 Litres"}, {id:"s5", key:"Technology", value:"No Frost"}, {id:"s6", key:"Features", value:"Water & Ice Dispenser"} ],
        whatsInTheBox: ["Refrigerator Unit", "Water filter", "User Manual"]
    },
    { id: "p-defy-oven-1", name: "DEFY Slimline Eye-Level Oven", sku: "DCB838", brandId: "b-defy", categoryId: "cat-defy-cook",
        description: "A sleek, multifunction eye-level oven with an A energy rating. Its Thermofan+ technology ensures even cooking results every time, perfect for passionate bakers.",
        images: ["https://images.unsplash.com/photo-1604867992523-a1b7a2769827?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s7", key:"Type", value:"Built-in Eye-Level"}, {id:"s8", key:"Function", value:"Multifunction Thermofan+"}, {id:"s9", key:"Energy Rating", value:"A"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
        documents: [{ id: "doc-defy-oven-1", title: "User Manual", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}],
        whatsInTheBox: ["Oven Unit", "Baking Tray", "Wire Rack", "User Manual"]
    },
    { id: "p-defy-hob-1", name: "DEFY Touch Control Vitroceramic Hob", sku: "DHD406", brandId: "b-defy", categoryId: "cat-defy-cook",
        description: "Modernize your kitchen with this 60cm touch control vitroceramic hob. It offers precise temperature control and a residual heat indicator for safety.",
        images: ["https://images.unsplash.com/photo-1614707997439-74a48680514a?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s10", key:"Size", value:"60cm"}, {id:"s11", key:"Control Type", value:"Touch Control"}, {id:"s12", key:"Surface", value:"Vitroceramic Glass"} ],
        whatsInTheBox: ["Hob Unit", "Mounting brackets", "User Manual"]
    },
    { id: "p-defy-washer-1", name: "DEFY 8kg Front Loader Washing Machine", sku: "DAW386", brandId: "b-defy", categoryId: "cat-defy-laundry",
        description: "This 8kg front loader features Aquafusion Technology for energy savings and a SteamCure function to reduce wrinkles and allergens. A+++ energy efficiency.",
        images: ["https://images.unsplash.com/photo-1582735689369-4d3753139316?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s13", key:"Capacity", value:"8kg"}, {id:"s14", key:"Energy Rating", value:"A+++ -10%"}, {id:"s15", key:"Special Feature", value:"SteamCure"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        documents: [{ id: "doc-defy-washer-1", title: "Feature Highlights", type: "image", imageUrls: ["https://images.unsplash.com/photo-1627813293848-f8d5e1a79854?q=80&w=800"] }],
        whatsInTheBox: ["Washing Machine", "Inlet & Outlet Hoses", "User Manual"]
    },
    { id: "p-defy-microwave-1", name: "DEFY 20L Solo Microwave", sku: "DMO382", brandId: "b-defy", categoryId: "cat-defy-cook",
        description: "A compact and stylish 20L microwave oven with 6 power levels, perfect for quick meals and defrosting. Its metallic finish complements any kitchen decor.",
        images: ["https://images.unsplash.com/photo-1643152292323-83a3108b9861?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s16", key:"Capacity", value:"20 Litres"}, {id:"s17", key:"Power Output", value:"700W"}, {id:"s18", key:"Finish", value:"Metallic"} ],
        whatsInTheBox: ["Microwave Oven", "Glass Turntable", "User Manual"]
    },
    
    // Edblo (6)
    { id: "p-edblo-bed-1", name: "Edblo Energiser Supreme Queen Bed Set", sku: "EDB789Q", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "Experience ultimate comfort and support with the Edblo Energiser Supreme. Featuring Bonnell Spring technology for a restful night's sleep.",
        images: ["https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s19", key:"Size", value:"Queen"}, {id:"s20", key:"Type", value:"Bonnell Spring"}, {id:"s21", key:"Firmness", value:"Medium"} ],
        documents: [{ id: "doc-edblo-bed-1", title: "Comfort Layers Guide", type: "image", imageUrls: ["https://images.unsplash.com/photo-1560185012-34f7b7fc868c?q=80&w=800"] }],
        whatsInTheBox: ["Mattress", "Base"]
    },
    { id: "p-edblo-bed-2", name: "Edblo Pocket Collection King Bed Set", sku: "EDBPOC-K", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "Individually wrapped pocket springs reduce motion transfer, providing undisturbed sleep. Luxurious foam layers offer pressure point relief and superior comfort.",
        images: ["https://images.unsplash.com/photo-1594025341382-2dac121a938c?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s22", key:"Size", value:"King"}, {id:"s23", key:"Type", value:"Pocket Spring"}, {id:"s24", key:"Top Layer", value:"High-Density Foam"} ],
        documents: [{ id: "doc-edblo-bed-2", title: "Warranty Information", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}],
        whatsInTheBox: ["Mattress", "Base"]
    },
    { id: "p-edblo-bed-3", name: "Edblo Hybrid Gel Memory Foam Double Bed", sku: "EDBGEL-D", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "A perfect hybrid of support and cooling comfort. Gel-infused memory foam regulates temperature while conforming to your body's unique shape.",
        images: ["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s25", key:"Size", value:"Double"}, {id:"s26", key:"Type", value:"Hybrid"}, {id:"s27", key:"Comfort Layer", value:"Gel Memory Foam"} ],
        whatsInTheBox: ["Mattress", "Base"]
    },
    { id: "p-edblo-bed-4", name: "Edblo OrthoCare Firm Queen Mattress", sku: "EDORTH-Q", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "Designed for superior back support, the OrthoCare Firm mattress provides a robust and stable sleeping surface to promote healthy spinal alignment.",
        images: ["https://images.unsplash.com/photo-1567016526107-89da61f62b88?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s28", key:"Size", value:"Queen"}, {id:"s29", key:"Type", value:"Orthopedic Bonnell"}, {id:"s30", key:"Firmness", value:"Firm"} ],
        whatsInTheBox: ["Mattress Only"]
    },
    { id: "p-edblo-bed-5", name: "Edblo Luxury Plush Pillow Top King Bed", sku: "EDBLUX-K", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "Sink into a cloud of comfort with this luxurious pillow top bed. Soft, breathable fabrics and plush foam layers create a five-star sleep experience.",
        images: ["https://images.unsplash.com/photo-1560185127-6ed189bf02a4?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s31", key:"Size", value:"King"}, {id:"s32", key:"Type", value:"Pillow Top"}, {id:"s33", key:"Feel", value:"Plush"} ],
        whatsInTheBox: ["Mattress", "Base"]
    },
    { id: "p-edblo-bed-6", name: "Edblo Studio Compact Single Bed", sku: "EDBSTU-S", brandId: "b-edblo", categoryId: "cat-edblo-comfort",
        description: "Perfect for apartments, dorms, and guest rooms, this single bed provides reliable Edblo comfort in a compact and affordable package.",
        images: ["https://images.unsplash.com/photo-1615875605825-5eb9bb5fea38?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s34", key:"Size", value:"Single"}, {id:"s35", key:"Type", value:"High-Density Foam Core"}, {id:"s36", key:"Ideal For", value:"Compact Spaces"} ],
        whatsInTheBox: ["Mattress", "Base"]
    },

    // Hisense (6)
    { id: "p-hisense-tv-1", name: "Hisense 55\" U6K Mini-LED ULED 4K TV", sku: "55U6K", brandId: "b-hisense", categoryId: "cat-hisense-tv",
        description: "ULED Mini-LED technology delivers breathtaking detail and contrast. Quantum Dot Colour provides over a billion shades for a vibrant picture. Dolby Vision & Atmos for an immersive cinematic experience.",
        images: ["https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s37", key:"Screen Size", value:"55 inches"}, {id:"s38", key:"Resolution", value:"4K Ultra HD"}, {id:"s39", key:"Display Type", value:"Mini-LED ULED"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        documents: [{ id: "doc-hisense-tv-1", title: "Quick Start Guide", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}],
        whatsInTheBox: ["ULED TV", "Remote", "Power Cable", "Stand", "User Manual"]
    },
    { id: "p-hisense-tv-2", name: "Hisense 75\" A6K UHD 4K Smart TV", sku: "75A6K", brandId: "b-hisense", categoryId: "cat-hisense-tv",
        description: "Immerse yourself in the action with a massive 75-inch screen. Featuring 4K resolution, DTS Virtual:X sound, and the intuitive VIDAA Smart TV platform.",
        images: ["https://images.unsplash.com/photo-1628521763953-2067711de259?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s40", key:"Screen Size", value:"75 inches"}, {id:"s41", key:"Resolution", value:"4K Ultra HD"}, {id:"s42", key:"Smart Platform", value:"VIDAA U6"} ],
        whatsInTheBox: ["UHD TV", "Remote", "Power Cable", "Stand", "User Manual"]
    },
    { id: "p-hisense-laser-1", name: "Hisense 100\" L9H Trichroma Laser TV", sku: "100L9H", brandId: "b-hisense", categoryId: "cat-hisense-tv",
        description: "The ultimate home cinema experience. This Laser TV projects a brilliant 4K image onto a 100-inch ambient light rejecting screen. Pure-color Trichroma lasers achieve 107% of the BT.2020 color space.",
        images: ["https://images.unsplash.com/photo-1611232882792-749e7d95355a?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s43", key:"Screen Size", value:"100 inches"}, {id:"s44", key:"Type", value:"Laser TV (UST Projector)"}, {id:"s45", key:"Light Source", value:"Trichroma Laser"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        whatsInTheBox: ["Laser Cinema Projector", "100\" ALR Screen", "Remote", "Power Cable"]
    },
    { id: "p-hisense-fridge-1", name: "Hisense 514L Black Glass French Door Fridge", sku: "H700FB-IDB", brandId: "b-hisense", categoryId: "cat-hisense-fridge",
        description: "A statement piece for your kitchen. This French door fridge features a sleek black glass finish, a non-plumbed water dispenser, and Triple Zone Cooling for optimal food preservation.",
        images: ["https://images.unsplash.com/photo-1605500262215-a751622c3c2d?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s46", key:"Capacity", value:"514 Litres"}, {id:"s47", key:"Style", value:"French Door"}, {id:"s48", key:"Finish", value:"Black Glass"} ],
        whatsInTheBox: ["Refrigerator Unit", "User Manual"]
    },
    { id: "p-hisense-fridge-2", name: "Hisense 269L Combi Fridge Freezer", sku: "H370BI-WD", brandId: "b-hisense", categoryId: "cat-hisense-fridge",
        description: "Stylish and practical, this combi fridge freezer comes in an inox finish and features a convenient non-plumbed water dispenser. Its reversible door design allows for versatile placement.",
        images: ["https://images.unsplash.com/photo-1620912189874-32a2651a0219?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s49", key:"Capacity", value:"269 Litres"}, {id:"s50", key:"Type", value:"Bottom Freezer"}, {id:"s51", key:"Features", value:"Water Dispenser"} ],
        whatsInTheBox: ["Refrigerator Unit", "User Manual"]
    },
    { id: "p-hisense-soundbar-1", name: "Hisense AX3100G 3.1Ch Dolby Atmos Soundbar", sku: "AX3100G", brandId: "b-hisense", categoryId: "cat-hisense-tv",
        description: "Elevate your audio with this 3.1 channel soundbar featuring a wireless subwoofer and Dolby Atmos for immersive, cinematic sound that moves around you.",
        images: ["https://images.unsplash.com/photo-1593929235339-a03970b13854?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s52", key:"Channels", value:"3.1"}, {id:"s53", key:"Sound Tech", value:"Dolby Atmos"}, {id:"s54", key:"Subwoofer", value:"Wireless"} ],
        whatsInTheBox: ["Soundbar", "Wireless Subwoofer", "Remote", "HDMI Cable", "Power Cables"]
    },

    // Bosch (6)
    { id: "p-bosch-washer-1", name: "Bosch Serie 4 8kg Front Loader", sku: "WAJ2426SZA", brandId: "b-bosch", categoryId: "cat-bosch-laundry",
        description: "The Serie 4 washing machine with EcoSilence Drive: enjoy supremely quiet operation and excellent durability. SpeedPerfect cuts washing time by up to 65%.",
        images: ["https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s55", key:"Capacity", value:"8 kg"}, {id:"s56", key:"Spin Speed", value:"1200 rpm"}, {id:"s57", key:"Motor", value:"EcoSilence Drive"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4",
        documents: [{ id: "doc-bosch-washer-1", title: "User Manual", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}],
        whatsInTheBox: ["Washing Machine", "Inlet hose", "User Manual"]
    },
    { id: "p-bosch-washer-2", name: "Bosch Serie 8 10kg Front Loader with i-DOS", sku: "WGB254A0ZA", brandId: "b-bosch", categoryId: "cat-bosch-laundry",
        description: "The premium Serie 8 washer with i-DOS automatic dosing system uses the perfect amount of detergent. The AntiStain system removes common stains with ease.",
        images: ["https://images.unsplash.com/photo-1604215887233-3c4a93540251?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s58", key:"Capacity", value:"10 kg"}, {id:"s59", key:"Dosing", value:"i-DOS Automatic"}, {id:"s60", key:"Special Feature", value:"AntiStain System"} ],
        whatsInTheBox: ["Washing Machine", "Inlet & Outlet Hoses", "User Manual"]
    },
    { id: "p-bosch-dishwasher-1", name: "Bosch Serie 6 Freestanding Dishwasher", sku: "SMS6HCI01Z", brandId: "b-bosch", categoryId: "cat-bosch-dish",
        description: "This smart dishwasher can be controlled via the Home Connect app. The ExtraDry option ensures perfectly dry dishes, and the VarioFlex baskets offer loading flexibility.",
        images: ["https://images.unsplash.com/photo-1601574464146-51d7c8637746?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s61", key:"Type", value:"Freestanding"}, {id:"s62", key:"Connectivity", value:"Home Connect (Wi-Fi)"}, {id:"s63", key:"Place Settings", value:"14"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/SubaruOutbackOnStreetAndDirt.mp4",
        documents: [{ id: "doc-bosch-dish-1", title: "Loading Guide", type: "image", imageUrls: ["https://images.unsplash.com/photo-1633511479833-22879685a782?q=80&w=800"] }],
        whatsInTheBox: ["Dishwasher", "Cutlery basket", "Hoses", "User Manual"]
    },
    { id: "p-bosch-dishwasher-2", name: "Bosch Serie 4 Built-in Dishwasher", sku: "SMV4HVX00K", brandId: "b-bosch", categoryId: "cat-bosch-dish",
        description: "A fully integrated dishwasher that blends seamlessly into your kitchen. InfoLight projects a dot onto the floor so you know when it's running. SuperSilence operates at just 44 dB.",
        images: ["https://images.unsplash.com/photo-1627902230782-d50ca932915c?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s64", key:"Type", value:"Fully Integrated"}, {id:"s65", key:"Noise Level", value:"44 dB"}, {id:"s66", key:"Feature", value:"InfoLight"} ],
        whatsInTheBox: ["Dishwasher", "Hoses", "Installation Kit", "User Manual"]
    },
    { id: "p-bosch-cooker-1", name: "Bosch 90cm Gas/Electric Cooker", sku: "HGV1F0U50Z", brandId: "b-bosch", categoryId: "cat-bosch-cook",
        description: "The best of both worlds. A 5-burner gas hob for precise heat control and a large multifunction electric oven for perfect baking and roasting.",
        images: ["https://images.unsplash.com/photo-1628529242331-56158e723287?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s67", key:"Size", value:"90cm"}, {id:"s68", key:"Hob", value:"5-Burner Gas"}, {id:"s69", key:"Oven", value:"Multifunction Electric"} ],
        whatsInTheBox: ["Freestanding Cooker", "Baking Tray", "Wire Rack", "User Manual"]
    },
    { id: "p-bosch-fridge-1", name: "Bosch Serie 4 KGN362IDR Fridge Freezer", sku: "KGN362IDR", brandId: "b-bosch", categoryId: "cat-defy-fridge",
        description: "The NoFrost bottom freezer with VitaFresh XXL keeps your food fresh for longer. Perfect digital temperature control and a sleek Inox-look design.",
        images: ["https://images.unsplash.com/photo-1601199963833-25a7a8d5f3a6?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s70", key:"Capacity", value:"321 Litres"}, {id:"s71", key:"Technology", value:"NoFrost"}, {id:"s72", key:"Crisper", value:"VitaFresh XXL"} ],
        whatsInTheBox: ["Refrigerator Unit", "Egg tray", "User Manual"]
    },

    // Whirlpool (6)
    { id: "p-whirlpool-fridge-1", name: "Whirlpool 6th Sense Side by Side Fridge", sku: "WSX5000", brandId: "b-whirlpool", categoryId: "cat-whirlpool-fridge",
        description: "This American-style fridge freezer is packed with clever technology like 6th SENSE to keep your food fresher for longer. A spacious and stylish addition to any kitchen.",
        images: ["https://images.unsplash.com/photo-1620912189874-32a2651a0219?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s73", key:"Total Capacity", value:"508 Litres"}, {id:"s74", key:"Technology", value:"6th SENSE"}, {id:"s75", key:"Finish", value:"Inox"} ],
        whatsInTheBox: ["Side by Side Refrigerator", "User Manual"]
    },
    { id: "p-whirlpool-fridge-2", name: "Whirlpool 330L Combi Fridge Freezer", sku: "W5811EOX", brandId: "b-whirlpool", categoryId: "cat-whirlpool-fridge",
        description: "LessFrost technology means you defrost less often. The modern optic inox design is fingerprint resistant, keeping your kitchen looking pristine.",
        images: ["https://images.unsplash.com/photo-1618221523455-2a8a18a99496?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s76", key:"Capacity", value:"330 Litres"}, {id:"s77", key:"Technology", value:"LessFrost"}, {id:"s78", key:"Finish", value:"Optic Inox"} ],
        whatsInTheBox: ["Refrigerator Unit", "User Manual"]
    },
    { id: "p-whirlpool-washer-1", name: "Whirlpool 10kg FreshCare+ Front Loader", sku: "W10FC+", brandId: "b-whirlpool", categoryId: "cat-whirlpool-laundry",
        description: "Keep laundry fresh even after the cycle ends with FreshCare+. The 6th SENSE motor ensures a quiet yet powerful performance, adapting resources for perfect results.",
        images: ["https://images.unsplash.com/photo-1623039014699-91e56b436a53?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s79", key:"Capacity", value:"10 kg"}, {id:"s80", key:"Technology", value:"6th SENSE"}, {id:"s81", key:"Feature", value:"FreshCare+"} ],
        whatsInTheBox: ["Washing Machine", "Hoses", "User Manual"]
    },
    { id: "p-whirlpool-dryer-1", name: "Whirlpool 8kg Heat Pump Tumble Dryer", sku: "W8HPD", brandId: "b-whirlpool", categoryId: "cat-whirlpool-laundry",
        description: "Achieve perfect drying results with exceptional energy efficiency thanks to Heat Pump technology. The FreshCare+ system keeps garments soft and fresh inside the dryer.",
        images: ["https://images.unsplash.com/photo-1604998103924-89e012e5265a?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s82", key:"Capacity", value:"8 kg"}, {id:"s83", key:"Technology", value:"Heat Pump"}, {id:"s84", key:"Energy Class", value:"A++"} ],
        whatsInTheBox: ["Tumble Dryer", "User Manual"]
    },
    { id: "p-whirlpool-hob-1", name: "Whirlpool 60cm Gas on Glass Hob", sku: "GOA6423NB", brandId: "b-whirlpool", categoryId: "cat-whirlpool-cook",
        description: "The elegance of a glass surface with the power and precision of gas cooking. This 4-burner hob features cast iron pan supports and front controls for ease of use.",
        images: ["https://images.unsplash.com/photo-1568248897217-15a0a38384b6?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s85", key:"Size", value:"60cm"}, {id:"s86", key:"Type", value:"Gas on Glass"}, {id:"s87", key:"Supports", value:"Cast Iron"} ],
        whatsInTheBox: ["Gas Hob", "LPG conversion kit", "User Manual"]
    },
    { id: "p-whirlpool-microwave-1", name: "Whirlpool 25L Crisp & Grill Microwave", sku: "MCP345BL", brandId: "b-whirlpool", categoryId: "cat-whirlpool-cook",
        description: "Go beyond reheating with the Crisp function for oven-like results and a powerful grill. JetDefrost technology defrosts up to 7 times faster than a conventional microwave.",
        images: ["https://images.unsplash.com/photo-1556911220-bff31c812dba?q=80&w=800&auto=format&fit=crop"],
        specifications: [ {id:"s88", key:"Capacity", value:"25 Litres"}, {id:"s89", key:"Functions", value:"Crisp, Grill, Defrost"}, {id:"s90", key:"Control", value:"Digital"} ],
        video: "https://storage.googleapis.com/gtv-videos-bucket/sample/TearsOfSteel.mp4",
        documents: [{ id: "doc-whirlpool-micro-1", title: "Recipe Book", type: "pdf", url: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf"}],
        whatsInTheBox: ["Microwave Oven", "Crisp Plate", "Grill Rack", "User Manual"]
    },
];

export const clients: Client[] = [
    { id: "client-1", companyName: "The Corner Cafe", contactPerson: "Alice Johnson", contactEmail: "alice@cornercafe.com", contactTel: "111-222-3333" },
    { id: "client-2", companyName: "Gourmet Solutions Ltd.", contactPerson: "Robert Chen", contactEmail: "rob@gourmet.co", contactTel: "444-555-6666" }
];

export const quotes: Quote[] = [];

export const catalogues: Catalogue[] = [
  { id: "catlg-defy-2024", title: "DEFY Kitchen & Laundry 2024", thumbnailUrl: "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=400&q=80", brandId: "b-defy", year: new Date().getFullYear(), type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1579546929518-9e396f3cc809?w=800&q=80", "https://images.unsplash.com/photo-1555448248-2571daf6344b?w=800&q=80", "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800&q=80", "https://images.unsplash.com/photo-1558591710-4b4a1ae0f04d?w=800&q=80" ] },
  { id: "catlg-hisense-2024", title: "Hisense Entertainment 2024", thumbnailUrl: "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=400&q=80", brandId: "b-hisense", year: new Date().getFullYear(), type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1554034483-04fda0d3507b?w=800&q=80", "https://images.unsplash.com/photo-1596731362294-f8a84bca213c?w=800&q=80", "https://images.unsplash.com/photo-1574169208507-84376144848b?w=800&q=80" ] },
  { id: "catlg-bosch-2024", title: "Bosch Home Appliances 2024", thumbnailUrl: "https://images.unsplash.com/photo-1605191141575-def5ade85b23?w=400&q=80", brandId: "b-bosch", year: new Date().getFullYear(), type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1605191141575-def5ade85b23?w=800&q=80", "https://images.unsplash.com/photo-1618022732103-6a0ea1a433e5?w=800&q=80", "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&q=80" ] },
  { id: "catlg-edblo-2023", title: "Edblo Comfort Collection 2023", thumbnailUrl: "https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=400&q=80", brandId: "b-edblo", year: new Date().getFullYear() - 1, type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1576502200916-3808e07386a5?w=800&q=80" ] },
  { id: "catlg-whirlpool-2024", title: "Whirlpool Innovation 2024", thumbnailUrl: "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=400&q=80", brandId: "b-whirlpool", year: new Date().getFullYear(), type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1620121692029-d088224ddc74?w=800&q=80", "https://images.unsplash.com/photo-1538688423619-a83d0f084044?w=800&q=80" ] },
];

export const pamphlets: Pamphlet[] = [
  { id: "pamph-mid-year-2024", title: "Mid-Year Madness", imageUrl: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=400&q=80&auto=format&fit=crop", startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString().split('T')[0], type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&q=80", "https://images.unsplash.com/photo-1607082349566-187342175e2f?w=800&q=80", "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9e?w=800&q=80" ] },
  { id: "pamph-clearance-2024", title: "Winter Clearance", imageUrl: "https://images.unsplash.com/photo-1572584642822-6e8de8dba0cb?w=400&q=80&auto=format&fit=crop", startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setDate(new Date().getDate() + 14)).toISOString().split('T')[0], type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1572584642822-6e8de8dba0cb?w=800&q=80", "https://images.unsplash.com/photo-1526178613552-2b45c6c302f0?w=800&q=80" ] },
  { id: "pamph-defy-2024", title: "DEFY Appliance Deals", imageUrl: "https://images.unsplash.com/photo-1526721664273-401d4131551a?w=400&q=80&auto=format&fit=crop", startDate: new Date().toISOString().split('T')[0], endDate: new Date(new Date().setDate(new Date().getDate() + 20)).toISOString().split('T')[0], type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1526721664273-401d4131551a?w=800&q=80", "https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=800&q=80", "https://images.unsplash.com/photo-1607082348386-5388c5917454?w=800&q=80", "https://images.unsplash.com/photo-1607082348928-3e4b2a6d4b5a?w=800&q=80" ] },
  { id: "pamph-hisense-2024", title: "Hisense Tech Fest", imageUrl: "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=400&q=80&auto=format&fit=crop", startDate: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString().split('T')[0], endDate: new Date(new Date().setDate(new Date().getDate() + 35)).toISOString().split('T')[0], type: 'image', imageUrls: [ "https://images.unsplash.com/photo-1560169897-fc0cdbdfa4d5?w=800&q=80" ] },
];

export const screensaverAds: ScreensaverAd[] = [];

export const tvContent: TvContent[] = [
    { id: "tv-hisense-1", brandId: "b-hisense", modelName: "Hisense ULED Series", media: [{ "url": "https://storage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4", "type": "video" }] },
];

const defaultLight: ThemeColors = {
  appBg: "#f3f4f6",
  appBgImage: "",
  mainBg: "#ffffff",
  mainText: "#1f2937",
  mainShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.07), 0 5px 10px -5px rgba(0, 0, 0, 0.04)",
  mainBorder: "1px solid #e5e7eb",
  primary: "#4f46e5",
  primaryButton: { background: "#4f46e5", text: "#ffffff", hoverBackground: "#4338ca" },
  destructiveButton: { background: "#dc2626", text: "#ffffff", hoverBackground: "#b91c1c" }
};

const defaultDark: ThemeColors = {
  appBg: "#111827",
  appBgImage: "radial-gradient(at 15% 20%, hsla(220, 80%, 30%, 0.25) 0px, transparent 50%), radial-gradient(at 85% 80%, hsla(280, 70%, 45%, 0.2) 0px, transparent 50%)",
  mainBg: "#1f2937",
  mainText: "#e5e7eb",
  mainShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.55), inset 0 1px 0 0 rgba(255, 255, 255, 0.05), 0 0 0 1px rgba(255, 255, 255, 0.03)",
  mainBorder: "1px solid rgba(255, 255, 255, 0.08)",
  primary: "#818cf8",
  primaryButton: { background: "#4f46e5", text: "#ffffff", hoverBackground: "#6366f1" },
  destructiveButton: { background: "#be123c", text: "#ffffff", hoverBackground: "#9f1239" }
};

const defaultBodyFont: FontStyleSettings = { fontFamily: "Inter", fontWeight: "400", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };
const defaultHeadingsFont: FontStyleSettings = { fontFamily: "Montserrat", fontWeight: "800", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };
const defaultItemTitlesFont: FontStyleSettings = { fontFamily: "Poppins", fontWeight: "600", fontStyle: "normal", textDecoration: "none", letterSpacing: 'normal', textTransform: 'none' };

export const settings: Settings = {
    appName: "DIGITAL STORE DISPLAY",
    appDescription: "An interactive digital catalogue for any brand, allowing users to browse products, view details, and explore collections.",
    logoUrl: "https://iili.io/KAzX5il.png",
    pwaIconUrl: "https://iili.io/KAzX5il.png",
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