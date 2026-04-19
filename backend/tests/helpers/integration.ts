/**
 * Integration Test Helpers
 * 
 * Utilities for testing API endpoints with supertest
 */

import request from 'supertest';
import { Application } from 'express';

export class ApiTestHelper {
  constructor(private app: Application) {}

  /**
   * Make authenticated request
   */
  async authenticatedRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    token: string,
    body?: any
  ) {
    const req = request(this.app)[method](path)
      .set('Authorization', `Bearer ${token}`);
    
    if (body) {
      req.send(body);
    }
    
    return req;
  }

  /**
   * Make unauthenticated request
   */
  async publicRequest(
    method: 'get' | 'post' | 'put' | 'patch' | 'delete',
    path: string,
    body?: any
  ) {
    const req = request(this.app)[method](path);
    
    if (body) {
      req.send(body);
    }
    
    return req;
  }

  /**
   * Login helper
   */
  async login(phone: string, password: string): Promise<string> {
    const response = await request(this.app)
      .post('/api/auth/login')
      .send({ phone, password });
    
    return response.body.accessToken;
  }

  /**
   * Register helper
   */
  async register(userData: any): Promise<{ user: any; token: string }> {
    const response = await request(this.app)
      .post('/api/auth/register')
      .send(userData);
    
    return {
      user: response.body.user,
      token: response.body.accessToken
    };
  }
}

/**
 * Assert API Response Structure
 */
export const assertApiSuccess = (response: any, expectedData?: any) => {
  expect(response.status).toBe(200);
  expect(response.body).toHaveProperty('success', true);
  
  if (expectedData) {
    expect(response.body.data).toMatchObject(expectedData);
  }
};

/**
 * Assert API Error Response
 */
export const assertApiError = (
  response: any,
  expectedStatus: number,
  expectedMessage?: string
) => {
  expect(response.status).toBe(expectedStatus);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body).toHaveProperty('error');
  
  if (expectedMessage) {
    expect(response.body.error.message).toContain(expectedMessage);
  }
};

/**
 * Assert Validation Error
 */
export const assertValidationError = (response: any, field?: string) => {
  expect(response.status).toBe(400);
  expect(response.body).toHaveProperty('success', false);
  expect(response.body.error).toHaveProperty('code', 'VALIDATION_ERROR');
  
  if (field) {
    expect(response.body.error.details).toContainEqual(
      expect.objectContaining({ field })
    );
  }
};
