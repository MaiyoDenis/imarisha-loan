import { QueryClient, QueryFunctionContext } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown
): Promise<Response> {
  const baseUrl = import.meta.env.VITE_API_URL || "";
  let finalUrl = url;
  
  if (baseUrl && url.startsWith("/api") && !url.startsWith("http")) {
    finalUrl = baseUrl + url.replace("/api", "");
  }

  const res = await fetch(finalUrl, {
    method,
    headers: data ? { "Content-Type": "application/json" } : {},
    body: data ? JSON.stringify(data) : undefined,
    credentials: "include",
  });
  await throwIfResNotOk(res);
  return res;
}

export const getQueryFn = <T = unknown>({
  on401,
}: {
  on401: "throw" | "returnNull";
}) => {
  return async ({ queryKey }: QueryFunctionContext) => {
    const baseUrl = import.meta.env.VITE_API_URL || "";
    let path = queryKey.join("/");
    let finalUrl = path;

    if (baseUrl && path.startsWith("/api") && !path.startsWith("http")) {
      finalUrl = baseUrl + path.replace("/api", "");
    }

    const res = await fetch(finalUrl, {
      credentials: "include",
    });

    if (on401 === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    return res.json() as Promise<T>;
  };
};

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
