import { Response } from 'express';
import {
  sendSuccess,
  sendPaginatedResponse,
  sendError,
  asyncHandler,
  PaginationMeta,
} from '../../../src/shared/utils/responses';

describe('Response Utilities', () => {
  let mockRes: Partial<Response>;

  beforeEach(() => {
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
  });

  describe('sendSuccess', () => {
    it('should send a successful response', () => {
      const data = { id: 1, name: 'Test' };
      sendSuccess(mockRes as Response, data);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(expect.objectContaining({
        success: true,
        statusCode: 200,
        data,
      }));
    });

    it('should include message if provided', () => {
      const data = { id: 1 };
      const message = 'Resource created successfully';
      sendSuccess(mockRes as Response, data, message);

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          message,
        })
      );
    });

    it('should use custom status code', () => {
      const data = { id: 1 };
      sendSuccess(mockRes as Response, data, 'Created', 201);

      expect(mockRes.status).toHaveBeenCalledWith(201);
    });

    it('should include timestamp', () => {
      sendSuccess(mockRes as Response, {});

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });

    it('should return valid ISO timestamp', () => {
      sendSuccess(mockRes as Response, {});

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      const timestamp = new Date(callArgs.timestamp);
      expect(timestamp.toString()).not.toBe('Invalid Date');
    });
  });

  describe('sendPaginatedResponse', () => {
    const data = [
      { id: 1, name: 'Item 1' },
      { id: 2, name: 'Item 2' },
    ];

    it('should send a paginated response', () => {
      const pagination: PaginationMeta = {
        page: 1,
        pageSize: 10,
        total: 25,
      };

      sendPaginatedResponse(mockRes as Response, data, pagination);

      expect(mockRes.status).toHaveBeenCalledWith(200);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: true,
          data,
          pagination: {
            page: 1,
            pageSize: 10,
            total: 25,
            totalPages: 3,
          },
        })
      );
    });

    it('should calculate correct total pages', () => {
      const pagination: PaginationMeta = {
        page: 1,
        pageSize: 5,
        total: 23,
      };

      sendPaginatedResponse(mockRes as Response, data, pagination);

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.pagination.totalPages).toBe(5);
    });

    it('should handle exact page divisor', () => {
      const pagination: PaginationMeta = {
        page: 1,
        pageSize: 5,
        total: 20,
      };

      sendPaginatedResponse(mockRes as Response, data, pagination);

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.pagination.totalPages).toBe(4);
    });

    it('should include custom message', () => {
      const pagination: PaginationMeta = {
        page: 1,
        pageSize: 10,
        total: 25,
      };

      sendPaginatedResponse(mockRes as Response, data, pagination, 'Items retrieved');

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Items retrieved',
        })
      );
    });

    it('should use custom status code', () => {
      const pagination: PaginationMeta = {
        page: 1,
        pageSize: 10,
        total: 25,
      };

      sendPaginatedResponse(mockRes as Response, data, pagination, undefined, 202);

      expect(mockRes.status).toHaveBeenCalledWith(202);
    });
  });

  describe('sendError', () => {
    it('should send an error response with Error object', () => {
      const error = new Error('Something went wrong');
      sendError(mockRes as Response, error);

      expect(mockRes.status).toHaveBeenCalledWith(400);
      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          statusCode: 400,
          error: {
            code: 'ERROR',
            message: 'Something went wrong',
          },
        })
      );
    });

    it('should send an error response with string', () => {
      sendError(mockRes as Response, 'Invalid input');

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          success: false,
          error: {
            code: 'ERROR',
            message: 'Invalid input',
          },
        })
      );
    });

    it('should use custom message', () => {
      const error = new Error('Internal error');
      sendError(mockRes as Response, error, 'Database connection failed');

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.error.message).toBe('Database connection failed');
    });

    it('should use custom status code', () => {
      sendError(mockRes as Response, 'Not found', undefined, 404);

      expect(mockRes.status).toHaveBeenCalledWith(404);
    });

    it('should use custom error code', () => {
      sendError(mockRes as Response, 'Unauthorized', undefined, 401, 'UNAUTHORIZED');

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: {
            code: 'UNAUTHORIZED',
            message: 'Unauthorized',
          },
        })
      );
    });

    it('should include error details', () => {
      const details = { field: 'email', value: 'invalid' };
      sendError(mockRes as Response, 'Validation failed', undefined, 400, 'VALIDATION_ERROR', details);

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.error.details).toEqual(details);
    });

    it('should include timestamp', () => {
      sendError(mockRes as Response, 'Error');

      expect(mockRes.json).toHaveBeenCalledWith(
        expect.objectContaining({
          timestamp: expect.any(String),
        })
      );
    });
  });

  describe('asyncHandler', () => {
    it('should wrap async functions', () => {
      const fn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(fn);

      expect(typeof wrapped).toBe('function');
      expect(wrapped.length).toBe(3); // (req, res, next)
    });

    it('should execute the wrapped function', () => {
      const fn = jest.fn().mockResolvedValue('success');
      const wrapped = asyncHandler(fn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      wrapped(mockReq, mockRes, mockNext);

      expect(fn).toHaveBeenCalledWith(mockReq, mockRes, mockNext);
    });

    it('should catch errors and pass to next', async () => {
      const error = new Error('Test error');
      const fn = jest.fn().mockRejectedValue(error);
      const wrapped = asyncHandler(fn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      wrapped(mockReq, mockRes, mockNext);

      // Wait for promise to settle
      await new Promise(resolve => setTimeout(resolve, 10));

      expect(mockNext).toHaveBeenCalledWith(error);
    });

    it('should handle synchronous functions', () => {
      const fn = jest.fn().mockReturnValue('success');
      const wrapped = asyncHandler(fn);

      const mockReq = {};
      const mockRes = {};
      const mockNext = jest.fn();

      wrapped(mockReq, mockRes, mockNext);

      expect(fn).toHaveBeenCalled();
    });
  });

  describe('Response Structure', () => {
    it('should always include success flag', () => {
      sendSuccess(mockRes as Response, {});

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.success).toBeDefined();
      expect(typeof callArgs.success).toBe('boolean');
    });

    it('should always include statusCode', () => {
      sendSuccess(mockRes as Response, {});

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.statusCode).toBeDefined();
      expect(typeof callArgs.statusCode).toBe('number');
    });

    it('should always include timestamp', () => {
      sendSuccess(mockRes as Response, {});

      const callArgs = (mockRes.json as any).mock.calls[0][0];
      expect(callArgs.timestamp).toBeDefined();
      expect(typeof callArgs.timestamp).toBe('string');
    });

    it('should have correct status code on response object', () => {
      sendSuccess(mockRes as Response, {}, 'OK', 200);

      expect(mockRes.status).toHaveBeenCalledWith(200);
    });
  });
});
