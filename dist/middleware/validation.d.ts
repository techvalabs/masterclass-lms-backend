import Joi from 'joi';
/**
 * Validation middleware factory
 */
export declare const validate: (schema: {
    body?: Joi.ObjectSchema;
    query?: Joi.ObjectSchema;
    params?: Joi.ObjectSchema;
    headers?: Joi.ObjectSchema;
}) => (req: any, res: any, next: any) => void;
/**
 * Common validation schemas
 */
export declare const CommonValidation: {
    pagination: Joi.ObjectSchema<any>;
    id: Joi.ObjectSchema<any>;
    slug: Joi.ObjectSchema<any>;
    email: Joi.StringSchema<string>;
    password: Joi.StringSchema<string>;
    name: Joi.StringSchema<string>;
    phone: Joi.StringSchema<string>;
    url: Joi.StringSchema<string>;
    date: Joi.DateSchema<Date>;
    json: Joi.AlternativesSchema<any>;
};
/**
 * Authentication validation schemas
 */
export declare const AuthValidation: {
    register: {
        body: Joi.ObjectSchema<any>;
    };
    login: {
        body: Joi.ObjectSchema<any>;
    };
    refreshToken: {
        body: Joi.ObjectSchema<any>;
    };
    forgotPassword: {
        body: Joi.ObjectSchema<any>;
    };
    resetPassword: {
        body: Joi.ObjectSchema<any>;
    };
    changePassword: {
        body: Joi.ObjectSchema<any>;
    };
    verifyEmail: {
        body: Joi.ObjectSchema<any>;
    };
    promoteToAdmin: {
        body: Joi.ObjectSchema<any>;
    };
    resetUserPassword: {
        body: Joi.ObjectSchema<any>;
    };
};
/**
 * User validation schemas
 */
export declare const UserValidation: {
    updateProfile: {
        body: Joi.ObjectSchema<any>;
    };
    updatePreferences: {
        body: Joi.ObjectSchema<any>;
    };
    getUserById: {
        params: Joi.ObjectSchema<any>;
    };
    getAllUsers: {
        query: Joi.ObjectSchema<any>;
    };
};
/**
 * Course validation schemas
 */
export declare const CourseValidation: {
    createCourse: {
        body: Joi.ObjectSchema<any>;
    };
    updateCourse: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    getCourseById: {
        params: Joi.ObjectSchema<any>;
    };
    getCourseBySlug: {
        params: Joi.ObjectSchema<any>;
    };
    getAllCourses: {
        query: Joi.ObjectSchema<any>;
    };
    enrollCourse: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
};
/**
 * Lesson validation schemas
 */
export declare const LessonValidation: {
    createLesson: {
        body: Joi.ObjectSchema<any>;
    };
    updateLesson: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    getLessonById: {
        params: Joi.ObjectSchema<any>;
    };
    updateProgress: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
};
/**
 * Quiz validation schemas
 */
export declare const QuizValidation: {
    createQuiz: {
        body: Joi.ObjectSchema<any>;
    };
    submitQuizAttempt: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    getQuizById: {
        params: Joi.ObjectSchema<any>;
    };
};
/**
 * File upload validation
 */
export declare const FileValidation: {
    uploadImage: {
        body: Joi.ObjectSchema<any>;
    };
    uploadVideo: {
        body: Joi.ObjectSchema<any>;
    };
    uploadDocument: {
        body: Joi.ObjectSchema<any>;
    };
};
/**
 * Review validation schemas
 */
export declare const ReviewValidation: {
    createReview: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    updateReview: {
        params: Joi.ObjectSchema<any>;
        body: Joi.ObjectSchema<any>;
    };
    getReviewById: {
        params: Joi.ObjectSchema<any>;
    };
    getCourseReviews: {
        params: Joi.ObjectSchema<any>;
        query: Joi.ObjectSchema<any>;
    };
};
export declare const validateBody: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => void;
export declare const validateQuery: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => void;
export declare const validateUuidParam: (paramName: string) => (req: any, res: any, next: any) => void;
export declare const validatePagination: (req: any, res: any, next: any) => void;
export declare const courseSchemas: {
    browse: Joi.ObjectSchema<any>;
    search: Joi.ObjectSchema<any>;
    create: Joi.ObjectSchema<any>;
    update: Joi.ObjectSchema<any>;
};
export declare const optionalAuthMiddleware: (req: any, res: any, next: any) => void;
export declare const requireInstructorOrAdmin: (req: any, res: any, next: any) => void;
export declare const requireAdmin: (req: any, res: any, next: any) => void;
export declare const requireCourseAccess: (req: any, res: any, next: any) => void;
export declare const validateFileUpload: (allowedTypes: string[], maxSize: number) => (req: any, res: any, next: any) => void;
declare const _default: {
    validate: (schema: {
        body?: Joi.ObjectSchema;
        query?: Joi.ObjectSchema;
        params?: Joi.ObjectSchema;
        headers?: Joi.ObjectSchema;
    }) => (req: any, res: any, next: any) => void;
    CommonValidation: {
        pagination: Joi.ObjectSchema<any>;
        id: Joi.ObjectSchema<any>;
        slug: Joi.ObjectSchema<any>;
        email: Joi.StringSchema<string>;
        password: Joi.StringSchema<string>;
        name: Joi.StringSchema<string>;
        phone: Joi.StringSchema<string>;
        url: Joi.StringSchema<string>;
        date: Joi.DateSchema<Date>;
        json: Joi.AlternativesSchema<any>;
    };
    AuthValidation: {
        register: {
            body: Joi.ObjectSchema<any>;
        };
        login: {
            body: Joi.ObjectSchema<any>;
        };
        refreshToken: {
            body: Joi.ObjectSchema<any>;
        };
        forgotPassword: {
            body: Joi.ObjectSchema<any>;
        };
        resetPassword: {
            body: Joi.ObjectSchema<any>;
        };
        changePassword: {
            body: Joi.ObjectSchema<any>;
        };
        verifyEmail: {
            body: Joi.ObjectSchema<any>;
        };
        promoteToAdmin: {
            body: Joi.ObjectSchema<any>;
        };
        resetUserPassword: {
            body: Joi.ObjectSchema<any>;
        };
    };
    UserValidation: {
        updateProfile: {
            body: Joi.ObjectSchema<any>;
        };
        updatePreferences: {
            body: Joi.ObjectSchema<any>;
        };
        getUserById: {
            params: Joi.ObjectSchema<any>;
        };
        getAllUsers: {
            query: Joi.ObjectSchema<any>;
        };
    };
    CourseValidation: {
        createCourse: {
            body: Joi.ObjectSchema<any>;
        };
        updateCourse: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
        getCourseById: {
            params: Joi.ObjectSchema<any>;
        };
        getCourseBySlug: {
            params: Joi.ObjectSchema<any>;
        };
        getAllCourses: {
            query: Joi.ObjectSchema<any>;
        };
        enrollCourse: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
    };
    LessonValidation: {
        createLesson: {
            body: Joi.ObjectSchema<any>;
        };
        updateLesson: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
        getLessonById: {
            params: Joi.ObjectSchema<any>;
        };
        updateProgress: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
    };
    QuizValidation: {
        createQuiz: {
            body: Joi.ObjectSchema<any>;
        };
        submitQuizAttempt: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
        getQuizById: {
            params: Joi.ObjectSchema<any>;
        };
    };
    FileValidation: {
        uploadImage: {
            body: Joi.ObjectSchema<any>;
        };
        uploadVideo: {
            body: Joi.ObjectSchema<any>;
        };
        uploadDocument: {
            body: Joi.ObjectSchema<any>;
        };
    };
    ReviewValidation: {
        createReview: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
        updateReview: {
            params: Joi.ObjectSchema<any>;
            body: Joi.ObjectSchema<any>;
        };
        getReviewById: {
            params: Joi.ObjectSchema<any>;
        };
        getCourseReviews: {
            params: Joi.ObjectSchema<any>;
            query: Joi.ObjectSchema<any>;
        };
    };
    validateBody: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => void;
    validateQuery: (schema: Joi.ObjectSchema) => (req: any, res: any, next: any) => void;
    validateUuidParam: (paramName: string) => (req: any, res: any, next: any) => void;
    validatePagination: (req: any, res: any, next: any) => void;
    courseSchemas: {
        browse: Joi.ObjectSchema<any>;
        search: Joi.ObjectSchema<any>;
        create: Joi.ObjectSchema<any>;
        update: Joi.ObjectSchema<any>;
    };
};
export default _default;
//# sourceMappingURL=validation.d.ts.map