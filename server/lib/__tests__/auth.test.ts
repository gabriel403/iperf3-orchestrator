import { getApiKeyFromRequest } from '../auth';

describe('getApiKeyFromRequest', () => {
  it('should extract API key from Authorization Bearer header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'Authorization': 'Bearer test-api-key-123',
      },
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBe('test-api-key-123');
  });

  it('should extract API key from X-API-Key header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'X-API-Key': 'test-api-key-456',
      },
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBe('test-api-key-456');
  });

  it('should prefer Authorization header over X-API-Key header', () => {
    const request = new Request('http://example.com', {
      headers: {
        'Authorization': 'Bearer bearer-key',
        'X-API-Key': 'x-api-key',
      },
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBe('bearer-key');
  });

  it('should return null when no API key is provided', () => {
    const request = new Request('http://example.com', {
      headers: {},
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBeNull();
  });

  it('should return null when Authorization header does not start with Bearer', () => {
    const request = new Request('http://example.com', {
      headers: {
        'Authorization': 'Basic base64-encoded-credentials',
      },
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBeNull();
  });

  it('should handle Authorization header with only "Bearer" (no key)', () => {
    const request = new Request('http://example.com', {
      headers: {
        'Authorization': 'Bearer ',
      },
    });

    const apiKey = getApiKeyFromRequest(request);
    expect(apiKey).toBe('');
  });
});
