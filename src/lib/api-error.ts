import { auth } from "./auth";
import { toast } from "react-toastify";

export interface ApiError {
  code?: string;
  status: number;
  message: string;
}

export class ApiRequestError extends Error {
  status: number;
  code?: string;

  constructor(message: string, status: number, code?: string) {
    super(message);
    this.name = "ApiRequestError";
    this.status = status;
    this.code = code;
  }
}

export const handleApiError = (error: any, router?: any): ApiError => {
  console.error("API Error:", error);

  // Network or connection errors
  if (!error.status && !error.response) {
    return {
      status: 0,
      message: "Network error. Please check your internet connection.",
    };
  }

  // Handle specific error status codes
  const status = error.status || error.response?.status;
  let message =
    error.message || error.response?.data?.message || "Something went wrong";
  let code = error.code || error.response?.data?.code;

  switch (status) {
    case 400:
      message = message || "Invalid request. Please check your input.";
      break;
    case 401:
      message = "Session expired. Please login again.";
      auth.removeToken();
      if (router) {
        setTimeout(() => {
          router.push("/login");
        }, 1500);
      }
      break;
    case 403:
      message = message || "You do not have permission to perform this action.";
      break;
    case 404:
      message = message || "Resource not found.";
      break;
    case 422:
      message = message || "Invalid input data.";
      break;
    case 429:
      message = "Too many requests. Please try again later.";
      break;
    case 500:
      message = "Server error. Please try again later.";
      break;
    default:
      if (status >= 500) {
        message = "Server error. Please try again later.";
      }
  }

  // Show toast for the error
  toast.error(message);

  return {
    status,
    message,
    code,
  };
};

export const apiCall = async <T>(
  endpoint: string,
  options: RequestInit = {},
  router?: any
): Promise<T> => {
  const API_URL = "https://api.pilox.com/api";
  const token = auth.getToken();

  try {
    const headers = new Headers({
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    });

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new ApiRequestError(
        error.message || "Request failed",
        response.status,
        error.code
      );
    }

    const data = await response.json();

    // Check if the response indicates an error despite a 200 status
    if (data.status === "error" || data.status === "fail") {
      throw new ApiRequestError(
        data.message || "Operation failed",
        response.status,
        data.code
      );
    }

    return data;
  } catch (error: any) {
    handleApiError(error, router);
    throw error; // Re-throw to allow component-level handling if needed
  }
};
