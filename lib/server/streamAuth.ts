type ClerkJwtHeader = {
  alg?: string;
  kid?: string;
};

type ClerkJwtPayload = {
  exp?: number;
  iss?: string;
  nbf?: number;
  sub?: string;
};

type ClerkJwks = {
  keys: Array<JsonWebKey & { kid?: string }>;
};

type CachedJwks = {
  expiresAt: number;
  value: ClerkJwks;
};

const JWKS_CACHE_MS = 5 * 60 * 1000;
let cachedJwks: CachedJwks | null = null;

function bytesToBase64Url(bytes: Uint8Array): string {
  let binary = "";

  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function stringToBase64Url(value: string): string {
  return bytesToBase64Url(new TextEncoder().encode(value));
}

function base64UrlToBytes(value: string): Uint8Array {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(
    normalized.length + ((4 - (normalized.length % 4)) % 4),
    "=",
  );
  const binary = atob(padded);

  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function base64UrlToArrayBuffer(value: string): ArrayBuffer {
  const bytes = base64UrlToBytes(value);
  const buffer = new ArrayBuffer(bytes.byteLength);
  new Uint8Array(buffer).set(bytes);
  return buffer;
}

function decodeBase64UrlString(value: string): string {
  return new TextDecoder().decode(base64UrlToBytes(value));
}

function getClerkFrontendApi(publishableKey: string): string {
  const match = publishableKey.match(/^pk_(?:test|live)_(.+)$/);

  if (!match) {
    throw new Error("Invalid Clerk publishable key format");
  }

  const host = decodeBase64UrlString(match[1]).replace(/\$$/, "");
  return `https://${host}`;
}

async function getClerkJwks(frontendApi: string): Promise<ClerkJwks> {
  if (cachedJwks && cachedJwks.expiresAt > Date.now()) {
    return cachedJwks.value;
  }

  const response = await fetch(`${frontendApi}/.well-known/jwks.json`);

  if (!response.ok) {
    throw new Error("Unable to load Clerk signing keys");
  }

  const value = (await response.json()) as ClerkJwks;
  cachedJwks = {
    value,
    expiresAt: Date.now() + JWKS_CACHE_MS,
  };

  return value;
}

export function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  return authorization?.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : null;
}

export async function verifyClerkRequest(
  request: Request,
): Promise<string | null> {
  const token = getBearerToken(request);
  const publishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;

  if (!token || !publishableKey) {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  let header: ClerkJwtHeader;
  let payload: ClerkJwtPayload;

  try {
    header = JSON.parse(decodeBase64UrlString(parts[0])) as ClerkJwtHeader;
    payload = JSON.parse(decodeBase64UrlString(parts[1])) as ClerkJwtPayload;
  } catch {
    return null;
  }

  if (header.alg !== "RS256" || !header.kid || !payload.sub) {
    return null;
  }

  const now = Math.floor(Date.now() / 1000);
  if ((payload.exp && payload.exp <= now) || (payload.nbf && payload.nbf > now)) {
    return null;
  }

  try {
    const frontendApi = getClerkFrontendApi(publishableKey);
    if (
      payload.iss !== frontendApi &&
      payload.iss !== `${frontendApi}/`
    ) {
      return null;
    }

    const jwks = await getClerkJwks(frontendApi);
    const jwk = jwks.keys.find((key) => key.kid === header.kid);
    if (!jwk) {
      return null;
    }

    const publicKey = await globalThis.crypto.subtle.importKey(
      "jwk",
      jwk,
      { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
      false,
      ["verify"],
    );
    const isValid = await globalThis.crypto.subtle.verify(
      "RSASSA-PKCS1-v1_5",
      publicKey,
      base64UrlToArrayBuffer(parts[2]),
      new TextEncoder().encode(`${parts[0]}.${parts[1]}`),
    );

    return isValid ? payload.sub : null;
  } catch {
    return null;
  }
}

async function createSignedStreamToken(
  payload: Record<string, boolean | number | string>,
  secret: string,
): Promise<string> {
  const issuedAt = Math.floor(Date.now() / 1000);
  const header = stringToBase64Url(
    JSON.stringify({ alg: "HS256", typ: "JWT" }),
  );
  const encodedPayload = stringToBase64Url(
    JSON.stringify({
      iat: issuedAt,
      exp: issuedAt + 60 * 60,
      ...payload,
    }),
  );
  const signingInput = `${header}.${encodedPayload}`;
  const signingKey = await globalThis.crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await globalThis.crypto.subtle.sign(
    "HMAC",
    signingKey,
    new TextEncoder().encode(signingInput),
  );

  return `${signingInput}.${bytesToBase64Url(new Uint8Array(signature))}`;
}

export function createStreamUserToken(
  userId: string,
  secret: string,
): Promise<string> {
  return createSignedStreamToken({ user_id: userId }, secret);
}

export function createStreamServerToken(secret: string): Promise<string> {
  return createSignedStreamToken({ server: true }, secret);
}
