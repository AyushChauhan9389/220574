import { Request, Response } from "express";
import { UsersResponse } from "../types/types";
import { fetchData } from "./authController";
import { fetchUserPosts } from "./postsController";

export const getUsers = async (_req: Request, res: Response) => {
  const usersResponse = await fetchData<UsersResponse>("users");
  if (!usersResponse || !usersResponse.users) {
    res.status(500).json({ error: "Failed to fetch users" });
    return;
  }

  const users: UsersResponse = usersResponse as UsersResponse;
  const userIds = Object.keys(users.users);

  const usersWithPostCounts = await Promise.all(
    userIds.map(async (userId) => {
      const posts = await fetchUserPosts(userId);
      return { id: userId, name: users.users[userId], postCount: posts.length };
    })
  );

  const topUsers = usersWithPostCounts
    .sort((a, b) => b.postCount - a.postCount)
    .slice(0, 5);
  res.json({ topUsers });
};
