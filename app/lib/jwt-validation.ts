import { CognitoJwtVerifier } from 'aws-jwt-verify';

// You'll need to replace these with your actual Cognito configuration
const COGNITO_USER_POOL_ID = import.meta.env.VITE_COGNITO_USER_POOL_ID || 'your-user-pool-id';
const COGNITO_CLIENT_ID = import.meta.env.VITE_COGNITO_CLIENT_ID || 'your-client-id';

// Create the verifier instance
const verifier = CognitoJwtVerifier.create({
  userPoolId: COGNITO_USER_POOL_ID,
  tokenUse: "access",
  clientId: COGNITO_CLIENT_ID,
});

export interface JWTPayload {
  sub: string;
  email?: string;
  username?: string;
  exp: number;
  iat: number;
  token_use: string;
  scope?: string;
  auth_time?: number;
  iss: string;
  client_id: string;
}

export interface TokenValidationResult {
  isValid: boolean;
  payload?: JWTPayload;
  error?: string;
  isExpired?: boolean;
}

export async function validateJWT(token: string): Promise<TokenValidationResult> {
  try {
    // Verify and decode the JWT
    const payload = await verifier.verify(token) as JWTPayload;
    
    // Check if token is expired (additional check)
    const currentTime = Math.floor(Date.now() / 1000);
    const isExpired = payload.exp < currentTime;
    
    if (isExpired) {
      return {
        isValid: false,
        error: "Token has expired",
        isExpired: true
      };
    }
    
    return {
      isValid: true,
      payload,
      isExpired: false
    };
  } catch (error: any) {
    console.error("JWT validation failed:", error);
    
    // Handle specific error types
    if (error.name === 'JwtExpiredError') {
      return {
        isValid: false,
        error: "Token has expired",
        isExpired: true
      };
    }
    
    if (error.name === 'JwtParseError') {
      return {
        isValid: false,
        error: "Invalid token format"
      };
    }
    
    return {
      isValid: false,
      error: error.message || "Token validation failed"
    };
  }
}

// Helper function to decode JWT without verification (for getting basic info)
export function decodeJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) {
      return null;
    }
    
    const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));
    return payload as JWTPayload;
  } catch (error) {
    console.error("Failed to decode JWT:", error);
    return null;
  }
}

// Helper to check if token is expired without full validation
export function isTokenExpired(token: string): boolean {
  const payload = decodeJWT(token);
  if (!payload || !payload.exp) {
    return true;
  }
  
  const currentTime = Math.floor(Date.now() / 1000);
  return payload.exp < currentTime;
}