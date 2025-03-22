import { Request, Response } from "express";
import { Post, PostsResponse, CommentsResponse, UsersResponse, Comment } from "../types/types";
import { fetchData } from "./authController";

export const fetchUserPosts = async (userId: string): Promise<Post[]> => {
  const postsResponse = await fetchData<PostsResponse>(`users/${userId}/posts`);
  return postsResponse && postsResponse.posts ? postsResponse.posts : [];
};

const fetchPostComments = async (postId: number): Promise<Comment[]> => {
  const commentsResponse = await fetchData<CommentsResponse>(`posts/${postId}/comments`);
  return commentsResponse && commentsResponse.comments
    ? commentsResponse.comments
    : [];
};

export const getPosts = async (req: Request, res: Response): Promise<any> => {
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
};
