import { API_BASE_URL } from "./config";
import { auth } from "./auth";

interface ApiError {
  message: string;
  status: number;
}

class AuthApiClient {
  private static async handleResponse(response: Response) {
    if (response.status === 401) {
      auth.removeToken();
      throw {
        message: "Session expired. Please login again.",
        status: 401,
      } as ApiError;
    }

    const data = await response.json();
    if (!response.ok) {
      throw {
        message: data.message || data.error || "Something went wrong",
        status: response.status,
      } as ApiError;
    }
    return data;
  }

  private static getHeaders(additionalHeaders?: Record<string, string>) {
    const token = auth.getToken();
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...additionalHeaders,
    };
    return headers;
  }

  static async get<T>(endpoint: string, queryParams?: Record<string, string>): Promise<T> {
    try {
      const url = new URL(`${API_BASE_URL}${endpoint}`);
      if (queryParams) {
        Object.entries(queryParams).forEach(([key, value]) => {
          url.searchParams.append(key, value);
        });
      }

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: this.getHeaders(),
        credentials: "include",
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async post<T>(endpoint: string, body: any, headers?: Record<string, string>): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: this.getHeaders(headers),
        credentials: "include",
        body: JSON.stringify(body),
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async delete<T>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "DELETE",
        headers: this.getHeaders(),
        credentials: "include",
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async postForm<T>(url: string, formData: FormData): Promise<T> {
    const token = auth.getToken();
    const headers: Record<string, string> = token ? { Authorization: `Bearer ${token}` } : {};
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers,
      credentials: 'include',
      body: formData
    });

    if (response.status === 401) {
      auth.removeToken();
      throw new Error("Session expired. Please login again.");
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}

export default AuthApiClient;
