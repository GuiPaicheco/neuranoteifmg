const API_HOST = import.meta.env.VITE_API_URL || "";
const BASE_URL = `${API_HOST}/api/v1`;

export function getFileUrl(path: string): string {
  if (!path) return "";
  if (path.startsWith("http://") || path.startsWith("https://") || path.startsWith("data:")) {
    return path;
  }
  // Ensure we don't double-slash or missing-slash
  const cleanHost = API_HOST.replace(/\/$/, "");
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return `${cleanHost}${cleanPath}`;
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string>;
}

class ApiClient {
  private getHeaders(isMultipart = false): HeadersInit {
    const token = localStorage.getItem("neuranote_token");
    const headers: Record<string, string> = {};

    if (!isMultipart) {
      headers["Content-Type"] = "application/json";
    }

    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    return headers;
  }

  private async request<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
    const { params, ...init } = options;
    
    // Construct URL with query parameters
    let url = `${BASE_URL}${endpoint}`;
    if (params) {
      const searchParams = new URLSearchParams(params);
      url += `?${searchParams.toString()}`;
    }

    const isMultipart = init.body instanceof FormData;
    const headers = this.getHeaders(isMultipart);

    const response = await fetch(url, {
      ...init,
      headers: {
        ...headers,
        ...(init.headers || {}),
      },
    });

    if (!response.ok) {
      if (response.status === 401) {
        // Clear expired session
        localStorage.removeItem("neuranote_token");
      }
      let errorDetail = "Ocorreu um erro no servidor";
      try {
        const errorData = await response.json();
        errorDetail = errorData.detail || errorDetail;
      } catch (_) {
        // Fallback to text if JSON parse fails
        try {
          const text = await response.text();
          if (text) errorDetail = text;
        } catch (__) {}
      }
      throw new Error(errorDetail);
    }

    // 204 No Content has no body
    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  get<T>(endpoint: string, params?: Record<string, string>): Promise<T> {
    return this.request<T>(endpoint, { method: "GET", params });
  }

  post<T>(endpoint: string, body?: any): Promise<T> {
    const isFormData = body instanceof FormData;
    return this.request<T>(endpoint, {
      method: "POST",
      body: isFormData ? body : JSON.stringify(body),
    });
  }

  put<T>(endpoint: string, body?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: "PUT",
      body: JSON.stringify(body),
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: "DELETE" });
  }
}

export const api = new ApiClient();
