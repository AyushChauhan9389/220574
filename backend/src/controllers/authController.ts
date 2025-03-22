import axios from "axios";
import { AuthResponse } from "../types/types";
import dotenv from "dotenv";

dotenv.config();

const BASE_URL = "http://20.244.56.144/test";

let authToken: string | null = null;
let tokenExpiry: number | null = null;

export const AuthFetcher = async (): Promise<string | null> => {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry * 1000) {
    return authToken;
  }
  try {
    const response = await axios.post<AuthResponse>(`${BASE_URL}/auth`, {
      companyName: process.env.COMPANY_NAME,
      clientID: process.env.CLIENT_ID,
      clientSecret: process.env.CLIENT_SECRET,
      ownerName: process.env.OWNER_NAME,
      ownerEmail: process.env.OWNER_EMAIL,
      rollNo: process.env.ROLL_NO,
    });
    authToken = response.data.access_token;
    tokenExpiry = response.data.expires_in;
    return authToken;
  } catch (error) {
    console.error("Error fetching auth token:", error);
    return null;
  }
};

export const fetchData = async <T>(endpoint: string): Promise<T | null> => {
  try {
    const token = await AuthFetcher();
    if (!token) {
      throw new Error("Failed to get auth token");
    }
    const response = await axios.get<T>(`${BASE_URL}/${endpoint}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return null;
  }
};
