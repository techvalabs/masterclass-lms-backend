import Joi from 'joi';
import { Request, Response, NextFunction } from 'express';
import { ValidationError, asyncHandler } from '../utils/errors.js';

/**
 * Validation middleware factory
 */
export const validate = (schema: {
  body?: Joi.ObjectSchema;
  query?: Joi.ObjectSchema;
  params?: Joi.ObjectSchema;
  headers?: Joi.ObjectSchema;
}) => {
  return asyncHandler(async (req: Request, res: Response, next: NextFunction) => {
    const errors: Array<{ field: string; message: string; code?: string }> = [];

    // Validate body
    if (schema.body) {
      const { error } = schema.body.validate(req.body, { 
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });
      
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          code: detail.type
        })));
      } else if (schema.body) {
        // Strip unknown fields from body
        req.body = schema.body.validate(req.body, { stripUnknown: true }).value;
      }
    }

    // Validate query parameters
    if (schema.query) {
      const { error } = schema.query.validate(req.query, { 
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });
      
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `query.${detail.path.join('.')}`,
          message: detail.message,
          code: detail.type
        })));
      } else if (schema.query) {
        // Strip unknown fields from query
        req.query = schema.query.validate(req.query, { stripUnknown: true }).value;
      }
    }

    // Validate path parameters
    if (schema.params) {
      const { error } = schema.params.validate(req.params, { 
        abortEarly: false,
        allowUnknown: false,
        stripUnknown: true
      });
      
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `params.${detail.path.join('.')}`,
          message: detail.message,
          code: detail.type
        })));
      }
    }

    // Validate headers
    if (schema.headers) {
      const { error } = schema.headers.validate(req.headers, { 
        abortEarly: false,
        allowUnknown: true
      });
      
      if (error) {
        errors.push(...error.details.map(detail => ({
          field: `headers.${detail.path.join('.')}`,
          message: detail.message,
          code: detail.type
        })));
      }
    }

    if (errors.length > 0) {
      throw new ValidationError('Validation failed', errors);
    }

    next();
  });
};

/**
 * Common validation schemas
 */
export const CommonValidation = {
  // Pagination
  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(10),
    sortBy: Joi.string().optional(),
    sortOrder: Joi.string().valid('asc', 'desc').default('asc')
  }),

  // ID parameter
  id: Joi.object({
    id: Joi.number().integer().positive().required()
  }),

  // Slug parameter
  slug: Joi.object({
    slug: Joi.string().pattern(/^[a-z0-9]+(?:-[a-z0-9]+)*$/).required()
  }),

  // Email
  email: Joi.string().email().lowercase().trim().max(255),

  // Password
  password: Joi.string().min(8).max(128).pattern(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*(),.?":{}|<>])/
  ).message('Password must contain at least one lowercase letter, one uppercase letter, one number, and one special character'),

  // Name
  name: Joi.string().trim().min(2).max(100),

  // Phone
  phone: Joi.string().pattern(/^\+?[1-9]\d{1,14}$/).optional(),

  // URL
  url: Joi.string().uri().optional(),

  // Date
  date: Joi.date().iso(),

  // JSON field
  json: Joi.alternatives().try(
    Joi.string().custom((value, helpers) => {
      try {
        return JSON.parse(value);
      } catch (error) {
        return helpers.error('any.invalid');
      }
    }),
    Joi.object(),
    Joi.array()
  ).optional()
};

// Add search validation after CommonValidation is defined
CommonValidation.search = Joi.object({
  q: Joi.string().trim().min(1).max(255).required(),
  category: Joi.string().optional(),
  level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional(),
  minPrice: Joi.number().min(0).optional(),
  maxPrice: Joi.number().min(0).optional(),
  rating: Joi.number().min(0).max(5).optional()
}).concat(CommonValidation.pagination);

/**
 * Authentication validation schemas
 */
export const AuthValidation = {
  register: {
    body: Joi.object({
      email: CommonValidation.email.required(),
      password: CommonValidation.password.required(),
      firstName: CommonValidation.name.required(),
      lastName: CommonValidation.name.required(),
      role: Joi.string().valid('student', 'instructor').default('student'),
      phone: CommonValidation.phone,
      dateOfBirth: Joi.date().max('now').optional(),
      agreeToTerms: Joi.boolean().valid(true).optional()
    })
  },

  login: {
    body: Joi.object({
      email: CommonValidation.email.required(),
      password: Joi.string().min(1).required(),
      remember_me: Joi.boolean().default(false)
    })
  },

  refreshToken: {
    body: Joi.object({
      refresh_token: Joi.string().required()
    })
  },

  forgotPassword: {
    body: Joi.object({
      email: CommonValidation.email.required()
    })
  },

  resetPassword: {
    body: Joi.object({
      token: Joi.string().required(),
      password: CommonValidation.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref('password')).required()
    })
  },

  changePassword: {
    body: Joi.object({
      currentPassword: Joi.string().required(),
      newPassword: CommonValidation.password.required(),
      confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
    })
  },

  verifyEmail: {
    body: Joi.object({
      token: Joi.string().required()
    })
  },

  promoteToAdmin: {
    body: Joi.object({
      email: CommonValidation.email.required()
    })
  },

  resetUserPassword: {
    body: Joi.object({
      email: CommonValidation.email.required(),
      newPassword: CommonValidation.password.required()
    })
  }
};

/**
 * User validation schemas
 */
export const UserValidation = {
  updateProfile: {
    body: Joi.object({
      name: CommonValidation.name.optional(),
      phone: CommonValidation.phone,
      dateOfBirth: Joi.date().max('now').optional(),
      bio: Joi.string().max(1000).optional(),
      location: Joi.string().max(255).optional(),
      website: CommonValidation.url,
      socialLinks: Joi.object({
        linkedin: CommonValidation.url,
        twitter: CommonValidation.url,
        facebook: CommonValidation.url,
        instagram: CommonValidation.url
      }).optional()
    })
  },

  updatePreferences: {
    body: Joi.object({
      emailNotifications: Joi.boolean().default(true),
      pushNotifications: Joi.boolean().default(true),
      marketingEmails: Joi.boolean().default(false),
      weeklyDigest: Joi.boolean().default(true),
      language: Joi.string().valid('en', 'es', 'fr', 'de').default('en'),
      timezone: Joi.string().optional()
    })
  },

  getUserById: {
    params: CommonValidation.id
  },

  getAllUsers: {
    query: Joi.object({
      role: Joi.string().valid('student', 'instructor', 'admin').optional(),
      verified: Joi.boolean().optional(),
      active: Joi.boolean().optional(),
      search: Joi.string().trim().min(1).max(255).optional()
    }).concat(CommonValidation.pagination)
  }
};

/**
 * Course validation schemas
 */
export const CourseValidation = {
  createCourse: {
    body: Joi.object({
      title: Joi.string().trim().min(5).max(255).required(),
      description: Joi.string().trim().min(50).max(5000).required(),
      shortDescription: Joi.string().trim().max(500).optional(),
      categoryId: Joi.number().integer().positive().required(),
      price: Joi.number().min(0).max(10000).precision(2).default(0),
      originalPrice: Joi.number().min(0).max(10000).precision(2).optional(),
      level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
      language: Joi.string().valid('en', 'es', 'fr', 'de').default('en'),
      tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
      learningOutcomes: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      requirements: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      targetAudience: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      features: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      metaTitle: Joi.string().max(255).optional(),
      metaDescription: Joi.string().max(500).optional()
    })
  },

  updateCourse: {
    params: CommonValidation.id,
    body: Joi.object({
      title: Joi.string().trim().min(5).max(255).optional(),
      description: Joi.string().trim().min(50).max(5000).optional(),
      shortDescription: Joi.string().trim().max(500).optional(),
      categoryId: Joi.number().integer().positive().optional(),
      price: Joi.number().min(0).max(10000).precision(2).optional(),
      originalPrice: Joi.number().min(0).max(10000).precision(2).optional(),
      level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional(),
      language: Joi.string().valid('en', 'es', 'fr', 'de').optional(),
      tags: Joi.array().items(Joi.string().trim().max(50)).max(10).optional(),
      learningOutcomes: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      requirements: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      targetAudience: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      features: Joi.array().items(Joi.string().trim().max(255)).max(10).optional(),
      isPublished: Joi.boolean().optional(),
      isFeatured: Joi.boolean().optional(),
      metaTitle: Joi.string().max(255).optional(),
      metaDescription: Joi.string().max(500).optional()
    })
  },

  getCourseById: {
    params: CommonValidation.id
  },

  getCourseBySlug: {
    params: CommonValidation.slug
  },

  getAllCourses: {
    query: Joi.object({
      category: Joi.string().optional(),
      level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional(),
      minPrice: Joi.number().min(0).optional(),
      maxPrice: Joi.number().min(0).optional(),
      rating: Joi.number().min(0).max(5).optional(),
      featured: Joi.boolean().optional(),
      published: Joi.boolean().optional(),
      instructor: Joi.string().optional(),
      search: Joi.string().trim().min(1).max(255).optional()
    }).concat(CommonValidation.pagination)
  },

  enrollCourse: {
    params: CommonValidation.id,
    body: Joi.object({
      paymentMethod: Joi.string().valid('free', 'stripe', 'paypal').default('free'),
      paymentToken: Joi.string().when('paymentMethod', {
        is: Joi.not('free'),
        then: Joi.required(),
        otherwise: Joi.optional()
      })
    })
  }
};

/**
 * Lesson validation schemas
 */
export const LessonValidation = {
  createLesson: {
    body: Joi.object({
      moduleId: Joi.number().integer().positive().required(),
      title: Joi.string().trim().min(3).max(255).required(),
      description: Joi.string().trim().max(1000).optional(),
      content: Joi.string().optional(),
      videoUrl: CommonValidation.url,
      videoDuration: Joi.number().integer().min(0).optional(),
      transcript: Joi.string().optional(),
      notes: Joi.string().optional(),
      sortOrder: Joi.number().integer().min(0).default(0),
      isPreview: Joi.boolean().default(false),
      canDownload: Joi.boolean().default(false)
    })
  },

  updateLesson: {
    params: CommonValidation.id,
    body: Joi.object({
      title: Joi.string().trim().min(3).max(255).optional(),
      description: Joi.string().trim().max(1000).optional(),
      content: Joi.string().optional(),
      videoUrl: CommonValidation.url,
      videoDuration: Joi.number().integer().min(0).optional(),
      transcript: Joi.string().optional(),
      notes: Joi.string().optional(),
      sortOrder: Joi.number().integer().min(0).optional(),
      isPreview: Joi.boolean().optional(),
      isPublished: Joi.boolean().optional(),
      canDownload: Joi.boolean().optional()
    })
  },

  getLessonById: {
    params: CommonValidation.id
  },

  updateProgress: {
    params: CommonValidation.id,
    body: Joi.object({
      watchTimeSeconds: Joi.number().integer().min(0).required(),
      completionPercentage: Joi.number().min(0).max(100).precision(2).required(),
      lastPositionSeconds: Joi.number().integer().min(0).optional(),
      completed: Joi.boolean().optional(),
      notes: Joi.string().max(1000).optional(),
      bookmarks: Joi.array().items(
        Joi.object({
          timeSeconds: Joi.number().integer().min(0).required(),
          title: Joi.string().trim().max(255).required(),
          note: Joi.string().max(500).optional()
        })
      ).optional()
    })
  }
};

/**
 * Quiz validation schemas
 */
export const QuizValidation = {
  createQuiz: {
    body: Joi.object({
      lessonId: Joi.number().integer().positive().optional(),
      courseId: Joi.number().integer().positive().optional(),
      title: Joi.string().trim().min(3).max(255).required(),
      description: Joi.string().trim().max(1000).optional(),
      instructions: Joi.string().trim().max(2000).optional(),
      timeLimit: Joi.number().integer().min(0).optional(),
      passingScore: Joi.number().integer().min(0).max(100).default(70),
      maxAttempts: Joi.number().integer().min(-1).default(-1), // -1 means unlimited
      randomizeQuestions: Joi.boolean().default(false),
      showResults: Joi.boolean().default(true),
      allowReview: Joi.boolean().default(true)
    })
  },

  submitQuizAttempt: {
    params: CommonValidation.id,
    body: Joi.object({
      answers: Joi.object().pattern(
        Joi.number().integer().positive(),
        Joi.alternatives().try(
          Joi.string().trim().max(1000),
          Joi.array().items(Joi.string().trim().max(255)),
          Joi.boolean()
        )
      ).required(),
      timeSpentSeconds: Joi.number().integer().min(0).required()
    })
  },

  getQuizById: {
    params: CommonValidation.id
  }
};

/**
 * File upload validation
 */
export const FileValidation = {
  uploadImage: {
    body: Joi.object({
      type: Joi.string().valid('avatar', 'course_thumbnail', 'lesson_image').required(),
      entityId: Joi.number().integer().positive().optional()
    })
  },

  uploadVideo: {
    body: Joi.object({
      lessonId: Joi.number().integer().positive().required(),
      title: Joi.string().trim().max(255).optional()
    })
  },

  uploadDocument: {
    body: Joi.object({
      lessonId: Joi.number().integer().positive().required(),
      title: Joi.string().trim().max(255).required(),
      description: Joi.string().trim().max(500).optional()
    })
  }
};

/**
 * Review validation schemas
 */
export const ReviewValidation = {
  createReview: {
    params: CommonValidation.id, // course ID
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      reviewTitle: Joi.string().trim().max(255).optional(),
      reviewText: Joi.string().trim().max(2000).optional(),
      pros: Joi.array().items(Joi.string().trim().max(255)).max(5).optional(),
      cons: Joi.array().items(Joi.string().trim().max(255)).max(5).optional(),
      isRecommended: Joi.boolean().default(true)
    })
  },

  updateReview: {
    params: CommonValidation.id,
    body: Joi.object({
      rating: Joi.number().integer().min(1).max(5).optional(),
      reviewTitle: Joi.string().trim().max(255).optional(),
      reviewText: Joi.string().trim().max(2000).optional(),
      pros: Joi.array().items(Joi.string().trim().max(255)).max(5).optional(),
      cons: Joi.array().items(Joi.string().trim().max(255)).max(5).optional(),
      isRecommended: Joi.boolean().optional()
    })
  },

  getReviewById: {
    params: CommonValidation.id
  },

  getCourseReviews: {
    params: CommonValidation.id, // course ID
    query: Joi.object({
      rating: Joi.number().integer().min(1).max(5).optional(),
      verified: Joi.boolean().optional(),
      sortBy: Joi.string().valid('date', 'rating', 'helpful').default('date')
    }).concat(CommonValidation.pagination)
  }
};

// Helper validation functions for route parameters
export const validateBody = (schema: Joi.ObjectSchema) => {
  return validate({ body: schema });
};

export const validateQuery = (schema: Joi.ObjectSchema) => {
  return validate({ query: schema });
};

export const validateUuidParam = (paramName: string) => {
  const schema = Joi.object({
    [paramName]: Joi.alternatives().try(
      Joi.string().guid({ version: 'uuidv4' }),
      Joi.number().integer().positive()
    ).required()
  });
  return validate({ params: schema });
};

export const validatePagination = validate({ 
  query: CommonValidation.pagination 
});

// Course schemas for route validation
export const courseSchemas = {
  browse: Joi.object({
    q: Joi.string().trim().min(1).max(255).optional(),
    category: Joi.string().optional(),
    level: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').optional(),
    minPrice: Joi.number().min(0).optional(),
    maxPrice: Joi.number().min(0).optional(),
    rating: Joi.number().min(0).max(5).optional()
  }).concat(CommonValidation.pagination),
  search: CommonValidation.search,
  create: CourseValidation.createCourse.body,
  update: CourseValidation.updateCourse.body
};

// Auth middleware functions (placeholders)
export const optionalAuthMiddleware = (req: any, res: any, next: any) => {
  // Add user to request if token exists but don't require it
  next();
};

export const requireInstructorOrAdmin = (req: any, res: any, next: any) => {
  // Check if user is instructor or admin
  next();
};

export const requireAdmin = (req: any, res: any, next: any) => {
  // Check if user is admin
  next();
};

export const requireCourseAccess = (req: any, res: any, next: any) => {
  // Check if user has access to the course
  next();
};

// File validation middleware
export const validateFileUpload = (allowedTypes: string[], maxSize: number) => {
  return (req: any, res: any, next: any) => {
    // Validate file type and size
    next();
  };
};

export default {
  validate,
  CommonValidation,
  AuthValidation,
  UserValidation,
  CourseValidation,
  LessonValidation,
  QuizValidation,
  FileValidation,
  ReviewValidation,
  validateBody,
  validateQuery,
  validateUuidParam,
  validatePagination,
  courseSchemas
};