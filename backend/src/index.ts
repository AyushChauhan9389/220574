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
  Comment,
  CommentsResponse,
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

const fetchPostComments = async (postId: number): Promise<Comment[]> => {
  const commentsResponse = await fetchData<CommentsResponse>(`posts/${postId}/comments`);
  return commentsResponse && commentsResponse.comments
    ? commentsResponse.comments
    : [];
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


app.get("/posts", async (req: Request, res: Response): Promise<any> => {
  const { type } = req.query;
  const usersResponse = await fetchData<UsersResponse>("users");
  if (!usersResponse || !usersResponse.users) {
    return res.status(500).json({ error: "Failed to fetch users" });
  }

  const userIds = Object.keys(usersResponse.users);
  let allPosts: Post[] = [];

  for (const userId of userIds) {
    const userPosts = await fetchUserPosts(userId);
    allPosts = allPosts.concat(userPosts);
  }

  if (type === "popular") {
    const postCommentCounts: Record<number, number> = {};

    for (const post of allPosts) {
      const comments = await fetchPostComments(post.id);
      postCommentCounts[post.id] = comments.length;
    }

    const maxComments = Math.max(...Object.values(postCommentCounts));
    const popularPosts = allPosts.filter(
      (post) => postCommentCounts[post.id] === maxComments
    );
    return res.json({ popularPosts });
  } else if (type === "latest") {
    const latestPosts = allPosts.sort((a, b) => b.id - a.id).slice(0, 5);
    return res.json({ latestPosts });
  }

  return res.status(400).json({ error: "Invalid type parameter" });
});


app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
