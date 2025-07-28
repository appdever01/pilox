import { API_BASE_URL } from "./config";
import { auth } from "./auth";

interface ApiError {
  message: string;
  status: number;
}

class AuthApiClient {
  private static async handleResponse(response: Response) {
    const data = await response.json();
    if (!response.ok) {
      throw {
        message: data.message || data.error || "Something went wrong",
        status: response.status,
      } as ApiError;
    }
    return data;
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
        headers: {
          Authorization: `Bearer ${auth.getToken()}`,
        },
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
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${auth.getToken()}`,
          ...headers,
        },
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
        headers: {
          Authorization: `Bearer ${auth.getToken()}`,
        },
        credentials: "include",
      });

      return this.handleResponse(response);
    } catch (error) {
      throw error;
    }
  }

  static async postForm<T>(url: string, formData: FormData): Promise<T> {
    const token = auth.getToken();
    
    const response = await fetch(`${API_BASE_URL}${url}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data;
  }
}

export default AuthApiClient;
