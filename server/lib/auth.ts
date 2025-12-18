import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

/**
 * Authenticates a request using an API key (secretKey).
 * Returns the node if authentication succeeds, null otherwise.
 */
export async function authenticateApiKey(apiKey: string | null | undefined) {
  if (!apiKey) return null;

  const node = await prisma.node.findFirst({
    where: { secretKey: apiKey },
  });

  return node;
}

/**
 * Extracts API key from request headers.
 * Supports both Authorization: Bearer <key> and X-API-Key: <key>
 */
export function getApiKeyFromRequest(request: Request): string | null {
  // Try Authorization header first (Bearer token)
  const authHeader = request.headers.get("authorization");
  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice(7);
  }

  // Fall back to X-API-Key header
  const apiKeyHeader = request.headers.get("x-api-key");
  if (apiKeyHeader) {
    return apiKeyHeader;
  }

  return null;
}
