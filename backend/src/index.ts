import express, { Request, Response } from "express";
import { ApiResponse } from "./types/types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const port = process.env.PORT || 3000;

const BASE_URL = "http://20.244.56.144/test";

let authToken: string | null = null;
let tokenExpiry: number | null = null;

app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

const AuthFetcher = async (req: Request, res: Response) => {
  if (authToken && tokenExpiry && Date.now() < tokenExpiry * 1000) {
    return authToken;
  }
  try{
    const response = await axios.post(`${BASE_URL}/auth`, {
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
  } catch(error){
    console.error("Error fetching auth token:", error);
    return null;
  }
}

const fetchData = async (endpoint: string): Promise<ApiResponse | null> => {
  try {
    const response = await axios.get<ApiResponse>(`${BASE_URL}/${endpoint}`);
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error);
    return null;
  }
};






app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});