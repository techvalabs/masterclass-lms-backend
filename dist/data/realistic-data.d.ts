/**
 * Realistic Data for Real Estate Masterclass LMS
 * Based on industry-standard LMS patterns from Canvas and educational best practices
 */
export interface RealisticUser {
    id: number;
    name: string;
    email: string;
    role: 'student' | 'instructor' | 'admin';
    roleId: number;
    isActive: boolean;
    isVerified: boolean;
    lastLogin: string;
    createdAt: string;
    updatedAt: string;
    avatar: string | null;
    bio?: string;
    phone?: string;
    location?: string;
    experience?: string;
    specialties?: string[];
    enrollmentCount?: number;
    completedCourses?: number;
    totalSpent?: number;
    certifications?: string[];
}
export interface RealisticCourse {
    id: number;
    title: string;
    slug: string;
    description: string;
    shortDescription: string;
    thumbnail: string;
    previewVideo?: string;
    price: number;
    originalPrice?: number;
    currency: string;
    level: 'Beginner' | 'Intermediate' | 'Advanced';
    duration: {
        hours: number;
        minutes: number;
        total: number;
    };
    language: string;
    tags: string[];
    learningOutcomes: string[];
    requirements: string[];
    targetAudience: string[];
    features: string[];
    rating: number;
    totalRatings: number;
    totalStudents: number;
    totalLessons: number;
    isPublished: boolean;
    isFeatured: boolean;
    isFree: boolean;
    publishDate: string;
    createdAt: string;
    updatedAt: string;
    instructor: {
        id: number;
        name: string;
        email: string;
        bio?: string;
        avatar?: string;
        specialties?: string[];
        experience?: string;
    };
    category: {
        id: number;
        name: string;
        slug?: string;
    };
    modules?: RealisticModule[];
    stats: {
        activeEnrollments: number;
        completions: number;
        totalRevenue: number;
        completionRate: number;
        averageRating?: number;
        reviewCount?: number;
    };
}
export interface RealisticModule {
    id: number;
    title: string;
    description: string;
    sortOrder: number;
    durationSeconds: number;
    isPublished: boolean;
    lessons: RealisticLesson[];
}
export interface RealisticLesson {
    id: number;
    moduleId: number;
    title: string;
    description: string;
    videoUrl?: string;
    videoDuration?: number;
    sortOrder: number;
    isPreview: boolean;
    isPublished: boolean;
    viewCount: number;
    resourceCount: number;
}
export interface RealisticTransaction {
    id: number;
    userId: number;
    courseId: number;
    orderId: string;
    transactionId: string;
    paymentMethod: 'stripe' | 'paypal' | 'square' | 'bank_transfer';
    paymentProviderId: string;
    amount: number;
    currency: string;
    feeAmount: number;
    netAmount: number;
    status: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
    paymentDate: string;
    description: string;
    metadata?: any;
    gatewayResponse?: any;
    createdAt: string;
    updatedAt: string;
    user?: {
        name: string;
        email: string;
    };
    course?: {
        title: string;
        price: number;
    };
    refunds: {
        count: number;
        amount: number;
    };
}
export interface RealisticSettings {
    [category: string]: {
        [key: string]: {
            value: any;
            type: 'string' | 'number' | 'boolean' | 'json';
            description: string;
        };
    };
}
export declare const realisticUsers: RealisticUser[];
export declare const realisticCourses: RealisticCourse[];
export declare const realisticTransactions: RealisticTransaction[];
export declare const realisticSettings: RealisticSettings;
export declare const realisticDashboardStats: {
    users: {
        total: number;
        new30d: number;
        growth: string;
    };
    courses: {
        total: number;
        new30d: number;
        growth: string;
    };
    enrollments: {
        total: number;
        new30d: number;
        growth: string;
    };
    revenue: {
        total: number;
        month30d: number;
        growth: string;
    };
    transactions: {
        total: number;
        new30d: number;
        growth: string;
    };
    avgRating: number;
    newReviews30d: number;
};
export declare const realisticAnalytics: {
    '7d': {
        userRegistrations: {
            date: string;
            count: number;
        }[];
        enrollments: {
            date: string;
            count: number;
        }[];
        revenue: {
            date: string;
            amount: number;
        }[];
        courseCreations: {
            date: string;
            count: number;
        }[];
    };
    '30d': {
        userRegistrations: {
            date: string;
            count: number;
        }[];
        enrollments: {
            date: string;
            count: number;
        }[];
        revenue: {
            date: string;
            amount: number;
        }[];
        courseCreations: {
            date: string;
            count: number;
        }[];
    };
    '90d': {
        userRegistrations: {
            date: string;
            count: number;
        }[];
        enrollments: {
            date: string;
            count: number;
        }[];
        revenue: {
            date: string;
            amount: number;
        }[];
        courseCreations: {
            date: string;
            count: number;
        }[];
    };
    '1y': {
        userRegistrations: {
            date: string;
            count: number;
        }[];
        enrollments: {
            date: string;
            count: number;
        }[];
        revenue: {
            date: string;
            amount: number;
        }[];
        courseCreations: {
            date: string;
            count: number;
        }[];
    };
};
//# sourceMappingURL=realistic-data.d.ts.map