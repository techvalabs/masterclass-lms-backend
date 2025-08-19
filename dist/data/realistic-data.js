/**
 * Realistic Data for Real Estate Masterclass LMS
 * Based on industry-standard LMS patterns from Canvas and educational best practices
 */
// Realistic Users Data
export const realisticUsers = [
    {
        id: 1,
        name: "Sarah Mitchell",
        email: "sarah.mitchell@example.com",
        role: "student",
        roleId: 1,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/sarah-mitchell.jpg",
        bio: "Aspiring real estate investor looking to build generational wealth through property investments. Background in finance.",
        phone: "+1-555-0123",
        location: "Austin, TX",
        experience: "Beginner",
        specialties: ["Residential Investment"],
        enrollmentCount: 4,
        completedCourses: 2,
        totalSpent: 897.94,
        certifications: ["Real Estate Investment Fundamentals Certificate"]
    },
    {
        id: 2,
        name: "Marcus Rodriguez",
        email: "marcus.rodriguez@example.com",
        role: "student",
        roleId: 1,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 62 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/marcus-rodriguez.jpg",
        bio: "Licensed realtor expanding into investment properties and wholesaling. 3 years in residential sales.",
        phone: "+1-555-0234",
        location: "Phoenix, AZ",
        experience: "Intermediate",
        specialties: ["Wholesaling", "Fix & Flip"],
        enrollmentCount: 6,
        completedCourses: 4,
        totalSpent: 1547.88,
        certifications: ["Wholesaling Mastery Certificate", "Property Analysis Pro"]
    },
    {
        id: 3,
        name: "Dr. Jennifer Chen",
        email: "jennifer.chen@realestatepro.com",
        role: "instructor",
        roleId: 2,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 180 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/jennifer-chen.jpg",
        bio: "Commercial real estate investor with $50M+ in transactions. Former investment banker turned full-time investor and educator.",
        phone: "+1-555-0345",
        location: "San Francisco, CA",
        experience: "Expert",
        specialties: ["Commercial Real Estate", "Syndications", "Financial Analysis"],
        enrollmentCount: 0,
        completedCourses: 0,
        totalSpent: 0,
        certifications: ["CCIM", "MBA Finance", "Licensed Real Estate Broker"]
    },
    {
        id: 4,
        name: "Robert 'BiggerPockets' Johnson",
        email: "robert.johnson@example.com",
        role: "instructor",
        roleId: 2,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 240 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/robert-johnson.jpg",
        bio: "Full-time real estate investor with 200+ rental units. Host of popular real estate podcast and bestselling author.",
        phone: "+1-555-0456",
        location: "Denver, CO",
        experience: "Expert",
        specialties: ["Buy & Hold", "BRRRR Strategy", "Property Management"],
        enrollmentCount: 0,
        completedCourses: 0,
        totalSpent: 0,
        certifications: ["Real Estate License", "Property Management Certification"]
    },
    {
        id: 5,
        name: "Lisa Thompson",
        email: "lisa.thompson@example.com",
        role: "student",
        roleId: 1,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/lisa-thompson.jpg",
        bio: "Corporate executive transitioning to real estate investing for passive income. Interested in turnkey properties.",
        phone: "+1-555-0567",
        location: "Chicago, IL",
        experience: "Beginner",
        specialties: ["Turnkey Investing"],
        enrollmentCount: 2,
        completedCourses: 1,
        totalSpent: 399.99,
        certifications: []
    },
    {
        id: 6,
        name: "System Administrator",
        email: "admin@masterclass.com",
        role: "admin",
        roleId: 3,
        isActive: true,
        isVerified: true,
        lastLogin: new Date().toISOString(),
        createdAt: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date().toISOString(),
        avatar: "/uploads/avatars/admin.jpg",
        bio: "Platform administrator managing the Real Estate Masterclass learning management system.",
        phone: "+1-555-0000",
        location: "Remote",
        experience: "Admin",
        specialties: ["Platform Management", "User Support", "Content Curation"],
        enrollmentCount: 0,
        completedCourses: 0,
        totalSpent: 0,
        certifications: ["LMS Administration", "Customer Success"]
    },
    {
        id: 7,
        name: "David Park",
        email: "david.park@example.com",
        role: "student",
        roleId: 1,
        isActive: true,
        isVerified: true,
        lastLogin: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        avatar: "/uploads/avatars/david-park.jpg",
        bio: "Tech entrepreneur diversifying into real estate. Focused on data-driven investment decisions.",
        phone: "+1-555-0678",
        location: "Seattle, WA",
        experience: "Intermediate",
        specialties: ["Data Analysis", "PropTech"],
        enrollmentCount: 3,
        completedCourses: 1,
        totalSpent: 697.97,
        certifications: ["Property Analysis Pro"]
    },
    {
        id: 8,
        name: "Amanda Foster",
        email: "amanda.foster@example.com",
        role: "student",
        roleId: 1,
        isActive: true,
        isVerified: false,
        lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
        avatar: null,
        bio: "New to real estate investing. Recently started learning about rental properties.",
        phone: "+1-555-0789",
        location: "Miami, FL",
        experience: "Beginner",
        specialties: [],
        enrollmentCount: 1,
        completedCourses: 0,
        totalSpent: 99.99,
        certifications: []
    }
];
// Realistic Courses Data
export const realisticCourses = [
    {
        id: 1,
        title: "Real Estate Investment Fundamentals: Build Wealth Through Property",
        slug: "real-estate-investment-fundamentals",
        description: "Master the foundations of real estate investing with this comprehensive course designed for beginners. Learn how to analyze properties, understand market dynamics, secure financing, and build a profitable real estate portfolio. This course covers everything from finding your first investment property to scaling a multi-million dollar portfolio.",
        shortDescription: "Complete beginner's guide to real estate investing - from your first property to building wealth",
        thumbnail: "/uploads/courses/real-estate-fundamentals.jpg",
        previewVideo: "/uploads/previews/fundamentals-preview.mp4",
        price: 299.99,
        originalPrice: 499.99,
        currency: "USD",
        level: "Beginner",
        duration: {
            hours: 12,
            minutes: 45,
            total: 765
        },
        language: "en",
        tags: ["Investment", "Beginner", "Portfolio Building", "Property Analysis", "Financing"],
        learningOutcomes: [
            "Analyze investment properties using proven financial metrics (Cap Rate, Cash-on-Cash Return, DSCR)",
            "Understand different real estate investment strategies (Buy & Hold, BRRRR, Fix & Flip)",
            "Navigate financing options including conventional loans, hard money, and creative financing",
            "Identify profitable markets and neighborhoods for investment",
            "Build a systematic approach to finding and evaluating deals",
            "Create a personal investment plan aligned with your financial goals"
        ],
        requirements: [
            "Basic understanding of personal finance",
            "Access to computer and internet for research tools",
            "Willingness to take action on learned concepts",
            "No prior real estate experience required"
        ],
        targetAudience: [
            "Complete beginners to real estate investing",
            "Professionals looking for passive income streams",
            "Those seeking financial independence through real estate",
            "Anyone wanting to diversify their investment portfolio"
        ],
        features: [
            "12+ hours of video content",
            "Downloadable Excel calculators and templates",
            "Private community access",
            "30-day money-back guarantee",
            "Lifetime updates",
            "Mobile-friendly platform",
            "Certificate of completion"
        ],
        rating: 4.8,
        totalRatings: 1247,
        totalStudents: 3891,
        totalLessons: 42,
        isPublished: true,
        isFeatured: true,
        isFree: false,
        publishDate: new Date(Date.now() - 120 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 130 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: {
            id: 4,
            name: "Robert 'BiggerPockets' Johnson",
            email: "robert.johnson@example.com",
            bio: "Full-time real estate investor with 200+ rental units. Host of popular real estate podcast and bestselling author.",
            avatar: "/uploads/avatars/robert-johnson.jpg",
            specialties: ["Buy & Hold", "BRRRR Strategy", "Property Management"],
            experience: "15+ years, $10M+ in transactions"
        },
        category: {
            id: 1,
            name: "Investment Fundamentals",
            slug: "investment-fundamentals"
        },
        stats: {
            activeEnrollments: 3891,
            completions: 2801,
            totalRevenue: 1167269.09,
            completionRate: 72,
            averageRating: 4.8,
            reviewCount: 1247
        }
    },
    {
        id: 2,
        title: "Commercial Real Estate Mastery: Analyze, Acquire, and Scale",
        slug: "commercial-real-estate-mastery",
        description: "Dive deep into the world of commercial real estate investing with this advanced course. Learn how to analyze office buildings, retail centers, industrial properties, and multifamily complexes. Master due diligence processes, understand cap rates and NOI, and discover how to raise capital for large deals.",
        shortDescription: "Advanced course on commercial real estate investing, syndications, and institutional-level deals",
        thumbnail: "/uploads/courses/commercial-real-estate.jpg",
        previewVideo: "/uploads/previews/commercial-preview.mp4",
        price: 899.99,
        originalPrice: 1299.99,
        currency: "USD",
        level: "Advanced",
        duration: {
            hours: 18,
            minutes: 30,
            total: 1110
        },
        language: "en",
        tags: ["Commercial", "Advanced", "Syndications", "Cap Rates", "Due Diligence"],
        learningOutcomes: [
            "Analyze commercial properties using institutional-grade metrics",
            "Understand commercial financing structures and terms",
            "Navigate the due diligence process for large transactions",
            "Learn syndication structures and SEC regulations",
            "Master commercial lease analysis and tenant evaluation",
            "Develop skills in raising capital from investors"
        ],
        requirements: [
            "Basic real estate investment knowledge",
            "Understanding of financial statements",
            "Serious commitment to commercial investing",
            "Access to capital or investor network helpful"
        ],
        targetAudience: [
            "Experienced residential investors looking to scale",
            "Commercial brokers expanding their knowledge",
            "High-net-worth individuals seeking larger deals",
            "Investment professionals and fund managers"
        ],
        features: [
            "18+ hours of expert instruction",
            "Commercial analysis spreadsheets",
            "Deal case studies and walkthroughs",
            "Guest interviews with industry experts",
            "Quarterly live Q&A sessions",
            "Advanced calculator tools",
            "Professional certificate"
        ],
        rating: 4.9,
        totalRatings: 456,
        totalStudents: 891,
        totalLessons: 36,
        isPublished: true,
        isFeatured: true,
        isFree: false,
        publishDate: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 100 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: {
            id: 3,
            name: "Dr. Jennifer Chen",
            email: "jennifer.chen@realestatepro.com",
            bio: "Commercial real estate investor with $50M+ in transactions. Former investment banker turned full-time investor and educator.",
            avatar: "/uploads/avatars/jennifer-chen.jpg",
            specialties: ["Commercial Real Estate", "Syndications", "Financial Analysis"],
            experience: "20+ years, $50M+ in transactions"
        },
        category: {
            id: 2,
            name: "Commercial Real Estate",
            slug: "commercial-real-estate"
        },
        stats: {
            activeEnrollments: 891,
            completions: 634,
            totalRevenue: 802049.09,
            completionRate: 71,
            averageRating: 4.9,
            reviewCount: 456
        }
    },
    {
        id: 3,
        title: "Wholesaling Real Estate: Quick Profits Without Capital",
        slug: "wholesaling-real-estate-quick-profits",
        description: "Learn how to make money in real estate without using your own capital through wholesaling. This course teaches you how to find distressed properties, negotiate with motivated sellers, and assign contracts to cash buyers for quick profits. Perfect for those with limited capital but high motivation.",
        shortDescription: "Complete guide to real estate wholesaling - make money without capital or credit",
        thumbnail: "/uploads/courses/wholesaling-mastery.jpg",
        previewVideo: "/uploads/previews/wholesaling-preview.mp4",
        price: 199.99,
        originalPrice: 399.99,
        currency: "USD",
        level: "Beginner",
        duration: {
            hours: 8,
            minutes: 15,
            total: 495
        },
        language: "en",
        tags: ["Wholesaling", "No Money Down", "Contract Assignment", "Marketing"],
        learningOutcomes: [
            "Find motivated sellers through multiple marketing channels",
            "Negotiate win-win deals with property owners",
            "Structure wholesale contracts and assignments",
            "Build a buyers list of cash investors",
            "Calculate wholesale deals and assignment fees",
            "Navigate legal requirements and disclosure laws"
        ],
        requirements: [
            "Strong work ethic and persistence",
            "Basic communication skills",
            "Willingness to network and build relationships",
            "No capital or credit required to start"
        ],
        targetAudience: [
            "New investors with limited capital",
            "Those seeking quick income opportunities",
            "Real estate agents expanding services",
            "Anyone interested in real estate entrepreneurship"
        ],
        features: [
            "8+ hours of step-by-step training",
            "Contract templates and forms",
            "Marketing materials and scripts",
            "Buyer list building strategies",
            "Live deal analysis examples",
            "Beginner-friendly approach",
            "Action-oriented curriculum"
        ],
        rating: 4.6,
        totalRatings: 892,
        totalStudents: 2156,
        totalLessons: 28,
        isPublished: true,
        isFeatured: false,
        isFree: false,
        publishDate: new Date(Date.now() - 75 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 85 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: {
            id: 4,
            name: "Robert 'BiggerPockets' Johnson",
            email: "robert.johnson@example.com",
            bio: "Full-time real estate investor with 200+ rental units. Host of popular real estate podcast and bestselling author.",
            avatar: "/uploads/avatars/robert-johnson.jpg",
            specialties: ["Buy & Hold", "BRRRR Strategy", "Property Management"],
            experience: "15+ years, $10M+ in transactions"
        },
        category: {
            id: 3,
            name: "Wholesaling",
            slug: "wholesaling"
        },
        stats: {
            activeEnrollments: 2156,
            completions: 1587,
            totalRevenue: 431157.44,
            completionRate: 74,
            averageRating: 4.6,
            reviewCount: 892
        }
    },
    {
        id: 4,
        title: "Fix & Flip Academy: Renovation Profits Masterclass",
        slug: "fix-flip-academy-renovation-profits",
        description: "Master the art and science of house flipping with this comprehensive course. Learn how to find the right properties, estimate renovation costs accurately, manage contractors, and maximize profits. Includes detailed case studies of actual flips with before/after financials.",
        shortDescription: "Complete house flipping course - from acquisition to sale with real case studies",
        thumbnail: "/uploads/courses/fix-flip-academy.jpg",
        previewVideo: "/uploads/previews/fixflip-preview.mp4",
        price: 497.99,
        originalPrice: 799.99,
        currency: "USD",
        level: "Intermediate",
        duration: {
            hours: 14,
            minutes: 20,
            total: 860
        },
        language: "en",
        tags: ["Fix & Flip", "Renovation", "Contracting", "Project Management"],
        learningOutcomes: [
            "Find profitable flip opportunities in any market",
            "Accurately estimate renovation costs and timelines",
            "Manage contractors and construction projects",
            "Understand permits, zoning, and legal requirements",
            "Calculate maximum acquisition price (MAO formula)",
            "Stage and market properties for maximum sale price"
        ],
        requirements: [
            "Basic real estate knowledge helpful",
            "Access to capital or financing",
            "Ability to oversee construction projects",
            "Understanding of local building codes recommended"
        ],
        targetAudience: [
            "Real estate investors seeking active income",
            "Contractors expanding into investing",
            "Those with project management experience",
            "Investors comfortable with hands-on involvement"
        ],
        features: [
            "14+ hours of detailed instruction",
            "Renovation cost calculators",
            "Contractor vetting checklists",
            "Before/after flip case studies",
            "Project timeline templates",
            "Marketing and staging guides",
            "Expert guest interviews"
        ],
        rating: 4.7,
        totalRatings: 623,
        totalStudents: 1445,
        totalLessons: 38,
        isPublished: true,
        isFeatured: false,
        isFree: false,
        publishDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 70 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: {
            id: 4,
            name: "Robert 'BiggerPockets' Johnson",
            email: "robert.johnson@example.com",
            bio: "Full-time real estate investor with 200+ rental units. Host of popular real estate podcast and bestselling author.",
            avatar: "/uploads/avatars/robert-johnson.jpg",
            specialties: ["Buy & Hold", "BRRRR Strategy", "Property Management"],
            experience: "15+ years, $10M+ in transactions"
        },
        category: {
            id: 4,
            name: "Fix & Flip",
            slug: "fix-flip"
        },
        stats: {
            activeEnrollments: 1445,
            completions: 982,
            totalRevenue: 719399.55,
            completionRate: 68,
            averageRating: 4.7,
            reviewCount: 623
        }
    },
    {
        id: 5,
        title: "Property Management Mastery: Scale Your Rental Empire",
        slug: "property-management-mastery-scale-rentals",
        description: "Learn professional property management techniques to maximize your rental income and minimize headaches. This course covers tenant screening, lease agreements, maintenance systems, legal compliance, and scaling operations for multiple properties.",
        shortDescription: "Professional property management course - maximize income and minimize tenant problems",
        thumbnail: "/uploads/courses/property-management.jpg",
        price: 249.99,
        originalPrice: 449.99,
        currency: "USD",
        level: "Intermediate",
        duration: {
            hours: 9,
            minutes: 45,
            total: 585
        },
        language: "en",
        tags: ["Property Management", "Tenant Screening", "Lease Agreements", "Maintenance"],
        learningOutcomes: [
            "Implement professional tenant screening processes",
            "Create bulletproof lease agreements",
            "Develop efficient maintenance and repair systems",
            "Understand landlord-tenant laws and compliance",
            "Build systems for managing multiple properties",
            "Maximize rental income through strategic improvements"
        ],
        requirements: [
            "Own or planning to own rental properties",
            "Basic understanding of real estate investing",
            "Willingness to implement systematic processes"
        ],
        targetAudience: [
            "Rental property owners",
            "Aspiring property managers",
            "Real estate investors scaling portfolios",
            "Those seeking passive income optimization"
        ],
        features: [
            "9+ hours of practical training",
            "Tenant screening templates",
            "Lease agreement samples",
            "Maintenance tracking systems",
            "Legal compliance checklists",
            "Property management software reviews",
            "Real-world case studies"
        ],
        rating: 4.5,
        totalRatings: 334,
        totalStudents: 856,
        totalLessons: 24,
        isPublished: true,
        isFeatured: false,
        isFree: false,
        publishDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date(Date.now() - 55 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        instructor: {
            id: 4,
            name: "Robert 'BiggerPockets' Johnson",
            email: "robert.johnson@example.com",
            bio: "Full-time real estate investor with 200+ rental units. Host of popular real estate podcast and bestselling author.",
            avatar: "/uploads/avatars/robert-johnson.jpg",
            specialties: ["Buy & Hold", "BRRRR Strategy", "Property Management"],
            experience: "15+ years, $10M+ in transactions"
        },
        category: {
            id: 5,
            name: "Property Management",
            slug: "property-management"
        },
        stats: {
            activeEnrollments: 856,
            completions: 567,
            totalRevenue: 213991.44,
            completionRate: 66,
            averageRating: 4.5,
            reviewCount: 334
        }
    }
];
// Realistic Transactions Data
export const realisticTransactions = [
    {
        id: 1,
        userId: 1,
        courseId: 1,
        orderId: "ORD-2025-001247",
        transactionId: "txn_1QRzK2P3mN4vN5xX",
        paymentMethod: "stripe",
        paymentProviderId: "pi_1QRzK2P3mN4vN5xX_secret_8hLz9QeC2w",
        amount: 299.99,
        currency: "USD",
        feeAmount: 9.29,
        netAmount: 290.70,
        status: "completed",
        paymentDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Course purchase: Real Estate Investment Fundamentals",
        metadata: {
            source: "web",
            campaign: "holiday_sale_2024",
            discount_code: "SAVE40"
        },
        gatewayResponse: {
            id: "pi_1QRzK2P3mN4vN5xX",
            status: "succeeded",
            amount: 29999,
            currency: "usd"
        },
        createdAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
            name: "Sarah Mitchell",
            email: "sarah.mitchell@example.com"
        },
        course: {
            title: "Real Estate Investment Fundamentals: Build Wealth Through Property",
            price: 299.99
        },
        refunds: {
            count: 0,
            amount: 0
        }
    },
    {
        id: 2,
        userId: 2,
        courseId: 2,
        orderId: "ORD-2025-001248",
        transactionId: "txn_1QRzL3P3mN4vN6yY",
        paymentMethod: "paypal",
        paymentProviderId: "PAYID-MZ4XYIA2VL123456A",
        amount: 899.99,
        currency: "USD",
        feeAmount: 26.37,
        netAmount: 873.62,
        status: "completed",
        paymentDate: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Course purchase: Commercial Real Estate Mastery",
        metadata: {
            source: "mobile_app",
            campaign: "advanced_learner_promo"
        },
        gatewayResponse: {
            id: "PAYID-MZ4XYIA2VL123456A",
            status: "COMPLETED",
            amount: "899.99",
            currency_code: "USD"
        },
        createdAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 12 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
            name: "Marcus Rodriguez",
            email: "marcus.rodriguez@example.com"
        },
        course: {
            title: "Commercial Real Estate Mastery: Analyze, Acquire, and Scale",
            price: 899.99
        },
        refunds: {
            count: 0,
            amount: 0
        }
    },
    {
        id: 3,
        userId: 5,
        courseId: 3,
        orderId: "ORD-2025-001249",
        transactionId: "txn_1QRzM4P3mN4vN7zZ",
        paymentMethod: "stripe",
        paymentProviderId: "pi_1QRzM4P3mN4vN7zZ_secret_9iMa0QdD3x",
        amount: 199.99,
        currency: "USD",
        feeAmount: 6.09,
        netAmount: 193.90,
        status: "completed",
        paymentDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Course purchase: Wholesaling Real Estate",
        metadata: {
            source: "web",
            campaign: "beginner_bundle"
        },
        gatewayResponse: {
            id: "pi_1QRzM4P3mN4vN7zZ",
            status: "succeeded",
            amount: 19999,
            currency: "usd"
        },
        createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
            name: "Lisa Thompson",
            email: "lisa.thompson@example.com"
        },
        course: {
            title: "Wholesaling Real Estate: Quick Profits Without Capital",
            price: 199.99
        },
        refunds: {
            count: 0,
            amount: 0
        }
    },
    {
        id: 4,
        userId: 7,
        courseId: 4,
        orderId: "ORD-2025-001250",
        transactionId: "txn_1QRzN5P3mN4vN8aA",
        paymentMethod: "stripe",
        paymentProviderId: "pi_1QRzN5P3mN4vN8aA_secret_0jNb1QeE4y",
        amount: 497.99,
        currency: "USD",
        feeAmount: 14.75,
        netAmount: 483.24,
        status: "completed",
        paymentDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Course purchase: Fix & Flip Academy",
        metadata: {
            source: "web",
            campaign: "intermediate_level_boost"
        },
        gatewayResponse: {
            id: "pi_1QRzN5P3mN4vN8aA",
            status: "succeeded",
            amount: 49799,
            currency: "usd"
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
            name: "David Park",
            email: "david.park@example.com"
        },
        course: {
            title: "Fix & Flip Academy: Renovation Profits Masterclass",
            price: 497.99
        },
        refunds: {
            count: 0,
            amount: 0
        }
    },
    {
        id: 5,
        userId: 8,
        courseId: 1,
        orderId: "ORD-2025-001251",
        transactionId: "txn_1QRzO6P3mN4vN9bB",
        paymentMethod: "stripe",
        paymentProviderId: "pi_1QRzO6P3mN4vN9bB_secret_1kOc2QfF5z",
        amount: 99.99,
        currency: "USD",
        feeAmount: 3.19,
        netAmount: 96.80,
        status: "completed",
        paymentDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        description: "Course purchase: Real Estate Investment Fundamentals (First Time Buyer Discount)",
        metadata: {
            source: "mobile_app",
            campaign: "first_time_buyer",
            discount_code: "FIRSTBUY70"
        },
        gatewayResponse: {
            id: "pi_1QRzO6P3mN4vN9bB",
            status: "succeeded",
            amount: 9999,
            currency: "usd"
        },
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
        user: {
            name: "Amanda Foster",
            email: "amanda.foster@example.com"
        },
        course: {
            title: "Real Estate Investment Fundamentals: Build Wealth Through Property",
            price: 299.99
        },
        refunds: {
            count: 0,
            amount: 0
        }
    }
];
// Realistic Settings Data
export const realisticSettings = {
    general: {
        site_name: {
            value: "Real Estate Masterclass",
            type: "string",
            description: "The name of the learning platform"
        },
        site_description: {
            value: "Learn real estate investing from industry experts. Build wealth through property investment with our comprehensive courses on buy-and-hold, fix-and-flip, wholesaling, and commercial real estate.",
            type: "string",
            description: "Site description for SEO and marketing"
        },
        site_logo: {
            value: "/uploads/branding/logo-main.png",
            type: "string",
            description: "Main site logo file path"
        },
        site_favicon: {
            value: "/uploads/branding/favicon.ico",
            type: "string",
            description: "Site favicon file path"
        },
        default_timezone: {
            value: "America/New_York",
            type: "string",
            description: "Default timezone for the platform"
        },
        maintenance_mode: {
            value: false,
            type: "boolean",
            description: "Enable maintenance mode to disable public access"
        }
    },
    email: {
        smtp_host: {
            value: "smtp.sendgrid.net",
            type: "string",
            description: "SMTP server hostname"
        },
        smtp_port: {
            value: 587,
            type: "number",
            description: "SMTP server port"
        },
        smtp_username: {
            value: "apikey",
            type: "string",
            description: "SMTP authentication username"
        },
        smtp_encryption: {
            value: "tls",
            type: "string",
            description: "SMTP encryption method (tls/ssl)"
        },
        from_email: {
            value: "noreply@realestateMasterclass.com",
            type: "string",
            description: "Default sender email address"
        },
        from_name: {
            value: "Real Estate Masterclass",
            type: "string",
            description: "Default sender name"
        },
        support_email: {
            value: "support@realestateMasterclass.com",
            type: "string",
            description: "Support contact email"
        }
    },
    payment: {
        stripe_publishable_key: {
            value: "pk_live_51234567890abcdef",
            type: "string",
            description: "Stripe publishable API key"
        },
        paypal_client_id: {
            value: "AYjcyDgD12345678901234567890",
            type: "string",
            description: "PayPal client ID for payments"
        },
        paypal_mode: {
            value: "live",
            type: "string",
            description: "PayPal environment (sandbox/live)"
        },
        default_currency: {
            value: "USD",
            type: "string",
            description: "Default payment currency"
        },
        tax_rate: {
            value: 0.0875,
            type: "number",
            description: "Default tax rate (as decimal)"
        },
        enable_coupons: {
            value: true,
            type: "boolean",
            description: "Enable coupon/discount code functionality"
        }
    },
    course: {
        default_enrollment_period: {
            value: 365,
            type: "number",
            description: "Default course access period in days"
        },
        allow_free_preview: {
            value: true,
            type: "boolean",
            description: "Allow preview of course content without enrollment"
        },
        max_preview_lessons: {
            value: 3,
            type: "number",
            description: "Maximum number of preview lessons per course"
        },
        enable_certificates: {
            value: true,
            type: "boolean",
            description: "Enable course completion certificates"
        },
        certificate_template: {
            value: "/uploads/templates/certificate-template.pdf",
            type: "string",
            description: "Default certificate template file"
        },
        auto_enrollment: {
            value: true,
            type: "boolean",
            description: "Automatically enroll users after successful payment"
        }
    },
    security: {
        session_lifetime: {
            value: 1440,
            type: "number",
            description: "User session lifetime in minutes"
        },
        password_min_length: {
            value: 8,
            type: "number",
            description: "Minimum password length requirement"
        },
        require_email_verification: {
            value: true,
            type: "boolean",
            description: "Require email verification for new accounts"
        },
        enable_two_factor: {
            value: false,
            type: "boolean",
            description: "Enable two-factor authentication option"
        },
        max_login_attempts: {
            value: 5,
            type: "number",
            description: "Maximum failed login attempts before lockout"
        },
        lockout_duration: {
            value: 15,
            type: "number",
            description: "Account lockout duration in minutes"
        }
    },
    analytics: {
        google_analytics_id: {
            value: "G-XXXXXXXXXX",
            type: "string",
            description: "Google Analytics tracking ID"
        },
        facebook_pixel_id: {
            value: "1234567890123456",
            type: "string",
            description: "Facebook Pixel ID for tracking"
        },
        enable_user_tracking: {
            value: true,
            type: "boolean",
            description: "Enable detailed user behavior tracking"
        },
        track_lesson_completion: {
            value: true,
            type: "boolean",
            description: "Track individual lesson completion events"
        }
    },
    social: {
        facebook_url: {
            value: "https://facebook.com/realestateMasterclass",
            type: "string",
            description: "Official Facebook page URL"
        },
        twitter_url: {
            value: "https://twitter.com/REMasterclass",
            type: "string",
            description: "Official Twitter profile URL"
        },
        youtube_url: {
            value: "https://youtube.com/c/realestateMasterclass",
            type: "string",
            description: "Official YouTube channel URL"
        },
        linkedin_url: {
            value: "https://linkedin.com/company/real-estate-masterclass",
            type: "string",
            description: "Official LinkedIn company page URL"
        },
        enable_social_login: {
            value: true,
            type: "boolean",
            description: "Enable social media login options"
        }
    }
};
// Dashboard Statistics
export const realisticDashboardStats = {
    users: {
        total: 2847,
        new30d: 312,
        growth: "12.3"
    },
    courses: {
        total: 47,
        new30d: 3,
        growth: "6.8"
    },
    enrollments: {
        total: 8934,
        new30d: 1247,
        growth: "16.2"
    },
    revenue: {
        total: 487650.00,
        month30d: 89340.00,
        growth: "22.4"
    },
    transactions: {
        total: 3421,
        new30d: 412,
        growth: "13.7"
    },
    avgRating: 4.7,
    newReviews30d: 156
};
// Analytics Data
export const realisticAnalytics = {
    '7d': {
        userRegistrations: [
            { date: '2024-12-08', count: 12 },
            { date: '2024-12-09', count: 18 },
            { date: '2024-12-10', count: 15 },
            { date: '2024-12-11', count: 22 },
            { date: '2024-12-12', count: 28 },
            { date: '2024-12-13', count: 31 },
            { date: '2024-12-14', count: 25 }
        ],
        enrollments: [
            { date: '2024-12-08', count: 45 },
            { date: '2024-12-09', count: 52 },
            { date: '2024-12-10', count: 38 },
            { date: '2024-12-11', count: 67 },
            { date: '2024-12-12', count: 73 },
            { date: '2024-12-13', count: 81 },
            { date: '2024-12-14', count: 69 }
        ],
        revenue: [
            { date: '2024-12-08', amount: 2340.00 },
            { date: '2024-12-09', amount: 3125.00 },
            { date: '2024-12-10', amount: 1890.00 },
            { date: '2024-12-11', amount: 4230.00 },
            { date: '2024-12-12', amount: 5670.00 },
            { date: '2024-12-13', amount: 6780.00 },
            { date: '2024-12-14', amount: 4890.00 }
        ],
        courseCreations: [
            { date: '2024-12-08', count: 0 },
            { date: '2024-12-09', count: 1 },
            { date: '2024-12-10', count: 0 },
            { date: '2024-12-11', count: 0 },
            { date: '2024-12-12', count: 1 },
            { date: '2024-12-13', count: 0 },
            { date: '2024-12-14', count: 1 }
        ]
    },
    '30d': {
        userRegistrations: [
            { date: '2024-11-15', count: 25 },
            { date: '2024-11-16', count: 18 },
            { date: '2024-11-17', count: 32 },
            { date: '2024-11-18', count: 28 },
            { date: '2024-11-19', count: 35 },
            { date: '2024-11-20', count: 42 },
            { date: '2024-11-21', count: 38 },
            { date: '2024-11-22', count: 29 },
            { date: '2024-11-23', count: 33 },
            { date: '2024-11-24', count: 27 },
            { date: '2024-11-25', count: 31 },
            { date: '2024-11-26', count: 24 },
            { date: '2024-11-27', count: 36 },
            { date: '2024-11-28', count: 41 },
            { date: '2024-11-29', count: 39 },
            { date: '2024-11-30', count: 44 },
            { date: '2024-12-01', count: 47 },
            { date: '2024-12-02', count: 35 },
            { date: '2024-12-03', count: 52 },
            { date: '2024-12-04', count: 48 },
            { date: '2024-12-05', count: 41 },
            { date: '2024-12-06', count: 38 },
            { date: '2024-12-07', count: 45 },
            { date: '2024-12-08', count: 42 },
            { date: '2024-12-09', count: 39 },
            { date: '2024-12-10', count: 46 },
            { date: '2024-12-11', count: 53 },
            { date: '2024-12-12', count: 49 },
            { date: '2024-12-13', count: 51 },
            { date: '2024-12-14', count: 47 }
        ],
        enrollments: [
            { date: '2024-11-15', count: 89 },
            { date: '2024-11-16', count: 76 },
            { date: '2024-11-17', count: 112 },
            { date: '2024-11-18', count: 95 },
            { date: '2024-11-19', count: 124 },
            { date: '2024-11-20', count: 138 },
            { date: '2024-11-21', count: 127 },
            { date: '2024-11-22', count: 98 },
            { date: '2024-11-23', count: 115 },
            { date: '2024-11-24', count: 87 },
            { date: '2024-11-25', count: 104 },
            { date: '2024-11-26', count: 92 },
            { date: '2024-11-27', count: 119 },
            { date: '2024-11-28', count: 142 },
            { date: '2024-11-29', count: 134 },
            { date: '2024-11-30', count: 156 },
            { date: '2024-12-01', count: 167 },
            { date: '2024-12-02', count: 145 },
            { date: '2024-12-03', count: 178 },
            { date: '2024-12-04', count: 162 },
            { date: '2024-12-05', count: 149 },
            { date: '2024-12-06', count: 136 },
            { date: '2024-12-07', count: 153 },
            { date: '2024-12-08', count: 147 },
            { date: '2024-12-09', count: 141 },
            { date: '2024-12-10', count: 158 },
            { date: '2024-12-11', count: 172 },
            { date: '2024-12-12', count: 165 },
            { date: '2024-12-13', count: 169 },
            { date: '2024-12-14', count: 154 }
        ],
        revenue: [
            { date: '2024-11-15', amount: 8940.00 },
            { date: '2024-11-16', amount: 6780.00 },
            { date: '2024-11-17', amount: 12340.00 },
            { date: '2024-11-18', amount: 9560.00 },
            { date: '2024-11-19', amount: 13780.00 },
            { date: '2024-11-20', amount: 15670.00 },
            { date: '2024-11-21', amount: 14230.00 },
            { date: '2024-11-22', amount: 10890.00 },
            { date: '2024-11-23', amount: 12450.00 },
            { date: '2024-11-24', amount: 8760.00 },
            { date: '2024-11-25', amount: 11340.00 },
            { date: '2024-11-26', amount: 9230.00 },
            { date: '2024-11-27', amount: 13560.00 },
            { date: '2024-11-28', amount: 16780.00 },
            { date: '2024-11-29', amount: 15490.00 },
            { date: '2024-11-30', amount: 18230.00 },
            { date: '2024-12-01', amount: 19670.00 },
            { date: '2024-12-02', amount: 16890.00 },
            { date: '2024-12-03', amount: 21340.00 },
            { date: '2024-12-04', amount: 18560.00 },
            { date: '2024-12-05', amount: 16790.00 },
            { date: '2024-12-06', amount: 14560.00 },
            { date: '2024-12-07', amount: 17890.00 },
            { date: '2024-12-08', amount: 16340.00 },
            { date: '2024-12-09', amount: 15670.00 },
            { date: '2024-12-10', amount: 18230.00 },
            { date: '2024-12-11', amount: 20890.00 },
            { date: '2024-12-12', amount: 19450.00 },
            { date: '2024-12-13', amount: 20120.00 },
            { date: '2024-12-14', amount: 17890.00 }
        ],
        courseCreations: [
            { date: '2024-11-15', count: 1 },
            { date: '2024-11-18', count: 1 },
            { date: '2024-11-22', count: 2 },
            { date: '2024-11-25', count: 1 },
            { date: '2024-11-29', count: 1 },
            { date: '2024-12-02', count: 2 },
            { date: '2024-12-05', count: 1 },
            { date: '2024-12-08', count: 1 },
            { date: '2024-12-11', count: 1 },
            { date: '2024-12-14', count: 2 }
        ]
    },
    '90d': {
        userRegistrations: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 40) + 15
        })),
        enrollments: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 120) + 80
        })),
        revenue: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 15000) + 8000
        })),
        courseCreations: Array.from({ length: 90 }, (_, i) => ({
            date: new Date(Date.now() - (89 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.random() > 0.8 ? Math.floor(Math.random() * 3) + 1 : 0
        }))
    },
    '1y': {
        userRegistrations: Array.from({ length: 365 }, (_, i) => ({
            date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 50) + 10
        })),
        enrollments: Array.from({ length: 365 }, (_, i) => ({
            date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.floor(Math.random() * 150) + 70
        })),
        revenue: Array.from({ length: 365 }, (_, i) => ({
            date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            amount: Math.floor(Math.random() * 20000) + 5000
        })),
        courseCreations: Array.from({ length: 365 }, (_, i) => ({
            date: new Date(Date.now() - (364 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            count: Math.random() > 0.9 ? Math.floor(Math.random() * 4) + 1 : 0
        }))
    }
};
//# sourceMappingURL=realistic-data.js.map