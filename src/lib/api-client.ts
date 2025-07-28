import { API_BASE_URL } from "./config";

interface ApiError {
  message: string;
  status: number;
}

class ApiClient {
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

  static async post<T>(
    endpoint: string,
    body: any,
    headers?: any,
  ): Promise<T> {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
}

export default ApiClient;
