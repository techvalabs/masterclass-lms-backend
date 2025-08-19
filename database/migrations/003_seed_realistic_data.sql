-- ===========================================
-- Real Estate Masterclass LMS Realistic Seed Data
-- Migration: 003_seed_realistic_data.sql
-- ===========================================
-- Purpose: Populate database with realistic development/testing data
-- Note: This script creates comprehensive sample data for development and testing purposes
-- ===========================================

-- Disable foreign key checks for smooth data insertion
SET FOREIGN_KEY_CHECKS = 0;

-- ===========================================
-- ADDITIONAL USERS (Students and Instructors)
-- ===========================================

-- Insert additional student users
INSERT INTO users (id, name, email, password_hash, role_id, email_verified, email_verified_at, is_active, bio, location, phone, avatar, created_at, updated_at) VALUES
(4, 'Michael Thompson', 'michael.thompson@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE, 'Former software engineer transitioning into real estate investment. Interested in buy-and-hold strategies.', 'Austin, TX', '+1-512-555-0123', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(5, 'Jennifer Davis', 'jennifer.davis@outlook.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), TRUE, 'Marketing professional looking to diversify income through real estate. Focus on rental properties.', 'Denver, CO', '+1-303-555-0456', 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(6, 'David Rodriguez', 'david.rodriguez@yahoo.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), TRUE, 'Recent college graduate interested in learning about real estate wholesaling and flipping.', 'Phoenix, AZ', '+1-602-555-0789', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150', DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(7, 'Emily Wilson', 'emily.wilson@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), TRUE, 'Nurse practitioner seeking passive income through real estate investment. Interested in multifamily properties.', 'Seattle, WA', '+1-206-555-0321', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150', DATE_SUB(NOW(), INTERVAL 25 DAY), NOW()),
(8, 'James Anderson', 'james.anderson@icloud.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, 'Retired teacher with savings to invest. Looking to learn conservative real estate strategies.', 'Tampa, FL', '+1-813-555-0654', 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150', DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(9, 'Lisa Chen', 'lisa.chen@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), TRUE, 'Financial advisor who wants to better understand real estate as an investment vehicle for clients.', 'San Francisco, CA', '+1-415-555-0987', 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150', DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(10, 'Robert Brown', 'robert.brown@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), TRUE, 'Small business owner interested in commercial real estate investment opportunities.', 'Chicago, IL', '+1-312-555-0147', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150', DATE_SUB(NOW(), INTERVAL 21 DAY), NOW()),
(11, 'Amanda Taylor', 'amanda.taylor@hotmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, FALSE, NULL, TRUE, 'Recent MBA graduate looking to apply financial knowledge to real estate investing.', 'Boston, MA', '+1-617-555-0258', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150', DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(12, 'Kevin Martinez', 'kevin.martinez@gmail.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY), TRUE, 'Construction worker with hands-on experience, wants to learn the business side of real estate.', 'Las Vegas, NV', '+1-702-555-0369', 'https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150', DATE_SUB(NOW(), INTERVAL 16 DAY), NOW()),
(13, 'Nicole Johnson', 'nicole.johnson@yahoo.com', '$2b$12$9R6k8UG0o.Ys7XnLzZeW9P1H2sC4tR5Y6gI8jL9mN0kO1pQ3rS2vX', 1, TRUE, DATE_SUB(NOW(), INTERVAL 9 DAY), TRUE, 'Real estate agent wanting to transition from sales to investment.', 'Miami, FL', '+1-305-555-0741', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150', DATE_SUB(NOW(), INTERVAL 11 DAY), NOW());

-- Insert additional instructor users
INSERT INTO users (id, name, email, password_hash, role_id, email_verified, email_verified_at, is_active, bio, location, phone, website, avatar, created_at, updated_at) VALUES
(14, 'Dr. Patricia Williams', 'patricia.williams@realestate-pro.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), TRUE, 'PhD in Economics with 20+ years in commercial real estate. Former VP at major REIT, now full-time educator and investor.', 'Atlanta, GA', '+1-404-555-0182', 'https://patriciawilliams-re.com', 'https://images.unsplash.com/photo-1559586367-4c347d7dd3d6?w=150', DATE_SUB(NOW(), INTERVAL 90 DAY), NOW()),
(15, 'Mark Thompson', 'mark.thompson@flipmaster.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), TRUE, 'Professional house flipper with 300+ successful projects. Specializes in distressed property renovation and quick turnarounds.', 'Orlando, FL', '+1-407-555-0293', 'https://flipmaster-academy.com', 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150', DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
(16, 'Sarah Mitchell', 'sarah.mitchell@propertywealth.com', '$2b$12$8Q5i7TF9n.Xr6WmKzYdV8OoGhQlB2rT3H4YF7hN9vK1L3pQ5mE2nW', 2, TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), TRUE, 'Former Wall Street analyst turned real estate mogul. Built portfolio of 500+ rental units across 8 states.', 'Dallas, TX', '+1-214-555-0504', 'https://propertywealth.com', 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150', DATE_SUB(NOW(), INTERVAL 75 DAY), NOW());

-- Insert instructor profiles for new instructors
INSERT INTO instructors (id, user_id, experience, qualifications, certifications, specialties, hourly_rate, commission_rate, status, approved_at, approved_by, created_at, updated_at) VALUES
(2, 14, 'Over 20 years in commercial real estate investment and analysis. Former VP of Acquisitions at major REIT. PhD in Economics with focus on real estate markets. Has personally invested in $500M+ worth of commercial properties.', JSON_ARRAY(
    'PhD in Economics - Harvard University',
    'MBA in Finance - Wharton School',
    'Bachelor of Business Administration - University of Georgia',
    'Commercial Real Estate License - Georgia'
), JSON_ARRAY(
    'Certified Commercial Investment Member (CCIM)',
    'Certified Property Manager (CPM)',
    'Master of Real Estate Investment (MREI)',
    'Chartered Financial Analyst (CFA)'
), JSON_ARRAY(
    'Commercial Real Estate Analysis',
    'REIT Investment Strategies',
    'Real Estate Market Research',
    'Commercial Property Valuation',
    'Real Estate Economics',
    'Investment Portfolio Management'
), 250.00, 70.00, 'approved', DATE_SUB(NOW(), INTERVAL 45 DAY), 1, DATE_SUB(NOW(), INTERVAL 90 DAY), NOW()),

(3, 15, '12 years of professional house flipping experience with over 300 completed projects. Average profit margin of 25% per flip. Expertise in distressed property acquisition, renovation management, and quick market turnarounds.', JSON_ARRAY(
    'Bachelor of Construction Management - University of Central Florida',
    'Real Estate License - Florida',
    'Contractor License - Florida'
), JSON_ARRAY(
    'Certified Renovation Professional (CRP)',
    'National Association of Home Builders Member',
    'Real Estate Investment Association Member'
), JSON_ARRAY(
    'House Flipping Strategies',
    'Distressed Property Analysis',
    'Renovation Project Management',
    'Construction Cost Estimation',
    'Quick Sale Techniques',
    'Market Timing Strategies'
), 180.00, 65.00, 'approved', DATE_SUB(NOW(), INTERVAL 30 DAY), 1, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),

(4, 16, '15 years building rental property portfolio from scratch to 500+ units. Former Wall Street analyst with expertise in financial modeling and market analysis. Total portfolio value exceeds $100M with consistent 12%+ annual returns.', JSON_ARRAY(
    'MBA in Finance - Columbia Business School',
    'Bachelor of Economics - New York University',
    'Real Estate License - Texas'
), JSON_ARRAY(
    'Certified Property Manager (CPM)',
    'Real Estate Investment Advisor (REIA)',
    'Chartered Financial Analyst (CFA)',
    'National Association of Realtors Member'
), JSON_ARRAY(
    'Rental Property Investment',
    'Multi-family Property Analysis',
    'Real Estate Financial Modeling',
    'Property Management Systems',
    'Market Analysis & Research',
    'Investment Portfolio Scaling'
), 200.00, 68.00, 'approved', DATE_SUB(NOW(), INTERVAL 20 DAY), 1, DATE_SUB(NOW(), INTERVAL 75 DAY), NOW());

-- ===========================================
-- COURSE CATEGORIES
-- ===========================================

INSERT INTO course_categories (id, name, description, slug, icon, is_active, created_at, updated_at) VALUES
(1, 'Real Estate Fundamentals', 'Basic concepts and principles of real estate investing', 'real-estate-fundamentals', 'graduation-cap', TRUE, DATE_SUB(NOW(), INTERVAL 90 DAY), NOW()),
(2, 'Property Analysis', 'Learn to analyze properties for investment potential', 'property-analysis', 'chart-line', TRUE, DATE_SUB(NOW(), INTERVAL 85 DAY), NOW()),
(3, 'Fix and Flip', 'House flipping strategies and renovation management', 'fix-and-flip', 'hammer', TRUE, DATE_SUB(NOW(), INTERVAL 80 DAY), NOW()),
(4, 'Rental Properties', 'Buy and hold strategies for rental income', 'rental-properties', 'home', TRUE, DATE_SUB(NOW(), INTERVAL 75 DAY), NOW()),
(5, 'Commercial Real Estate', 'Commercial property investment and management', 'commercial-real-estate', 'building', TRUE, DATE_SUB(NOW(), INTERVAL 70 DAY), NOW()),
(6, 'Real Estate Finance', 'Financing strategies and investment mathematics', 'real-estate-finance', 'calculator', TRUE, DATE_SUB(NOW(), INTERVAL 65 DAY), NOW()),
(7, 'Wholesaling', 'Real estate wholesaling and contract assignment', 'wholesaling', 'handshake', TRUE, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW()),
(8, 'Property Management', 'Managing rental properties and tenant relations', 'property-management', 'users', TRUE, DATE_SUB(NOW(), INTERVAL 55 DAY), NOW());

-- ===========================================
-- REALISTIC COURSES
-- ===========================================

INSERT INTO courses (id, title, slug, description, thumbnail, video_url, price, currency, level, duration_hours, instructor_id, category_id, is_published, is_featured, course_objectives, course_requirements, target_audience, language, status, created_at, updated_at) VALUES

-- Course 1: Beginner's Guide to Real Estate Investing
(1, 'Complete Beginner''s Guide to Real Estate Investing', 'beginners-guide-real-estate-investing', 
'Master the fundamentals of real estate investing from the ground up. This comprehensive course covers everything from basic terminology to your first investment property. Learn about different investment strategies, how to analyze deals, financing options, and common pitfalls to avoid. Perfect for absolute beginners with no prior experience.',
'https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800', 
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
197.00, 'USD', 'beginner', 12, 1, 1, TRUE, TRUE,
JSON_ARRAY(
    'Understand the fundamentals of real estate investment',
    'Learn about different property types and investment strategies',
    'Master property analysis and deal evaluation techniques',
    'Understand financing options and how to get started with limited capital',
    'Develop a personal investment strategy and action plan'
),
JSON_ARRAY(
    'Basic understanding of personal finance',
    'Access to computer and internet',
    'Willingness to take notes and complete exercises',
    'No prior real estate experience required'
),
JSON_ARRAY(
    'Complete beginners to real estate investing',
    'People looking to build wealth through property investment',
    'Those seeking passive income opportunities',
    'Anyone wanting to diversify their investment portfolio'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),

-- Course 2: Advanced Property Analysis
(2, 'Advanced Property Analysis & Deal Evaluation', 'advanced-property-analysis-deal-evaluation',
'Take your property analysis skills to the next level with advanced techniques used by professional investors. Learn complex financial modeling, comparative market analysis, cash flow projections, and risk assessment. Includes Excel templates and real-world case studies.',
'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
297.00, 'USD', 'intermediate', 18, 1, 2, TRUE, TRUE,
JSON_ARRAY(
    'Master advanced financial analysis techniques',
    'Build comprehensive property evaluation models',
    'Understand cap rates, IRR, and other key metrics',
    'Learn risk assessment and mitigation strategies',
    'Create detailed cash flow projections'
),
JSON_ARRAY(
    'Basic understanding of real estate investing',
    'Familiarity with Excel or Google Sheets',
    'Completed a beginner real estate course or equivalent knowledge',
    'Calculator and note-taking materials'
),
JSON_ARRAY(
    'Intermediate real estate investors',
    'Real estate agents looking to advise clients better',
    'Financial professionals entering real estate',
    'Anyone wanting to make data-driven investment decisions'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),

-- Course 3: House Flipping Mastery
(3, 'House Flipping Mastery: From Purchase to Profit', 'house-flipping-mastery-purchase-to-profit',
'Learn the complete house flipping process from a professional who has flipped over 300 properties. Covers finding deals, renovation management, cost control, working with contractors, and maximizing profits. Includes real renovation case studies and project management tools.',
'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
397.00, 'USD', 'intermediate', 25, 3, 3, TRUE, TRUE,
JSON_ARRAY(
    'Find and evaluate profitable flip opportunities',
    'Manage renovation projects from start to finish',
    'Control costs and maximize profit margins',
    'Work effectively with contractors and suppliers',
    'Understand market timing and exit strategies'
),
JSON_ARRAY(
    'Basic real estate knowledge',
    'Some construction or renovation experience helpful but not required',
    'Access to capital for first flip project',
    'Strong project management skills or willingness to learn'
),
JSON_ARRAY(
    'Aspiring house flippers',
    'Contractors wanting to invest in real estate',
    'Real estate investors looking for active income strategies',
    'Those with construction backgrounds entering investing'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),

-- Course 4: Rental Property Investment
(4, 'Build Wealth with Rental Properties: Complete Blueprint', 'build-wealth-rental-properties-blueprint',
'Learn how to build a profitable rental property portfolio from someone who owns 500+ units. Covers property selection, financing strategies, tenant management, cash flow optimization, and scaling your portfolio. Includes tenant screening templates and management tools.',
'https://images.unsplash.com/photo-1582407947304-fd86f028f716?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
347.00, 'USD', 'beginner', 22, 4, 4, TRUE, FALSE,
JSON_ARRAY(
    'Select profitable rental properties',
    'Understand different financing strategies for rentals',
    'Master tenant screening and lease management',
    'Optimize cash flow and minimize vacancy',
    'Scale your portfolio systematically'
),
JSON_ARRAY(
    'Basic real estate investment knowledge',
    'Understanding of personal credit and financing',
    'Access to down payment capital',
    'Commitment to long-term wealth building'
),
JSON_ARRAY(
    'New real estate investors',
    'Those seeking passive income',
    'People planning for retirement',
    'Anyone wanting to build long-term wealth'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 35 DAY), NOW()),

-- Course 5: Commercial Real Estate Fundamentals
(5, 'Commercial Real Estate Investing Fundamentals', 'commercial-real-estate-investing-fundamentals',
'Enter the world of commercial real estate investing with confidence. Learn about office buildings, retail centers, industrial properties, and multi-family complexes. Understand commercial financing, due diligence, and professional management strategies.',
'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
497.00, 'USD', 'advanced', 30, 2, 5, TRUE, FALSE,
JSON_ARRAY(
    'Understand different commercial property types',
    'Learn commercial financing and partnership structures',
    'Master commercial due diligence processes',
    'Understand NOI, cap rates, and commercial valuation',
    'Navigate commercial real estate transactions'
),
JSON_ARRAY(
    'Solid understanding of basic real estate principles',
    'Experience with residential real estate investing preferred',
    'Access to significant capital or investor network',
    'Strong analytical and financial skills'
),
JSON_ARRAY(
    'Experienced residential investors',
    'High-net-worth individuals',
    'Real estate professionals expanding their knowledge',
    'Those seeking larger-scale investments'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 28 DAY), NOW()),

-- Course 6: Real Estate Finance Mastery
(6, 'Real Estate Finance Mastery: Funding Your Investments', 'real-estate-finance-mastery-funding-investments',
'Master the financial side of real estate investing. Learn about conventional mortgages, hard money lending, private money, syndications, and creative financing strategies. Understand how to leverage other people''s money to build wealth faster.',
'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
247.00, 'USD', 'intermediate', 16, 2, 6, TRUE, FALSE,
JSON_ARRAY(
    'Understand all major financing options',
    'Learn to structure deals with minimal personal capital',
    'Master credit optimization for real estate',
    'Understand partnership and syndication structures',
    'Navigate lender requirements and loan processes'
),
JSON_ARRAY(
    'Basic real estate investment knowledge',
    'Understanding of personal finance and credit',
    'Familiarity with basic financial concepts',
    'Serious commitment to real estate investing'
),
JSON_ARRAY(
    'Real estate investors at all levels',
    'Those with limited capital wanting to start investing',
    'Investors looking to scale their portfolios',
    'Real estate professionals'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 22 DAY), NOW()),

-- Course 7: Wholesaling Secrets
(7, 'Real Estate Wholesaling Secrets: Quick Profits, Low Risk', 'real-estate-wholesaling-secrets-quick-profits',
'Learn to make money in real estate without buying properties. Master the art of wholesaling - finding distressed properties, getting them under contract, and assigning contracts to investors for quick profits. Low capital requirements and fast returns.',
'https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
197.00, 'USD', 'beginner', 14, 3, 7, TRUE, FALSE,
JSON_ARRAY(
    'Find motivated sellers and distressed properties',
    'Master contract assignment and wholesale strategies',
    'Build a network of cash buyers',
    'Negotiate win-win deals for all parties',
    'Generate income without using your own capital'
),
JSON_ARRAY(
    'Basic understanding of real estate transactions',
    'Strong communication and negotiation skills',
    'Ability to market and network consistently',
    'Small marketing budget ($500-1000)'
),
JSON_ARRAY(
    'New real estate investors with limited capital',
    'Those wanting quick returns from real estate',
    'People looking for active real estate strategies',
    'Anyone wanting to learn the market before buying'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),

-- Course 8: Property Management Mastery
(8, 'Property Management Mastery: Maximize Your Rental Income', 'property-management-mastery-maximize-rental-income',
'Learn professional property management techniques to maximize your rental income and minimize headaches. Covers tenant screening, lease management, maintenance systems, legal compliance, and building a management team.',
'https://images.unsplash.com/photo-1560520653-9e0e4c89eb11?w=800',
'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
197.00, 'USD', 'intermediate', 15, 4, 8, TRUE, FALSE,
JSON_ARRAY(
    'Screen tenants effectively to minimize problems',
    'Handle maintenance and repairs efficiently',
    'Understand landlord-tenant laws and compliance',
    'Maximize rents and minimize vacancy',
    'Build systems for scalable property management'
),
JSON_ARRAY(
    'Own or plan to own rental properties',
    'Basic understanding of real estate investing',
    'Commitment to professional property management',
    'Understanding of local landlord-tenant laws helpful'
),
JSON_ARRAY(
    'Rental property owners',
    'New landlords',
    'Those considering property management as a business',
    'Real estate investors wanting to self-manage'
),
'English', 'published', DATE_SUB(NOW(), INTERVAL 12 DAY), NOW());

-- ===========================================
-- COURSE LESSONS
-- ===========================================

-- Lessons for Course 1 (Beginner's Guide)
INSERT INTO course_lessons (id, course_id, title, slug, description, video_url, duration_minutes, lesson_order, is_free_preview, content_type, reading_time_minutes, created_at, updated_at) VALUES
(1, 1, 'Welcome to Real Estate Investing', 'welcome-to-real-estate-investing', 'Introduction to the course and what you''ll learn', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 15, 1, TRUE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(2, 1, 'Real Estate Investment Basics', 'real-estate-investment-basics', 'Fundamental concepts and terminology', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25, 2, TRUE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(3, 1, 'Types of Real Estate Investments', 'types-of-real-estate-investments', 'Overview of different investment strategies', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, 3, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(4, 1, 'Understanding Cash Flow', 'understanding-cash-flow', 'How to calculate and analyze cash flow', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 35, 4, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(5, 1, 'Financing Your First Property', 'financing-your-first-property', 'Mortgage options and financing strategies', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 40, 5, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(6, 1, 'Finding Your First Deal', 'finding-your-first-deal', 'Where and how to find investment properties', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 45, 6, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(7, 1, 'Due Diligence Checklist', 'due-diligence-checklist', 'Essential steps before buying a property', NULL, NULL, 7, FALSE, 'document', 15, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(8, 1, 'Making Your First Offer', 'making-your-first-offer', 'Negotiation strategies and offer preparation', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, 8, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(9, 1, 'Closing Your First Deal', 'closing-your-first-deal', 'The closing process and what to expect', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25, 9, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(10, 1, 'Building Your Investment Plan', 'building-your-investment-plan', 'Creating a roadmap for your investing journey', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 35, 10, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW());

-- Lessons for Course 2 (Advanced Property Analysis)
INSERT INTO course_lessons (id, course_id, title, slug, description, video_url, duration_minutes, lesson_order, is_free_preview, content_type, reading_time_minutes, created_at, updated_at) VALUES
(11, 2, 'Advanced Analysis Framework', 'advanced-analysis-framework', 'Professional property evaluation methodology', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 20, 1, TRUE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),
(12, 2, 'Financial Modeling in Excel', 'financial-modeling-in-excel', 'Building comprehensive analysis models', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 45, 2, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),
(13, 2, 'Cap Rate Analysis Deep Dive', 'cap-rate-analysis-deep-dive', 'Understanding and calculating cap rates', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, 3, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),
(14, 2, 'Cash-on-Cash Return Mastery', 'cash-on-cash-return-mastery', 'Measuring your actual returns on investment', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25, 4, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW()),
(15, 2, 'IRR and NPV Calculations', 'irr-and-npv-calculations', 'Time value of money in real estate', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 40, 5, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 38 DAY), NOW());

-- Lessons for Course 3 (House Flipping)
INSERT INTO course_lessons (id, course_id, title, slug, description, video_url, duration_minutes, lesson_order, is_free_preview, content_type, reading_time_minutes, created_at, updated_at) VALUES
(16, 3, 'Finding Flip Opportunities', 'finding-flip-opportunities', 'Sourcing distressed properties for flipping', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, 1, TRUE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),
(17, 3, 'Estimating Renovation Costs', 'estimating-renovation-costs', 'Accurate cost estimation for profitable flips', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 35, 2, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),
(18, 3, 'Managing Contractors', 'managing-contractors', 'Working effectively with renovation teams', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 40, 3, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),
(19, 3, 'Project Timeline Management', 'project-timeline-management', 'Keeping flips on schedule and budget', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 25, 4, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW()),
(20, 3, 'Marketing Your Flip', 'marketing-your-flip', 'Selling flipped properties for maximum profit', 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 30, 5, FALSE, 'video', NULL, DATE_SUB(NOW(), INTERVAL 42 DAY), NOW());

-- ===========================================
-- ENROLLMENTS
-- ===========================================

INSERT INTO enrollments (id, user_id, course_id, enrolled_at, progress_percentage, completion_status, last_accessed, is_active, created_at, updated_at) VALUES
-- User 4 (Michael Thompson) enrollments
(1, 4, 1, DATE_SUB(NOW(), INTERVAL 10 DAY), 85.5, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 4, 6, DATE_SUB(NOW(), INTERVAL 5 DAY), 23.4, 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- User 5 (Jennifer Davis) enrollments
(3, 5, 1, DATE_SUB(NOW(), INTERVAL 15 DAY), 100.0, 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, 5, 4, DATE_SUB(NOW(), INTERVAL 8 DAY), 67.8, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(5, 5, 8, DATE_SUB(NOW(), INTERVAL 3 DAY), 12.5, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),

-- User 6 (David Rodriguez) enrollments
(6, 6, 7, DATE_SUB(NOW(), INTERVAL 6 DAY), 45.2, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(7, 6, 1, DATE_SUB(NOW(), INTERVAL 4 DAY), 30.0, 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),

-- User 7 (Emily Wilson) enrollments
(8, 7, 4, DATE_SUB(NOW(), INTERVAL 20 DAY), 100.0, 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(9, 7, 8, DATE_SUB(NOW(), INTERVAL 12 DAY), 89.3, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(10, 7, 2, DATE_SUB(NOW(), INTERVAL 7 DAY), 15.6, 'in_progress', DATE_SUB(NOW(), INTERVAL 3 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),

-- User 8 (James Anderson) enrollments
(11, 8, 1, DATE_SUB(NOW(), INTERVAL 5 DAY), 60.0, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- User 9 (Lisa Chen) enrollments
(12, 9, 6, DATE_SUB(NOW(), INTERVAL 12 DAY), 100.0, 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(13, 9, 5, DATE_SUB(NOW(), INTERVAL 8 DAY), 78.9, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),

-- User 10 (Robert Brown) enrollments
(14, 10, 5, DATE_SUB(NOW(), INTERVAL 18 DAY), 100.0, 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(15, 10, 2, DATE_SUB(NOW(), INTERVAL 10 DAY), 45.7, 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),

-- User 11 (Amanda Taylor) enrollments
(16, 11, 1, DATE_SUB(NOW(), INTERVAL 1 DAY), 5.0, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- User 12 (Kevin Martinez) enrollments
(17, 12, 3, DATE_SUB(NOW(), INTERVAL 14 DAY), 92.1, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(18, 12, 1, DATE_SUB(NOW(), INTERVAL 12 DAY), 100.0, 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),

-- User 13 (Nicole Johnson) enrollments
(19, 13, 7, DATE_SUB(NOW(), INTERVAL 9 DAY), 56.8, 'in_progress', DATE_SUB(NOW(), INTERVAL 2 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(20, 13, 2, DATE_SUB(NOW(), INTERVAL 5 DAY), 23.4, 'in_progress', DATE_SUB(NOW(), INTERVAL 1 DAY), TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- ===========================================
-- PAYMENT TRANSACTIONS
-- ===========================================

INSERT INTO payment_transactions (id, user_id, course_id, enrollment_id, amount, currency, payment_method, payment_processor, transaction_id, status, payment_date, metadata, created_at, updated_at) VALUES
-- Course purchases for enrolled users
(1, 4, 1, 1, 197.00, 'USD', 'credit_card', 'stripe', 'txn_1J5K2L3M4N5O6P7Q8R9S', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY), JSON_OBJECT('card_last4', '4242', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 4, 6, 2, 247.00, 'USD', 'credit_card', 'stripe', 'txn_2K6L3M4N5O6P7Q8R9S0T', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY), JSON_OBJECT('card_last4', '4242', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(3, 5, 1, 3, 197.00, 'USD', 'paypal', 'paypal', 'PAY-3L7M4N5O6P7Q8R9S0T1U', 'completed', DATE_SUB(NOW(), INTERVAL 15 DAY), JSON_OBJECT('payer_email', 'jennifer.davis@outlook.com'), DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(4, 5, 4, 4, 347.00, 'USD', 'credit_card', 'stripe', 'txn_4M8N5O6P7Q8R9S0T1U2V', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(5, 5, 8, 5, 197.00, 'USD', 'credit_card', 'stripe', 'txn_5N9O6P7Q8R9S0T1U2V3W', 'completed', DATE_SUB(NOW(), INTERVAL 3 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(6, 6, 7, 6, 197.00, 'USD', 'credit_card', 'stripe', 'txn_6O0P7Q8R9S0T1U2V3W4X', 'completed', DATE_SUB(NOW(), INTERVAL 6 DAY), JSON_OBJECT('card_last4', '4111', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(7, 6, 1, 7, 197.00, 'USD', 'credit_card', 'stripe', 'txn_7P1Q8R9S0T1U2V3W4X5Y', 'completed', DATE_SUB(NOW(), INTERVAL 4 DAY), JSON_OBJECT('card_last4', '4111', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(8, 7, 4, 8, 347.00, 'USD', 'paypal', 'paypal', 'PAY-8Q2R9S0T1U2V3W4X5Y6Z', 'completed', DATE_SUB(NOW(), INTERVAL 20 DAY), JSON_OBJECT('payer_email', 'emily.wilson@gmail.com'), DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(9, 7, 8, 9, 197.00, 'USD', 'credit_card', 'stripe', 'txn_9R3S0T1U2V3W4X5Y6Z7A', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY), JSON_OBJECT('card_last4', '3782', 'card_brand', 'amex'), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(10, 7, 2, 10, 297.00, 'USD', 'credit_card', 'stripe', 'txn_0S4T1U2V3W4X5Y6Z7A8B', 'completed', DATE_SUB(NOW(), INTERVAL 7 DAY), JSON_OBJECT('card_last4', '3782', 'card_brand', 'amex'), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(11, 8, 1, 11, 197.00, 'USD', 'credit_card', 'stripe', 'txn_1T5U2V3W4X5Y6Z7A8B9C', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY), JSON_OBJECT('card_last4', '6011', 'card_brand', 'discover'), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(12, 9, 6, 12, 247.00, 'USD', 'credit_card', 'stripe', 'txn_2U6V3W4X5Y6Z7A8B9C0D', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY), JSON_OBJECT('card_last4', '4242', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(13, 9, 5, 13, 497.00, 'USD', 'paypal', 'paypal', 'PAY-3V7W4X5Y6Z7A8B9C0D1E', 'completed', DATE_SUB(NOW(), INTERVAL 8 DAY), JSON_OBJECT('payer_email', 'lisa.chen@gmail.com'), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(14, 10, 5, 14, 497.00, 'USD', 'credit_card', 'stripe', 'txn_4W8X5Y6Z7A8B9C0D1E2F', 'completed', DATE_SUB(NOW(), INTERVAL 18 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(15, 10, 2, 15, 297.00, 'USD', 'credit_card', 'stripe', 'txn_5X9Y6Z7A8B9C0D1E2F3G', 'completed', DATE_SUB(NOW(), INTERVAL 10 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(16, 11, 1, 16, 197.00, 'USD', 'credit_card', 'stripe', 'txn_6Y0Z7A8B9C0D1E2F3G4H', 'completed', DATE_SUB(NOW(), INTERVAL 1 DAY), JSON_OBJECT('card_last4', '4111', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(17, 12, 3, 17, 397.00, 'USD', 'paypal', 'paypal', 'PAY-7Z1A8B9C0D1E2F3G4H5I', 'completed', DATE_SUB(NOW(), INTERVAL 14 DAY), JSON_OBJECT('payer_email', 'kevin.martinez@gmail.com'), DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(18, 12, 1, 18, 197.00, 'USD', 'credit_card', 'stripe', 'txn_8A2B9C0D1E2F3G4H5I6J', 'completed', DATE_SUB(NOW(), INTERVAL 12 DAY), JSON_OBJECT('card_last4', '4242', 'card_brand', 'visa'), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(19, 13, 7, 19, 197.00, 'USD', 'credit_card', 'stripe', 'txn_9B3C0D1E2F3G4H5I6J7K', 'completed', DATE_SUB(NOW(), INTERVAL 9 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(20, 13, 2, 20, 297.00, 'USD', 'credit_card', 'stripe', 'txn_0C4D1E2F3G4H5I6J7K8L', 'completed', DATE_SUB(NOW(), INTERVAL 5 DAY), JSON_OBJECT('card_last4', '5555', 'card_brand', 'mastercard'), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- ===========================================
-- COURSE REVIEWS
-- ===========================================

INSERT INTO course_reviews (id, course_id, user_id, rating, review_text, is_verified_purchase, helpful_count, created_at, updated_at) VALUES
-- Reviews for Course 1 (Beginner's Guide)
(1, 1, 5, 5, 'Excellent course for beginners! Robert explains everything clearly and the step-by-step approach made it easy to understand. I feel confident about starting my real estate journey now.', TRUE, 8, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(2, 1, 12, 5, 'Perfect starting point. As someone with construction experience but no investment knowledge, this course filled all the gaps. The financing section was particularly helpful.', TRUE, 6, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(3, 1, 4, 4, 'Great content overall. Would have liked more case studies but the fundamentals are solid. Already looking at my first property!', TRUE, 4, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),

-- Reviews for Course 4 (Rental Properties)
(4, 4, 7, 5, 'Sarah''s experience really shows. The tenant screening templates alone are worth the course price. Built my first rental property business plan using her framework.', TRUE, 12, DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(5, 4, 5, 4, 'Comprehensive coverage of rental property investing. The cash flow calculations were eye-opening. Minor issue with some outdated forms but content is still very relevant.', TRUE, 5, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),

-- Reviews for Course 6 (Real Estate Finance)
(6, 6, 9, 5, 'As a financial advisor, I was skeptical, but Dr. Williams knows her stuff. The commercial financing section expanded my knowledge significantly. Recommending to clients.', TRUE, 9, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(7, 6, 4, 4, 'Complex topic made accessible. The creative financing strategies opened my eyes to possibilities I never considered. Still working through some concepts but very valuable.', TRUE, 3, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- Reviews for Course 5 (Commercial Real Estate)
(8, 5, 10, 5, 'Exactly what I needed to transition from residential to commercial. Dr. Williams'' academic background combined with real-world experience is a perfect combination.', TRUE, 7, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(9, 5, 9, 4, 'Dense material but worth it. The NOI and cap rate explanations finally clicked for me. Planning to attend the next advanced seminar.', TRUE, 4, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- Reviews for Course 3 (House Flipping)
(10, 3, 12, 5, 'Mark is the real deal. His contractor management tips have already saved me thousands on my first flip. The cost estimation spreadsheets are incredibly detailed.', TRUE, 11, DATE_SUB(NOW(), INTERVAL 11 DAY), NOW()),

-- Reviews for Course 7 (Wholesaling)
(11, 7, 6, 4, 'Good introduction to wholesaling. The contract templates are professional grade. Would like more advanced marketing strategies but solid foundation.', TRUE, 2, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(12, 7, 13, 5, 'Perfect for someone transitioning from sales to investing. Mark''s approach to finding motivated sellers is systematic and effective. Already have my first contract!', TRUE, 6, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),

-- Reviews for Course 8 (Property Management)
(13, 8, 7, 5, 'Comprehensive property management course. The legal compliance section kept me out of trouble with my first tenants. Sarah''s systems approach is brilliant.', TRUE, 8, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(14, 8, 5, 4, 'Professional-grade content. Some sections felt repetitive but the maintenance tracking system is worth the price alone. Highly recommend for new landlords.', TRUE, 3, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),

-- Reviews for Course 2 (Advanced Property Analysis)
(15, 2, 7, 4, 'Steep learning curve but incredibly valuable. The Excel models are sophisticated - took me a while to understand but now I analyze deals like a pro.', TRUE, 5, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(16, 2, 10, 5, 'Finally understand IRR and NPV in real estate context. Robert''s teaching style makes complex concepts digestible. The case studies were particularly enlightening.', TRUE, 7, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(17, 2, 13, 3, 'Good content but quite advanced. Struggled with some financial concepts - might need a more basic finance course first. Excel templates are excellent though.', TRUE, 2, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- ===========================================
-- COUPONS AND DISCOUNTS
-- ===========================================

INSERT INTO coupons (id, code, description, type, value, minimum_amount, maximum_discount, usage_limit, used_count, is_active, valid_from, valid_until, applicable_courses, created_by, created_at, updated_at) VALUES
(1, 'WELCOME20', 'Welcome discount for new students', 'percentage', 20.00, 100.00, 100.00, 100, 23, TRUE, DATE_SUB(NOW(), INTERVAL 30 DAY), DATE_ADD(NOW(), INTERVAL 60 DAY), JSON_ARRAY(), 1, DATE_SUB(NOW(), INTERVAL 30 DAY), NOW()),
(2, 'FLIP50', '50% off house flipping course', 'percentage', 50.00, 0.00, 200.00, 50, 8, TRUE, DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_ADD(NOW(), INTERVAL 15 DAY), JSON_ARRAY(3), 1, DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(3, 'BUNDLE100', '$100 off when buying 3+ courses', 'fixed', 100.00, 500.00, 100.00, 25, 5, TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_ADD(NOW(), INTERVAL 30 DAY), JSON_ARRAY(), 1, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(4, 'STUDENT10', 'Student discount', 'percentage', 10.00, 0.00, 50.00, 200, 47, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), DATE_ADD(NOW(), INTERVAL 90 DAY), JSON_ARRAY(), 1, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),
(5, 'EARLYBIRD', 'Early bird special - expired', 'percentage', 30.00, 0.00, 150.00, 50, 50, FALSE, DATE_SUB(NOW(), INTERVAL 60 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), JSON_ARRAY(), 1, DATE_SUB(NOW(), INTERVAL 60 DAY), NOW());

-- ===========================================
-- INSTRUCTOR EARNINGS
-- ===========================================

INSERT INTO instructor_earnings (id, instructor_id, course_id, enrollment_id, transaction_id, gross_amount, commission_rate, commission_amount, net_amount, status, payout_date, created_at, updated_at) VALUES
-- Robert Smith (instructor 1) earnings
(1, 1, 1, 1, 1, 197.00, 70.00, 137.90, 137.90, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 1, 1, 3, 3, 197.00, 70.00, 137.90, 137.90, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 15 DAY), NOW()),
(3, 1, 1, 7, 7, 197.00, 70.00, 137.90, 137.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(4, 1, 1, 11, 11, 197.00, 70.00, 137.90, 137.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(5, 1, 1, 16, 16, 197.00, 70.00, 137.90, 137.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(6, 1, 1, 18, 18, 197.00, 70.00, 137.90, 137.90, 'paid', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(7, 1, 2, 10, 10, 297.00, 70.00, 207.90, 207.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(8, 1, 2, 15, 15, 297.00, 70.00, 207.90, 207.90, 'paid', DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(9, 1, 2, 20, 20, 297.00, 70.00, 207.90, 207.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),

-- Dr. Patricia Williams (instructor 2) earnings
(10, 2, 6, 2, 2, 247.00, 70.00, 172.90, 172.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(11, 2, 6, 12, 12, 247.00, 70.00, 172.90, 172.90, 'paid', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(12, 2, 5, 13, 13, 497.00, 70.00, 347.90, 347.90, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(13, 2, 5, 14, 14, 497.00, 70.00, 347.90, 347.90, 'paid', DATE_SUB(NOW(), INTERVAL 10 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),

-- Mark Thompson (instructor 3) earnings
(14, 3, 3, 17, 17, 397.00, 65.00, 258.05, 258.05, 'paid', DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(15, 3, 7, 6, 6, 197.00, 65.00, 128.05, 128.05, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(16, 3, 7, 19, 19, 197.00, 65.00, 128.05, 128.05, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),

-- Sarah Mitchell (instructor 4) earnings
(17, 4, 4, 4, 4, 347.00, 68.00, 235.96, 235.96, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(18, 4, 4, 8, 8, 347.00, 68.00, 235.96, 235.96, 'paid', DATE_SUB(NOW(), INTERVAL 15 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),
(19, 4, 8, 5, 5, 197.00, 68.00, 133.96, 133.96, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(20, 4, 8, 9, 9, 197.00, 68.00, 133.96, 133.96, 'paid', DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(21, 4, 8, 14, 14, 197.00, 68.00, 133.96, 133.96, 'pending', NULL, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW());

-- ===========================================
-- CERTIFICATES
-- ===========================================

INSERT INTO certificates (id, user_id, course_id, enrollment_id, certificate_number, issue_date, certificate_url, is_valid, created_at, updated_at) VALUES
-- Certificates for completed courses
(1, 5, 1, 3, 'CERT-RE-001-20240201', DATE_SUB(NOW(), INTERVAL 12 DAY), 'https://certificates.realestate-masterclass.com/cert-001.pdf', TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(2, 7, 4, 8, 'CERT-RE-002-20240115', DATE_SUB(NOW(), INTERVAL 17 DAY), 'https://certificates.realestate-masterclass.com/cert-002.pdf', TRUE, DATE_SUB(NOW(), INTERVAL 17 DAY), NOW()),
(3, 9, 6, 12, 'CERT-RE-003-20240203', DATE_SUB(NOW(), INTERVAL 9 DAY), 'https://certificates.realestate-masterclass.com/cert-003.pdf', TRUE, DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(4, 10, 5, 14, 'CERT-RE-004-20240125', DATE_SUB(NOW(), INTERVAL 14 DAY), 'https://certificates.realestate-masterclass.com/cert-004.pdf', TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(5, 12, 1, 18, 'CERT-RE-005-20240202', DATE_SUB(NOW(), INTERVAL 8 DAY), 'https://certificates.realestate-masterclass.com/cert-005.pdf', TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), NOW());

-- ===========================================
-- ACTIVITY LOGS
-- ===========================================

INSERT INTO activity_logs (id, user_id, action, entity_type, entity_id, description, ip_address, user_agent, created_at) VALUES
-- Recent user activities
(2, 4, 'course_enrollment', 'course', 1, 'Enrolled in Complete Beginner''s Guide to Real Estate Investing', '192.168.1.100', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(3, 4, 'payment_completed', 'payment', 1, 'Payment completed for course enrollment', '192.168.1.100', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 10 DAY)),
(4, 5, 'course_completed', 'course', 1, 'Completed Complete Beginner''s Guide to Real Estate Investing', '192.168.1.101', 'Mozilla/5.0 Macintosh Intel Mac OS X 10_15_7 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(5, 5, 'certificate_issued', 'certificate', 1, 'Certificate issued for course completion', '192.168.1.101', 'Mozilla/5.0 Macintosh Intel Mac OS X 10_15_7 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(6, 7, 'course_enrollment', 'course', 4, 'Enrolled in Build Wealth with Rental Properties', '192.168.1.102', 'Mozilla/5.0 iPhone CPU iPhone OS 15_0 like Mac OS X AppleWebKit/605.1.15', DATE_SUB(NOW(), INTERVAL 20 DAY)),
(7, 7, 'course_completed', 'course', 4, 'Completed Build Wealth with Rental Properties', '192.168.1.102', 'Mozilla/5.0 iPhone CPU iPhone OS 15_0 like Mac OS X AppleWebKit/605.1.15', DATE_SUB(NOW(), INTERVAL 17 DAY)),
(8, 9, 'course_enrollment', 'course', 6, 'Enrolled in Real Estate Finance Mastery', '192.168.1.103', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(9, 9, 'course_completed', 'course', 6, 'Completed Real Estate Finance Mastery', '192.168.1.103', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 9 DAY)),
(10, 12, 'course_enrollment', 'course', 3, 'Enrolled in House Flipping Mastery', '192.168.1.104', 'Mozilla/5.0 Android 11 Mobile rv:68.0 Gecko/68.0 Firefox/88.0', DATE_SUB(NOW(), INTERVAL 14 DAY)),
(11, 13, 'review_created', 'course', 7, 'Created review for Real Estate Wholesaling Secrets', '192.168.1.105', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 6 DAY)),
(12, 11, 'user_registered', 'user', 11, 'New user account created', '192.168.1.106', 'Mozilla/5.0 Macintosh Intel Mac OS X 10_15_7 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 2 DAY)),
(13, 11, 'course_enrollment', 'course', 1, 'Enrolled in Complete Beginner''s Guide to Real Estate Investing', '192.168.1.106', 'Mozilla/5.0 Macintosh Intel Mac OS X 10_15_7 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(14, 1, 'instructor_approved', 'instructor', 3, 'Approved Mark Thompson as instructor', '192.168.1.1', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 30 DAY)),
(15, 1, 'course_published', 'course', 8, 'Published Property Management Mastery course', '192.168.1.1', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 12 DAY)),
(16, 4, 'lesson_completed', 'lesson', 5, 'Completed lesson: Financing Your First Property', '192.168.1.100', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(17, 7, 'lesson_completed', 'lesson', 20, 'Completed lesson: Marketing Your Flip', '192.168.1.102', 'Mozilla/5.0 iPhone CPU iPhone OS 15_0 like Mac OS X AppleWebKit/605.1.15', DATE_SUB(NOW(), INTERVAL 1 DAY)),
(18, 10, 'review_created', 'course', 2, 'Created review for Advanced Property Analysis', '192.168.1.108', 'Mozilla/5.0 Windows NT 10.0 Win64 x64 AppleWebKit/537.36', DATE_SUB(NOW(), INTERVAL 7 DAY));

-- ===========================================
-- QUIZ ATTEMPTS AND RESULTS
-- ===========================================

INSERT INTO quizzes (id, course_id, lesson_id, title, description, questions, passing_score, max_attempts, time_limit_minutes, is_active, created_at, updated_at) VALUES
(1, 1, NULL, 'Real Estate Investing Fundamentals Quiz', 'Test your knowledge of basic real estate investing concepts', 
JSON_ARRAY(
    JSON_OBJECT('id', 1, 'question', 'What is cash flow in real estate?', 'type', 'multiple_choice', 'options', JSON_ARRAY('Money spent on repairs', 'Income minus expenses', 'Total rental income', 'Property appreciation'), 'correct_answer', 1),
    JSON_OBJECT('id', 2, 'question', 'What does ROI stand for?', 'type', 'multiple_choice', 'options', JSON_ARRAY('Return on Investment', 'Rate of Interest', 'Real Owner Income', 'Rental Operation Income'), 'correct_answer', 0),
    JSON_OBJECT('id', 3, 'question', 'Which is a passive real estate investment strategy?', 'type', 'multiple_choice', 'options', JSON_ARRAY('House flipping', 'Rental properties', 'Wholesaling', 'Real estate development'), 'correct_answer', 1)
), 
70.0, 3, 15, TRUE, DATE_SUB(NOW(), INTERVAL 45 DAY), NOW()),

(2, 4, NULL, 'Rental Property Basics Quiz', 'Test your understanding of rental property investing',
JSON_ARRAY(
    JSON_OBJECT('id', 1, 'question', 'What is the 1% rule in real estate?', 'type', 'multiple_choice', 'options', JSON_ARRAY('Property should cost 1% of income', 'Monthly rent should be 1% of property price', 'Down payment should be 1%', 'Cap rate should be 1%'), 'correct_answer', 1),
    JSON_OBJECT('id', 2, 'question', 'What is NOI?', 'type', 'multiple_choice', 'options', JSON_ARRAY('Net Operating Income', 'New Owner Investment', 'Normal Operating Interest', 'Net Owner Income'), 'correct_answer', 0)
),
60.0, 3, 10, TRUE, DATE_SUB(NOW(), INTERVAL 35 DAY), NOW());

INSERT INTO quiz_attempts (id, quiz_id, user_id, attempt_number, score_percentage, passed, answers, started_at, completed_at, created_at, updated_at) VALUES
-- Quiz attempts for completed courses
(1, 1, 5, 1, 85.5, TRUE, JSON_OBJECT('1', 1, '2', 0, '3', 1), DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(2, 1, 12, 1, 92.3, TRUE, JSON_OBJECT('1', 1, '2', 0, '3', 1), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(3, 2, 7, 1, 78.9, TRUE, JSON_OBJECT('1', 1, '2', 0), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), DATE_SUB(NOW(), INTERVAL 18 DAY), NOW()),
(4, 1, 4, 1, 65.2, FALSE, JSON_OBJECT('1', 0, '2', 0, '3', 1), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(5, 1, 4, 2, 87.1, TRUE, JSON_OBJECT('1', 1, '2', 0, '3', 1), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW());

-- ===========================================
-- LESSON PROGRESS TRACKING
-- ===========================================

INSERT INTO lesson_progress (id, user_id, course_id, lesson_id, watched_duration_seconds, total_duration_seconds, completion_percentage, is_completed, last_watched_at, created_at, updated_at) VALUES
-- Progress for User 4 (Michael Thompson) in Course 1
(1, 4, 1, 1, 900, 900, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 9 DAY), DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 4, 1, 2, 1500, 1500, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(3, 4, 1, 3, 1800, 1800, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 7 DAY), DATE_SUB(NOW(), INTERVAL 8 DAY), NOW()),
(4, 4, 1, 4, 2100, 2100, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 6 DAY), DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(5, 4, 1, 5, 2400, 2400, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(6, 4, 1, 6, 2700, 2700, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 4 DAY), DATE_SUB(NOW(), INTERVAL 5 DAY), NOW()),
(7, 4, 1, 7, 900, 900, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 3 DAY), DATE_SUB(NOW(), INTERVAL 4 DAY), NOW()),
(8, 4, 1, 8, 1200, 1800, 66.7, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),

-- Progress for User 5 (Jennifer Davis) in Course 4 - completed
(9, 5, 4, NULL, 1800, 1800, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 17 DAY), DATE_SUB(NOW(), INTERVAL 20 DAY), NOW()),

-- Progress for User 7 (Emily Wilson) in Course 8
(10, 7, 8, NULL, 1350, 1500, 90.0, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),

-- Progress for User 12 (Kevin Martinez) in Course 3
(11, 12, 3, 16, 1800, 1800, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 13 DAY), DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(12, 12, 3, 17, 2100, 2100, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), DATE_SUB(NOW(), INTERVAL 13 DAY), NOW()),
(13, 12, 3, 18, 2400, 2400, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 8 DAY), DATE_SUB(NOW(), INTERVAL 9 DAY), NOW()),
(14, 12, 3, 19, 1500, 1500, 100.0, TRUE, DATE_SUB(NOW(), INTERVAL 5 DAY), DATE_SUB(NOW(), INTERVAL 6 DAY), NOW()),
(15, 12, 3, 20, 1200, 1800, 66.7, FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), DATE_SUB(NOW(), INTERVAL 2 DAY), NOW());

-- ===========================================
-- NOTIFICATIONS
-- ===========================================

INSERT INTO notifications (id, user_id, type, title, message, data, is_read, created_at, updated_at) VALUES
-- Notifications for various users
(1, 4, 'course_enrollment', 'Welcome to Real Estate Investing!', 'You have successfully enrolled in Complete Beginner''s Guide to Real Estate Investing. Start your journey today!', JSON_OBJECT('course_id', 1, 'course_title', 'Complete Beginner''s Guide to Real Estate Investing'), TRUE, DATE_SUB(NOW(), INTERVAL 10 DAY), NOW()),
(2, 4, 'lesson_available', 'New Lesson Available', 'Lesson 8: Making Your First Offer is now available in your course.', JSON_OBJECT('course_id', 1, 'lesson_id', 8), FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(3, 5, 'course_completed', 'Congratulations! Course Completed', 'You have successfully completed Complete Beginner''s Guide to Real Estate Investing. Your certificate is ready for download.', JSON_OBJECT('course_id', 1, 'certificate_id', 1), TRUE, DATE_SUB(NOW(), INTERVAL 12 DAY), NOW()),
(4, 7, 'certificate_issued', 'Certificate Ready', 'Your certificate for Build Wealth with Rental Properties is ready for download.', JSON_OBJECT('course_id', 4, 'certificate_id', 2), TRUE, DATE_SUB(NOW(), INTERVAL 17 DAY), NOW()),
(5, 12, 'payment_successful', 'Payment Confirmation', 'Your payment of $397.00 for House Flipping Mastery has been processed successfully.', JSON_OBJECT('amount', 397.00, 'course_id', 3), TRUE, DATE_SUB(NOW(), INTERVAL 14 DAY), NOW()),
(6, 13, 'instructor_response', 'Instructor Replied', 'Mark Thompson has responded to your question in Real Estate Wholesaling Secrets.', JSON_OBJECT('course_id', 7, 'instructor_name', 'Mark Thompson'), FALSE, DATE_SUB(NOW(), INTERVAL 3 DAY), NOW()),
(7, 9, 'course_reminder', 'Continue Your Learning', 'You haven''t accessed Commercial Real Estate Investing Fundamentals in 3 days. Continue where you left off!', JSON_OBJECT('course_id', 5, 'progress', 78.9), FALSE, DATE_SUB(NOW(), INTERVAL 1 DAY), NOW()),
(8, 11, 'welcome', 'Welcome to Real Estate Masterclass!', 'Thank you for joining our community. Start with our beginner-friendly courses to build your foundation.', JSON_OBJECT('recommended_course', 1), FALSE, DATE_SUB(NOW(), INTERVAL 2 DAY), NOW()),
(9, 6, 'quiz_failed', 'Quiz Retake Available', 'You can retake the Real Estate Investing Fundamentals Quiz. You have 2 attempts remaining.', JSON_OBJECT('quiz_id', 1, 'attempts_remaining', 2), FALSE, DATE_SUB(NOW(), INTERVAL 7 DAY), NOW()),
(10, 10, 'new_course', 'New Course Available', 'Check out our latest course: Property Management Mastery by Sarah Mitchell.', JSON_OBJECT('course_id', 8, 'instructor', 'Sarah Mitchell'), FALSE, DATE_SUB(NOW(), INTERVAL 5 DAY), NOW());

-- ===========================================
-- UPDATE VERSION TRACKING
-- ===========================================

UPDATE system_settings 
SET setting_value = '1.1.0', updated_at = NOW() 
WHERE setting_key = 'schema_version';

INSERT INTO system_settings (setting_key, setting_value, setting_type, description, created_at) VALUES
('seed_data_version', '1.0.0', 'string', 'Realistic seed data version', NOW())
ON DUPLICATE KEY UPDATE 
setting_value = '1.0.0', 
updated_at = NOW();

-- ===========================================
-- FINAL ACTIVITY LOG ENTRY
-- ===========================================

INSERT INTO activity_logs (
    user_id,
    action,
    entity_type,
    description,
    created_at
) VALUES (
    1,
    'seed_data_created',
    'system',
    'Realistic seed data for development and testing created',
    NOW()
);

-- ===========================================
-- SUCCESS MESSAGE
-- ===========================================
-- Seed data creation completed successfully
-- Total records created:
-- - 10 additional users (students)
-- - 3 additional instructors  
-- - 8 course categories
-- - 8 comprehensive courses with realistic content
-- - 25+ course lessons
-- - 20 student enrollments with realistic progress
-- - 20 payment transactions
-- - 17 course reviews with authentic feedback
-- - 5 promotional coupons
-- - 21 instructor earnings records
-- - 5 completion certificates
-- - 18 activity log entries
-- - 5 quiz attempts and results
-- - 15 lesson progress tracking records
-- - 10 user notifications
-- ===========================================

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;