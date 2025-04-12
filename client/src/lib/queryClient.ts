import { QueryClient, QueryFunction } from "@tanstack/react-query";

// Response cache to avoid repeated network requests for the same data
const responseCache = new Map<string, {data: any, timestamp: number}>();
const CACHE_TTL = 60000; // 1 minute cache TTL

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    try {
      // Try to parse JSON error response first
      const contentType = res.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const errorData = await res.json();
        throw new Error(`${res.status}: ${JSON.stringify(errorData)}`);
      } else {
        const text = (await res.text()) || res.statusText;
        throw new Error(`${res.status}: ${text}`);
      }
    } catch (e: any) {
      if (e.message.includes(`${res.status}`)) {
        throw e;
      }
      throw new Error(`${res.status}: ${res.statusText}`);
    }
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  // Add request ID for debugging
  const requestId = Math.random().toString(36).substring(2, 10);
  console.time(`API Request ${requestId}: ${method} ${url}`);
  
  try {
    const res = await fetch(url, {
      method,
      headers: {
        ...(data ? { "Content-Type": "application/json" } : {}),
        "X-Request-ID": requestId
      },
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
  
    await throwIfResNotOk(res);
    // Clone the response to return while also logging timing info
    const clonedRes = res.clone();
    console.timeEnd(`API Request ${requestId}: ${method} ${url}`);
    return clonedRes;
  } catch (error) {
    console.timeEnd(`API Request ${requestId}: ${method} ${url}`);
    console.error(`API Request ${requestId} failed:`, error);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const cacheKey = Array.isArray(queryKey) ? queryKey.join('|') : String(queryKey);
    
    // Check cache first
    const cached = responseCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL)) {
      console.log(`Using cached data for ${cacheKey}`);
      return cached.data;
    }
    
    // Add request ID for debugging
    const requestId = Math.random().toString(36).substring(2, 10);
    console.time(`Query ${requestId}: ${cacheKey}`);
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
        headers: {
          "X-Request-ID": requestId
        }
      });
  
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.timeEnd(`Query ${requestId}: ${cacheKey}`);
        return null;
      }
  
      await throwIfResNotOk(res);
      const data = await res.json();
      
      // Update cache
      responseCache.set(cacheKey, {
        data,
        timestamp: Date.now()
      });
      
      console.timeEnd(`Query ${requestId}: ${cacheKey}`);
      return data;
    } catch (error) {
      console.timeEnd(`Query ${requestId}: ${cacheKey}`);
      console.error(`Query ${requestId} failed:`, error);
      throw error;
    }
  };

// Function to clear cache entries
export function clearQueryCache(keyPattern?: string) {
  if (keyPattern) {
    // Clear specific cache entries that match the pattern
    const keysToDelete: string[] = [];
    responseCache.forEach((_, key) => {
      if (key.includes(keyPattern)) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => responseCache.delete(key));
    console.log(`Cleared ${keysToDelete.length} cache entries matching pattern: ${keyPattern}`);
  } else {
    // Clear all cache entries
    responseCache.clear();
    console.log('Cleared all cache entries');
  }
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 30000, // 30 seconds instead of Infinity for automatic updates
      retry: 1, // Allow one retry for network issues
      retryDelay: 1000, // 1 second between retries
    },
    mutations: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});
