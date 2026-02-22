import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from "react";
import { validateJWT, type JWTPayload } from "./jwtValidation";

export interface TokenData {
  token: string;
  refreshToken: string;
  expiresAt?: number;
}

interface AuthContextType {
  isAuthenticated: boolean;
  tokens: TokenData | null;
  setTokens: (tokens: TokenData | null) => void;
  logout: () => void;
  isValidating: boolean;
  isInitializing: boolean;
  userPayload: JWTPayload | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const TOKEN_STORAGE_KEY = "gym-tracker-tokens";

export function AuthProvider({ children }: { children: ReactNode }) {
  console.log('[DEBUG] AuthProvider rendering');
  const [tokens, setTokensState] = useState<TokenData | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [userPayload, setUserPayload] = useState<JWTPayload | null>(null);
  const lastValidatedToken = useRef<string | null>(null);

  // Load tokens from localStorage on mount
  useEffect(() => {
    console.log('[DEBUG] AuthProvider useEffect - loading tokens from localStorage');
    const storedTokens = localStorage.getItem(TOKEN_STORAGE_KEY);
    if (storedTokens) {
      try {
        const parsed = JSON.parse(storedTokens) as TokenData;
        setTokensState(parsed);
        // Keep isInitializing = true until JWT validation completes
      } catch (error) {
        console.error("Failed to parse stored tokens:", error);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        setIsInitializing(false);
      }
    } else {
      setIsInitializing(false);
    }
  }, []);

  const setTokens = useCallback((newTokens: TokenData | null) => {
    setTokensState(newTokens);
    if (newTokens) {
      localStorage.setItem(TOKEN_STORAGE_KEY, JSON.stringify(newTokens));
    } else {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
    }
  }, []);

  const logout = () => {
    setTokens(null);
    setUserPayload(null);
  };

  // validate JWT when tokens change
  useEffect(() => {
    const doValidation = async () => {
      if (
        tokens &&
        !isValidating &&
        lastValidatedToken.current !== tokens.token
      ) {
        setIsValidating(true);

        try {
          const validation = await validateJWT(tokens.token);

          if (validation.isValid && validation.payload) {
            setUserPayload(validation.payload);
            lastValidatedToken.current = tokens.token;
          } else {
            console.info("Token validation failed:", validation.error);
            setUserPayload(null);
            lastValidatedToken.current = null;
            // Clear invalid tokens
            if (validation.isExpired) {
              setTokensState(null);
              localStorage.removeItem(TOKEN_STORAGE_KEY);
            }
          }
        } catch (error) {
          console.error("Token validation error:", error);
          setUserPayload(null);
          lastValidatedToken.current = null;
          setTokensState(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        } finally {
          setIsValidating(false);
          setIsInitializing(false);
        }
      } else if (!tokens) {
        setUserPayload(null);
        lastValidatedToken.current = null;
      }
    };

    doValidation();
  }, [tokens, isValidating]);

  const isAuthenticated = tokens !== null && userPayload !== null;

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        tokens,
        setTokens,
        logout,
        isValidating,
        isInitializing,
        userPayload,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
