const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

interface RequestOptions extends RequestInit {
  data?: any;
}

export async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const { data, headers = {}, ...customConfig } = options;
  const token = localStorage.getItem("token");

  const defaultHeaders: Record<string, string> = {};

  // Attach JWT Bearer token if user is authenticated
  if (token) {
    defaultHeaders["Authorization"] = `Bearer ${token}`;
  }

  // If request has data and is not FormData, treat as JSON
  let body: any = customConfig.body;
  if (data !== undefined) {
    if (data instanceof FormData) {
      body = data;
    } else {
      defaultHeaders["Content-Type"] = "application/json";
      body = JSON.stringify(data);
    }
  }

  const config: RequestInit = {
    ...customConfig,
    headers: {
      ...defaultHeaders,
      ...(headers as Record<string, string>),
    },
    body,
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, config);
  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(result.message || `Request failed with status ${response.status}`);
  }

  return result;
}

export const api = {
  get: <T = any>(url: string, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "GET", headers }),
  post: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "POST", data, headers }),
  put: <T = any>(url: string, data?: any, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "PUT", data, headers }),
  delete: <T = any>(url: string, headers?: Record<string, string>) =>
    apiRequest<T>(url, { method: "DELETE", headers }),
};
