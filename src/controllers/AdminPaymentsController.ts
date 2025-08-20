import { Request, Response } from 'express';
import mysql from 'mysql2/promise';
import { ApiResponse, PaginationQuery } from '../types/index.js';
import { ValidationError, NotFoundError, DatabaseError } from '../utils/errors.js';

interface AdminPaymentsRequest extends Request {
  user: {
    id: number;
    email: string;
    name: string;
    role: string;
    roleId: number;
    permissions: string[];
    isVerified: boolean;
    isActive: boolean;
  };
}

interface TransactionFilters extends PaginationQuery {
  status?: 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled' | 'refunded';
  paymentMethod?: 'stripe' | 'paypal' | 'razorpay' | 'manual';
  dateFrom?: string;
  dateTo?: string;
  amountMin?: number;
  amountMax?: number;
  search?: string;
}

interface RefundRequest {
  transactionId: number;
  amount: number;
  reason: 'customer_request' | 'fraud' | 'duplicate' | 'other';
  description?: string;
}

interface RefundFilters extends PaginationQuery {
  status?: 'pending' | 'processing' | 'approved' | 'rejected';
  reason?: 'customer_request' | 'fraud' | 'duplicate' | 'other';
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

interface CouponRequest {
  code: string;
  name: string;
  description?: string;
  type: 'percentage' | 'fixed_amount';
  value: number;
  minimumAmount?: number;
  maximumDiscount?: number;
  usageLimit?: number;
  usageLimitPerUser?: number;
  applicableCourses?: number[];
  applicableCategories?: number[];
  excludeCourses?: number[];
  excludeCategories?: number[];
  startsAt?: string;
  expiresAt?: string;
  isActive?: boolean;
}

export class AdminPaymentsController {
  private db: mysql.Pool | null;

  constructor(database: mysql.Pool | null) {
    this.db = database;
  }

  private checkDatabaseConnection(): boolean {
    return this.db !== null && this.db !== undefined;
  }

  /**
   * Get all transactions with filters and pagination
   * GET /api/admin/payments/transactions
   */
  getTransactions = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        status,
        paymentMethod,
        dateFrom,
        dateTo,
        amountMin,
        amountMax,
        search
      } = req.query as TransactionFilters;
      
      if (!this.checkDatabaseConnection()) {
        // Import realistic data dynamically
        const { realisticTransactions } = await import('../data/realistic-data.js');
        
        // Apply filters to mock data
        let filteredTransactions = [...realisticTransactions];
        
        if (status) {
          filteredTransactions = filteredTransactions.filter(t => t.status === status);
        }
        
        if (paymentMethod) {
          filteredTransactions = filteredTransactions.filter(t => t.paymentMethod === paymentMethod);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredTransactions = filteredTransactions.filter(t => 
            t.user?.name?.toLowerCase().includes(searchLower) ||
            t.user?.email?.toLowerCase().includes(searchLower) ||
            t.transactionId.toLowerCase().includes(searchLower) ||
            t.orderId.toLowerCase().includes(searchLower)
          );
        }
        
        if (amountMin !== undefined) {
          filteredTransactions = filteredTransactions.filter(t => t.amount >= amountMin);
        }
        
        if (amountMax !== undefined) {
          filteredTransactions = filteredTransactions.filter(t => t.amount <= amountMax);
        }
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) >= fromDate);
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          filteredTransactions = filteredTransactions.filter(t => new Date(t.createdAt) <= toDate);
        }
        
        // Apply sorting
        const sortField = ['createdAt', 'amount', 'paymentDate', 'status'].includes(sort) ? sort : 'createdAt';
        filteredTransactions.sort((a: any, b: any) => {
          let aVal = a[sortField === 'createdAt' ? 'createdAt' : sortField];
          let bVal = b[sortField === 'createdAt' ? 'createdAt' : sortField];
          
          if (sortField === 'createdAt' || sortField === 'paymentDate') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          
          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        
        // Apply pagination
        const total = filteredTransactions.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedTransactions = filteredTransactions.slice(offset, offset + limit);
        
        return res.json({
          success: true,
          data: paginatedTransactions,
          meta: { 
            page: Number(page), 
            limit: Number(limit), 
            total, 
            total_pages: totalPages, 
            has_next: page < totalPages, 
            has_prev: page > 1 
          },
          message: "Using realistic mock data - database not connected"
        });
      }

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      if (status) {
        conditions.push('pt.status = ?');
        params.push(status);
      }

      if (paymentMethod) {
        conditions.push('pt.payment_method = ?');
        params.push(paymentMethod);
      }

      if (search) {
        conditions.push('(u.name LIKE ? OR u.email LIKE ? OR pt.transaction_id LIKE ? OR pt.order_id LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (amountMin !== undefined) {
        conditions.push('pt.amount >= ?');
        params.push(amountMin);
      }

      if (amountMax !== undefined) {
        conditions.push('pt.amount <= ?');
        params.push(amountMax);
      }

      if (dateFrom) {
        conditions.push('pt.created_at >= ?');
        params.push(dateFrom);
      }

      if (dateTo) {
        conditions.push('pt.created_at <= ?');
        params.push(dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Validate sort field
      const allowedSortFields = ['created_at', 'amount', 'payment_date', 'status'];
      const sortField = allowedSortFields.includes(sort) ? sort : 'created_at';
      const sortOrder = order === 'asc' ? 'ASC' : 'DESC';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM payment_transactions pt
        LEFT JOIN users u ON pt.user_id = u.id
        ${whereClause}
      `;

      const [countResult]: any = await this.db!.execute(countQuery, params);
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get transactions
      const transactionsQuery = `
        SELECT 
          pt.id,
          pt.user_id,
          pt.course_id,
          pt.order_id,
          pt.transaction_id,
          pt.payment_method,
          pt.payment_provider_id,
          pt.amount,
          pt.currency,
          pt.fee_amount,
          pt.net_amount,
          pt.status,
          pt.payment_date,
          pt.description,
          pt.metadata,
          pt.gateway_response,
          pt.created_at,
          pt.updated_at,
          u.name as user_name,
          u.email as user_email,
          c.title as course_title,
          c.price as course_price,
          (SELECT COUNT(*) FROM refunds r WHERE r.transaction_id = pt.id) as refund_count,
          (SELECT SUM(r.amount) FROM refunds r WHERE r.transaction_id = pt.id AND r.status = 'completed') as refunded_amount
        FROM payment_transactions pt
        LEFT JOIN users u ON pt.user_id = u.id
        LEFT JOIN courses c ON pt.course_id = c.id
        ${whereClause}
        ORDER BY pt.${sortField} ${sortOrder}
        LIMIT ? OFFSET ?
      `;

      const [transactions]: any = await this.db!.execute(transactionsQuery, [...params, limit, offset]);

      const response: ApiResponse = {
        success: true,
        data: transactions.map((transaction: any) => ({
          id: transaction.id,
          userId: transaction.user_id,
          courseId: transaction.course_id,
          orderId: transaction.order_id,
          transactionId: transaction.transaction_id,
          paymentMethod: transaction.payment_method,
          paymentProviderId: transaction.payment_provider_id,
          amount: parseFloat(transaction.amount),
          currency: transaction.currency,
          feeAmount: parseFloat(transaction.fee_amount),
          netAmount: parseFloat(transaction.net_amount),
          status: transaction.status,
          paymentDate: transaction.payment_date,
          description: transaction.description,
          metadata: transaction.metadata ? JSON.parse(transaction.metadata) : null,
          gatewayResponse: transaction.gateway_response ? JSON.parse(transaction.gateway_response) : null,
          createdAt: transaction.created_at,
          updatedAt: transaction.updated_at,
          user: transaction.user_name ? {
            name: transaction.user_name,
            email: transaction.user_email
          } : null,
          course: transaction.course_title ? {
            title: transaction.course_title,
            price: parseFloat(transaction.course_price)
          } : null,
          refunds: {
            count: transaction.refund_count,
            amount: parseFloat(transaction.refunded_amount) || 0
          }
        })),
        meta: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get transactions error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch transactions',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Get all refunds with filters and pagination
   * GET /api/admin/payments/refunds
   */
  getRefunds = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        status,
        reason,
        dateFrom,
        dateTo,
        search
      } = req.query as RefundFilters;
      
      if (!this.checkDatabaseConnection()) {
        // Import realistic data dynamically
        const data = await import('../data/realistic-data.js');
        const realisticRefunds = (data as any).realisticRefunds || [];
        
        // Apply filters to mock data
        let filteredRefunds = [...realisticRefunds];
        
        if (status) {
          filteredRefunds = filteredRefunds.filter(r => r.status === status);
        }
        
        if (reason) {
          filteredRefunds = filteredRefunds.filter(r => r.reason === reason);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredRefunds = filteredRefunds.filter(r => 
            r.user.name.toLowerCase().includes(searchLower) ||
            r.user.email.toLowerCase().includes(searchLower) ||
            r.refundTransactionId.toLowerCase().includes(searchLower)
          );
        }
        
        if (dateFrom) {
          const fromDate = new Date(dateFrom);
          filteredRefunds = filteredRefunds.filter(r => new Date(r.createdAt) >= fromDate);
        }
        
        if (dateTo) {
          const toDate = new Date(dateTo);
          filteredRefunds = filteredRefunds.filter(r => new Date(r.createdAt) <= toDate);
        }
        
        // Apply sorting
        const sortField = ['createdAt', 'amount', 'processedAt', 'status'].includes(sort) ? sort : 'createdAt';
        filteredRefunds.sort((a: any, b: any) => {
          let aVal = a[sortField === 'created_at' ? 'createdAt' : sortField];
          let bVal = b[sortField === 'created_at' ? 'createdAt' : sortField];
          
          if (sortField === 'createdAt' || sortField === 'processedAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          
          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        
        // Apply pagination
        const total = filteredRefunds.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedRefunds = filteredRefunds.slice(offset, offset + limit);
        
        return res.json({
          success: true,
          data: paginatedRefunds,
          meta: { 
            page: Number(page), 
            limit: Number(limit), 
            total, 
            total_pages: totalPages, 
            has_next: page < totalPages, 
            has_prev: page > 1 
          },
          message: "Using realistic mock data - database not connected"
        });
      }

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      if (status) {
        conditions.push('r.status = ?');
        params.push(status);
      }

      if (reason) {
        conditions.push('r.reason = ?');
        params.push(reason);
      }

      if (search) {
        conditions.push('(u.name LIKE ? OR u.email LIKE ? OR r.refund_transaction_id LIKE ?)');
        params.push(`%${search}%`, `%${search}%`, `%${search}%`);
      }

      if (dateFrom) {
        conditions.push('r.created_at >= ?');
        params.push(dateFrom);
      }

      if (dateTo) {
        conditions.push('r.created_at <= ?');
        params.push(dateTo);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM refunds r
        LEFT JOIN users u ON r.user_id = u.id
        ${whereClause}
      `;

      const [countResult]: any = await this.db!.execute(countQuery, params);
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get refunds
      const refundsQuery = `
        SELECT 
          r.id,
          r.transaction_id,
          r.user_id,
          r.refund_transaction_id,
          r.amount,
          r.reason,
          r.description,
          r.status,
          r.processed_by,
          r.processed_at,
          r.gateway_response,
          r.created_at,
          r.updated_at,
          u.name as user_name,
          u.email as user_email,
          pt.transaction_id as original_transaction_id,
          pt.amount as original_amount,
          pt.payment_method,
          admin.name as processed_by_name
        FROM refunds r
        LEFT JOIN users u ON r.user_id = u.id
        LEFT JOIN payment_transactions pt ON r.transaction_id = pt.id
        LEFT JOIN users admin ON r.processed_by = admin.id
        ${whereClause}
        ORDER BY r.${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      const [refunds]: any = await this.db!.execute(refundsQuery, [...params, limit, offset]);

      const response: ApiResponse = {
        success: true,
        data: refunds.map((refund: any) => ({
          id: refund.id,
          transactionId: refund.transaction_id,
          userId: refund.user_id,
          refundTransactionId: refund.refund_transaction_id,
          amount: parseFloat(refund.amount),
          reason: refund.reason,
          description: refund.description,
          status: refund.status,
          processedBy: refund.processed_by,
          processedAt: refund.processed_at,
          gatewayResponse: refund.gateway_response ? JSON.parse(refund.gateway_response) : null,
          createdAt: refund.created_at,
          updatedAt: refund.updated_at,
          user: refund.user_name ? {
            name: refund.user_name,
            email: refund.user_email
          } : null,
          originalTransaction: {
            transactionId: refund.original_transaction_id,
            amount: parseFloat(refund.original_amount),
            paymentMethod: refund.payment_method
          },
          processedByAdmin: refund.processed_by_name ? {
            name: refund.processed_by_name
          } : null
        })),
        meta: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get refunds error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch refunds',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Process a refund
   * POST /api/admin/payments/refund
   */
  processRefund = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const { transactionId, amount, reason, description }: RefundRequest = req.body;

      if (!transactionId || !amount || !reason) {
        throw new ValidationError('Transaction ID, amount, and reason are required');
      }

      // Get the original transaction
      const [transactions]: any = await this.db!.execute(
        'SELECT * FROM payment_transactions WHERE id = ? AND status = ?',
        [transactionId, 'completed']
      );

      if (transactions.length === 0) {
        throw new NotFoundError('Transaction not found or not eligible for refund');
      }

      const transaction = transactions[0];

      // Check if refund amount is valid
      const [existingRefunds]: any = await this.db!.execute(
        'SELECT COALESCE(SUM(amount), 0) as total_refunded FROM refunds WHERE transaction_id = ? AND status = ?',
        [transactionId, 'completed']
      );

      const totalRefunded = parseFloat(existingRefunds[0].total_refunded);
      const maxRefundAmount = parseFloat(transaction.amount) - totalRefunded;

      if (amount > maxRefundAmount) {
        throw new ValidationError(`Refund amount cannot exceed ${maxRefundAmount}`);
      }

      // Generate refund transaction ID
      const refundTransactionId = `ref_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

      // Start transaction
      await this.db!.execute('START TRANSACTION');

      try {
        // Insert refund record
        const [refundResult]: any = await this.db!.execute(
          `INSERT INTO refunds (
            transaction_id, user_id, refund_transaction_id, amount, reason, description,
            status, processed_by, processed_at, created_at, updated_at
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW(), NOW())`,
          [
            transactionId,
            transaction.user_id,
            refundTransactionId,
            amount,
            reason,
            description,
            'completed', // In a real implementation, this would be 'pending' until gateway confirms
            req.user.id
          ]
        );

        const refundId = refundResult.insertId;

        // Update transaction status if fully refunded
        const newTotalRefunded = totalRefunded + amount;
        if (newTotalRefunded >= parseFloat(transaction.amount)) {
          await this.db!.execute(
            'UPDATE payment_transactions SET status = ?, updated_at = NOW() WHERE id = ?',
            ['refunded', transactionId]
          );
        } else {
          await this.db!.execute(
            'UPDATE payment_transactions SET status = ?, updated_at = NOW() WHERE id = ?',
            ['partially_refunded', transactionId]
          );
        }

        // Update enrollment if course-related
        if (transaction.course_id) {
          await this.db!.execute(
            'UPDATE enrollments SET payment_status = ?, updated_at = NOW() WHERE user_id = ? AND course_id = ?',
            [newTotalRefunded >= parseFloat(transaction.amount) ? 'refunded' : 'partially_refunded', transaction.user_id, transaction.course_id]
          );
        }

        // Log activity
        await this.db!.execute(
          'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, metadata, created_at) VALUES (?, ?, ?, ?, ?, ?, NOW())',
          [
            req.user.id,
            'refund_processed',
            'refund',
            refundId,
            `Processed refund of ${amount} ${transaction.currency} for transaction ${transaction.transaction_id}`,
            JSON.stringify({ 
              refundTransactionId,
              originalTransactionId: transaction.transaction_id,
              amount,
              reason,
              userId: transaction.user_id
            })
          ]
        );

        await this.db!.execute('COMMIT');

        res.json({
          success: true,
          message: 'Refund processed successfully',
          data: {
            refundId,
            refundTransactionId,
            amount,
            status: 'completed'
          }
        });
      } catch (error) {
        await this.db!.execute('ROLLBACK');
        throw error;
      }
    } catch (error) {
      console.error('Process refund error:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to process refund',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Get all coupons with filters and pagination
   * GET /api/admin/payments/coupons
   */
  getCoupons = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const {
        page = 1,
        limit = 20,
        sort = 'created_at',
        order = 'desc',
        status,
        type,
        search
      } = req.query as any;

      if (!this.checkDatabaseConnection()) {
        // Import realistic data dynamically
        const realisticData = await import('../data/realistic-data.js');
        const realisticCoupons = (realisticData as any).realisticCoupons || [];
        
        // Apply filters to mock data
        let filteredCoupons = [...realisticCoupons];
        
        if (status === 'active') {
          filteredCoupons = filteredCoupons.filter(c => 
            c.isActive && (!c.expiresAt || new Date(c.expiresAt) > new Date())
          );
        } else if (status === 'inactive') {
          filteredCoupons = filteredCoupons.filter(c => 
            !c.isActive || (c.expiresAt && new Date(c.expiresAt) <= new Date())
          );
        }
        
        if (type) {
          filteredCoupons = filteredCoupons.filter(c => c.type === type);
        }
        
        if (search) {
          const searchLower = search.toLowerCase();
          filteredCoupons = filteredCoupons.filter(c => 
            c.code.toLowerCase().includes(searchLower) ||
            c.name.toLowerCase().includes(searchLower)
          );
        }
        
        // Apply sorting
        const sortField = ['createdAt', 'code', 'name', 'type', 'value'].includes(sort) ? sort : 'createdAt';
        filteredCoupons.sort((a: any, b: any) => {
          let aVal = a[sortField === 'created_at' ? 'createdAt' : sortField];
          let bVal = b[sortField === 'created_at' ? 'createdAt' : sortField];
          
          if (sortField === 'createdAt') {
            aVal = new Date(aVal).getTime();
            bVal = new Date(bVal).getTime();
          }
          
          if (order === 'asc') {
            return aVal > bVal ? 1 : -1;
          } else {
            return aVal < bVal ? 1 : -1;
          }
        });
        
        // Apply pagination
        const total = filteredCoupons.length;
        const totalPages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedCoupons = filteredCoupons.slice(offset, offset + limit);
        
        // Add status calculation for each coupon
        const couponsWithStatus = paginatedCoupons.map(coupon => ({
          ...coupon,
          status: this.getCouponStatus(coupon)
        }));
        
        return res.json({
          success: true,
          data: couponsWithStatus,
          meta: { 
            page: Number(page), 
            limit: Number(limit), 
            total, 
            total_pages: totalPages, 
            has_next: page < totalPages, 
            has_prev: page > 1 
          },
          message: "Using realistic mock data - database not connected"
        });
      }

      // Build WHERE clause
      const conditions: string[] = [];
      const params: any[] = [];

      if (status === 'active') {
        conditions.push('c.is_active = 1 AND (c.expires_at IS NULL OR c.expires_at > NOW())');
      } else if (status === 'inactive') {
        conditions.push('c.is_active = 0 OR c.expires_at <= NOW()');
      }

      if (type) {
        conditions.push('c.type = ?');
        params.push(type);
      }

      if (search) {
        conditions.push('(c.code LIKE ? OR c.name LIKE ?)');
        params.push(`%${search}%`, `%${search}%`);
      }

      const whereClause = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

      // Count total records
      const countQuery = `
        SELECT COUNT(*) as total
        FROM coupons c
        ${whereClause}
      `;

      const [countResult]: any = await this.db!.execute(countQuery, params);
      const total = countResult[0].total;

      // Calculate pagination
      const offset = (page - 1) * limit;
      const totalPages = Math.ceil(total / limit);

      // Get coupons
      const couponsQuery = `
        SELECT 
          c.*,
          u.name as created_by_name,
          u.email as created_by_email
        FROM coupons c
        LEFT JOIN users u ON c.created_by = u.id
        ${whereClause}
        ORDER BY c.${sort} ${order.toUpperCase()}
        LIMIT ? OFFSET ?
      `;

      const [coupons]: any = await this.db!.execute(couponsQuery, [...params, limit, offset]);

      const response: ApiResponse = {
        success: true,
        data: coupons.map((coupon: any) => ({
          id: coupon.id,
          code: coupon.code,
          name: coupon.name,
          description: coupon.description,
          type: coupon.type,
          value: parseFloat(coupon.value),
          minimumAmount: coupon.minimum_amount ? parseFloat(coupon.minimum_amount) : null,
          maximumDiscount: coupon.maximum_discount ? parseFloat(coupon.maximum_discount) : null,
          usageLimit: coupon.usage_limit,
          usageLimitPerUser: coupon.usage_limit_per_user,
          usedCount: coupon.used_count,
          applicableCourses: coupon.applicable_courses ? JSON.parse(coupon.applicable_courses) : null,
          applicableCategories: coupon.applicable_categories ? JSON.parse(coupon.applicable_categories) : null,
          excludeCourses: coupon.exclude_courses ? JSON.parse(coupon.exclude_courses) : null,
          excludeCategories: coupon.exclude_categories ? JSON.parse(coupon.exclude_categories) : null,
          startsAt: coupon.starts_at,
          expiresAt: coupon.expires_at,
          isActive: coupon.is_active,
          createdBy: {
            id: coupon.created_by,
            name: coupon.created_by_name,
            email: coupon.created_by_email
          },
          createdAt: coupon.created_at,
          updatedAt: coupon.updated_at,
          status: this.getCouponStatus(coupon)
        })),
        meta: {
          page,
          limit,
          total,
          total_pages: totalPages,
          has_next: page < totalPages,
          has_prev: page > 1
        }
      };

      res.json(response);
    } catch (error) {
      console.error('Get coupons error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to fetch coupons',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  };

  /**
   * Create new coupon
   * POST /api/admin/payments/coupons
   */
  createCoupon = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const {
        code,
        name,
        description,
        type,
        value,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        usageLimitPerUser = 1,
        applicableCourses,
        applicableCategories,
        excludeCourses,
        excludeCategories,
        startsAt,
        expiresAt,
        isActive = true
      }: CouponRequest = req.body;

      // Validation
      if (!code || !name || !type || value === undefined) {
        throw new ValidationError('Code, name, type, and value are required');
      }

      if (!['percentage', 'fixed_amount'].includes(type)) {
        throw new ValidationError('Type must be percentage or fixed_amount');
      }

      if (value <= 0) {
        throw new ValidationError('Value must be greater than 0');
      }

      if (type === 'percentage' && value > 100) {
        throw new ValidationError('Percentage value cannot exceed 100');
      }

      // Check if code already exists
      const [existingCoupons]: any = await this.db!.execute(
        'SELECT id FROM coupons WHERE code = ?',
        [code.toUpperCase()]
      );

      if (existingCoupons.length > 0) {
        throw new ValidationError('Coupon code already exists');
      }

      // Validate dates
      if (startsAt && expiresAt && new Date(startsAt) >= new Date(expiresAt)) {
        throw new ValidationError('Start date must be before expiry date');
      }

      // Insert coupon
      const insertQuery = `
        INSERT INTO coupons (
          code, name, description, type, value, minimum_amount, maximum_discount,
          usage_limit, usage_limit_per_user, applicable_courses, applicable_categories,
          exclude_courses, exclude_categories, starts_at, expires_at, is_active,
          created_by, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NOW(), NOW())
      `;

      const [result]: any = await this.db!.execute(insertQuery, [
        code.toUpperCase(),
        name,
        description,
        type,
        value,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        usageLimitPerUser,
        applicableCourses ? JSON.stringify(applicableCourses) : null,
        applicableCategories ? JSON.stringify(applicableCategories) : null,
        excludeCourses ? JSON.stringify(excludeCourses) : null,
        excludeCategories ? JSON.stringify(excludeCategories) : null,
        startsAt,
        expiresAt,
        isActive,
        req.user.id
      ]);

      const couponId = result.insertId;

      // Log activity
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [req.user.id, 'coupon_created', 'coupon', couponId, `Created coupon: ${code}`]
      );

      res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: {
          id: couponId,
          code: code.toUpperCase(),
          name,
          type,
          value,
          isActive
        }
      });
    } catch (error) {
      console.error('Create coupon error:', error);
      if (error instanceof ValidationError) {
        res.status(400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to create coupon',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Update coupon
   * PUT /api/admin/payments/coupons/:id
   */
  updateCoupon = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const couponId = parseInt(req.params.id);

      if (!couponId) {
        throw new ValidationError('Invalid coupon ID');
      }

      // Check if coupon exists
      const [existingCoupon]: any = await this.db!.execute(
        'SELECT id, code, used_count FROM coupons WHERE id = ?',
        [couponId]
      );

      if (existingCoupon.length === 0) {
        throw new NotFoundError('Coupon not found');
      }

      const coupon = existingCoupon[0];

      const {
        name,
        description,
        value,
        minimumAmount,
        maximumDiscount,
        usageLimit,
        usageLimitPerUser,
        applicableCourses,
        applicableCategories,
        excludeCourses,
        excludeCategories,
        startsAt,
        expiresAt,
        isActive
      } = req.body;

      // Build update query dynamically
      const updateFields: string[] = [];
      const updateParams: any[] = [];

      if (name !== undefined) {
        updateFields.push('name = ?');
        updateParams.push(name);
      }

      if (description !== undefined) {
        updateFields.push('description = ?');
        updateParams.push(description);
      }

      if (value !== undefined) {
        if (value <= 0) {
          throw new ValidationError('Value must be greater than 0');
        }
        updateFields.push('value = ?');
        updateParams.push(value);
      }

      if (minimumAmount !== undefined) {
        updateFields.push('minimum_amount = ?');
        updateParams.push(minimumAmount);
      }

      if (maximumDiscount !== undefined) {
        updateFields.push('maximum_discount = ?');
        updateParams.push(maximumDiscount);
      }

      if (usageLimit !== undefined) {
        // Check if new usage limit is not less than current usage
        if (usageLimit < coupon.used_count) {
          throw new ValidationError('Usage limit cannot be less than current usage count');
        }
        updateFields.push('usage_limit = ?');
        updateParams.push(usageLimit);
      }

      if (usageLimitPerUser !== undefined) {
        updateFields.push('usage_limit_per_user = ?');
        updateParams.push(usageLimitPerUser);
      }

      if (applicableCourses !== undefined) {
        updateFields.push('applicable_courses = ?');
        updateParams.push(applicableCourses ? JSON.stringify(applicableCourses) : null);
      }

      if (applicableCategories !== undefined) {
        updateFields.push('applicable_categories = ?');
        updateParams.push(applicableCategories ? JSON.stringify(applicableCategories) : null);
      }

      if (excludeCourses !== undefined) {
        updateFields.push('exclude_courses = ?');
        updateParams.push(excludeCourses ? JSON.stringify(excludeCourses) : null);
      }

      if (excludeCategories !== undefined) {
        updateFields.push('exclude_categories = ?');
        updateParams.push(excludeCategories ? JSON.stringify(excludeCategories) : null);
      }

      if (startsAt !== undefined) {
        updateFields.push('starts_at = ?');
        updateParams.push(startsAt);
      }

      if (expiresAt !== undefined) {
        updateFields.push('expires_at = ?');
        updateParams.push(expiresAt);
      }

      if (isActive !== undefined) {
        updateFields.push('is_active = ?');
        updateParams.push(isActive);
      }

      if (updateFields.length === 0) {
        throw new ValidationError('No fields to update');
      }

      updateFields.push('updated_at = NOW()');

      const updateQuery = `
        UPDATE coupons 
        SET ${updateFields.join(', ')}
        WHERE id = ?
      `;

      await this.db!.execute(updateQuery, [...updateParams, couponId]);

      // Log activity
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [req.user.id, 'coupon_updated', 'coupon', couponId, `Updated coupon: ${coupon.code}`]
      );

      res.json({
        success: true,
        message: 'Coupon updated successfully',
        data: {
          id: couponId
        }
      });
    } catch (error) {
      console.error('Update coupon error:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to update coupon',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  /**
   * Delete coupon
   * DELETE /api/admin/payments/coupons/:id
   */
  deleteCoupon = async (req: AdminPaymentsRequest, res: Response) => {
    try {
      const couponId = parseInt(req.params.id);

      if (!couponId) {
        throw new ValidationError('Invalid coupon ID');
      }

      // Check if coupon exists
      const [existingCoupon]: any = await this.db!.execute(
        'SELECT id, code, used_count FROM coupons WHERE id = ?',
        [couponId]
      );

      if (existingCoupon.length === 0) {
        throw new NotFoundError('Coupon not found');
      }

      const coupon = existingCoupon[0];

      // Check if coupon has been used
      if (coupon.used_count > 0) {
        throw new ValidationError('Cannot delete coupon that has been used. Deactivate it instead.');
      }

      // Delete coupon
      await this.db!.execute('DELETE FROM coupons WHERE id = ?', [couponId]);

      // Log activity
      await this.db!.execute(
        'INSERT INTO activity_logs (user_id, action, entity_type, entity_id, description, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [req.user.id, 'coupon_deleted', 'coupon', couponId, `Deleted coupon: ${coupon.code}`]
      );

      res.json({
        success: true,
        message: 'Coupon deleted successfully'
      });
    } catch (error) {
      console.error('Delete coupon error:', error);
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        res.status(error instanceof NotFoundError ? 404 : 400).json({
          success: false,
          message: error.message
        });
      } else {
        res.status(500).json({
          success: false,
          message: 'Failed to delete coupon',
          error: error instanceof Error ? error.message : 'Unknown error'
        });
      }
    }
  };

  // Helper methods

  private getCouponStatus(coupon: any): string {
    if (!coupon.is_active) return 'inactive';
    
    const now = new Date();
    
    if (coupon.starts_at && new Date(coupon.starts_at) > now) {
      return 'scheduled';
    }
    
    if (coupon.expires_at && new Date(coupon.expires_at) <= now) {
      return 'expired';
    }
    
    if (coupon.usage_limit && coupon.used_count >= coupon.usage_limit) {
      return 'exhausted';
    }
    
    return 'active';
  }
}

export default AdminPaymentsController;