import express, { Request, Response, Router } from "express";
import {
  ApiResponse,
  UsersResponse,
  PostsResponse,
  AuthResponse,
  TopUser,
  TopUsersResponse,
  ErrorResponse,
  Post,
} from "./types/types";
import axios from "axios";
import dotenv from "dotenv";

dotenv.config();
const app = express();
const router = Router();
const port = process.env.PORT || 3000;

const BASE_URL = "http://20.244.56.144/test";

let authToken: string | null = null;
let tokenExpiry: number | null = null;

app.use(express.json());
app.use(router);

const AuthFetcher = async (): Promise<string | null> => {
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

const fetchData = async <T extends ApiResponse>(endpoint: string): Promise<T | null> => {
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

const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const postsResponse = await fetchData<PostsResponse>(`users/${userId}/posts`);
  return postsResponse && postsResponse.posts ? postsResponse.posts : [];
};

router.get("/", (_req: Request, res: Response) => {
  res.send("Hello, TypeScript Express!");
});

app.get("/users", async (_req: Request, res: Response) => {

  const usersResponse = await fetchData<UsersResponse>("users");
  if (!usersResponse || !usersResponse.users) {
    res.status(500).json({ error: "Failed to fetch users" });
    return;
  }

  // Type the users response using the UsersResponse interface.
  const users: UsersResponse = usersResponse as UsersResponse;
  const userIds = Object.keys(users.users);

  // For each user, fetch their posts concurrently and count them
  const usersWithPostCounts = await Promise.all(
    userIds.map(async (userId) => {
      const posts = await fetchUserPosts(userId);
      return { id: userId, name: users.users[userId], postCount: posts.length };
    })
  );

  // Sort users by post count in descending order and pick the top 5
  const topUsers = usersWithPostCounts
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
  res.json({ topUsers });
});

app.get("/posts", async (_req: Request, res: Response) => {
  
  const postsResponse = await fetchData<PostsResponse>("posts");
  if (!postsResponse || !postsResponse.posts) {
    res.status(500).json({ error: "Failed to fetch posts" });
    return;
  }

  // Type the posts response using the PostsResponse interface.
  const posts: PostsResponse = postsResponse as PostsResponse;
  res.json(posts);
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
