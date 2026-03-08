import axios from "axios";
import { api } from "./api";

interface AuthResponse {
  token: string;
}

interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

interface LoginPayload {
  email: string;
  password: string;
}

interface ApiErrorPayload {
  message?: string;
  error?: string;
}

const registerUser = async (payload: RegisterPayload) => {
  const { data } = await api.post<AuthResponse>("/register", payload);
  return data;
};

const loginUser = async (payload: LoginPayload) => {
  const { data } = await api.post<AuthResponse>("/login", payload);
  return data;
};

const getAuthErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<ApiErrorPayload>(error)) {
    return (
      error.response?.data?.message ??
      error.response?.data?.error ??
      "Unable to complete the request. Please try again."
    );
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return "Unable to complete the request. Please try again.";
};

export { getAuthErrorMessage, loginUser, registerUser };
export type { AuthResponse, LoginPayload, RegisterPayload };
