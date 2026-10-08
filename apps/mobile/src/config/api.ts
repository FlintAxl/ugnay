import axios from "axios";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";

// Use environment variable if provided, otherwise default to LAN or Android emulator loopback
export const getApiBaseUrl = (): string => {
  if (process.env.EXPO_PUBLIC_API_URL) {
    return process.env.EXPO_PUBLIC_API_URL;
  }
  // If running on Android emulator, 10.0.2.2 maps to the host machine's localhost
  // If running on physical Android device over Wi-Fi, use the LAN IP: 192.168.100.97
  return Platform.OS === "android"
    ? "http://192.168.100.97:8000"
    : "http://localhost:8000";
};

export const API_BASE_URL = getApiBaseUrl();

export const api = axios.create({
  baseURL: `${API_BASE_URL}/api/v1`,
  timeout: 15000,
  headers: {
    "Accept": "application/json",
  },
});

// Interceptor to attach JWT token if stored
api.interceptors.request.use(async (config) => {
  try {
    const token = await SecureStore.getItemAsync("ugnay_access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (error) {
    // SecureStore might not be available in standard browser
  }
  return config;
});

