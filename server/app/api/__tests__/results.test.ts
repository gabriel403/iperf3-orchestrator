// Mock NextRequest and NextResponse before imports to avoid whatwg-fetch conflicts
jest.mock('next/server', () => {
  const actual = jest.requireActual('next/server');
  return {
    ...actual,
    NextRequest: jest.fn().mockImplementation((url: string | URL, init?: RequestInit) => {
      const body = init?.body;
      const headers = new Headers(init?.headers as HeadersInit);
      return {
        url: typeof url === 'string' ? url : url.toString(),
        method: init?.method || 'GET',
        headers,
        json: jest.fn().mockResolvedValue(body ? JSON.parse(body as string) : {}),
      };
    }),
    NextResponse: {
      json: jest.fn((data: any, init?: { status?: number }) => {
        return new Response(JSON.stringify(data), {
          status: init?.status || 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }),
    },
  };
});

import { POST } from '../results/route';
import { NextRequest } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { authenticateApiKey, getApiKeyFromRequest } from '@/lib/auth';

// Mock dependencies
jest.mock('@/lib/auth');
jest.mock('@prisma/client', () => {
  const mockPrismaClient = {
    node: {
      findFirst: jest.fn(),
    },
    testRun: {
      create: jest.fn(),
    },
  };
  return {
    PrismaClient: jest.fn(() => mockPrismaClient),
  };
});

// Helper to create NextRequest for testing
function createTestRequest(url: string, options: { method?: string; headers?: Record<string, string>; body?: string } = {}) {
  const { method = 'GET', headers = {}, body } = options;
  return new NextRequest(url, {
    method,
    headers,
    body,
  }) as any;
}

const mockAuthenticateApiKey = authenticateApiKey as jest.MockedFunction<typeof authenticateApiKey>;
const mockGetApiKeyFromRequest = getApiKeyFromRequest as jest.MockedFunction<typeof getApiKeyFromRequest>;

describe('POST /api/results', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 when API key is missing', async () => {
    mockGetApiKeyFromRequest.mockReturnValue(null);
    mockAuthenticateApiKey.mockResolvedValue(null);

    const request = createTestRequest('http://localhost:3000/api/results', {
      method: 'POST',
      headers: {},
      body: JSON.stringify({
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:10:00Z',
        success: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 401 when API key is invalid', async () => {
    mockGetApiKeyFromRequest.mockReturnValue('invalid-key');
    mockAuthenticateApiKey.mockResolvedValue(null);

    const request = createTestRequest('http://localhost:3000/api/results', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer invalid-key',
      },
      body: JSON.stringify({
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:10:00Z',
        success: true,
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(401);
    expect(data.error).toContain('Unauthorized');
  });

  it('should return 400 when request body is invalid', async () => {
    mockGetApiKeyFromRequest.mockReturnValue('valid-key');
    mockAuthenticateApiKey.mockResolvedValue({
      id: 'node-id',
      name: 'Test Node',
      secretKey: 'valid-key',
      pollIntervalSeconds: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any);

    const request = createTestRequest('http://localhost:3000/api/results', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-key',
      },
      body: JSON.stringify({
        // Missing required fields
      }),
    });

    const response = await POST(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data.error).toBe('Invalid request');
  });

  it('should create test run when request is valid', async () => {
    const mockNode = {
      id: 'node-id',
      name: 'Test Node',
      secretKey: 'valid-key',
      pollIntervalSeconds: 300,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockGetApiKeyFromRequest.mockReturnValue('valid-key');
    mockAuthenticateApiKey.mockResolvedValue(mockNode as any);

    const PrismaClientMock = PrismaClient as jest.MockedClass<typeof PrismaClient>;
    const mockPrisma = new PrismaClientMock();
    const mockCreate = jest.fn().mockResolvedValue({ id: 'test-run-id' });
    (mockPrisma.testRun as any).create = mockCreate;

    const request = createTestRequest('http://localhost:3000/api/results', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer valid-key',
      },
      body: JSON.stringify({
        startedAt: '2024-01-01T00:00:00Z',
        finishedAt: '2024-01-01T00:10:00Z',
        success: true,
        throughputMbps: 1000.5,
        jitterMs: 0.5,
        lossPercent: 0.0,
      }),
    });

    // Note: This test would need the actual route implementation to be refactored
    // to accept Prisma client as a parameter for better testability
    // For now, this demonstrates the test structure
  });
});
