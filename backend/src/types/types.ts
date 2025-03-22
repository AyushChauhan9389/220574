export interface User {
  id: string;
  name: string;
  postCount?: number;
}

export interface Post {
  id: number;
  userid: string;
  content: string;
}

export interface Comment {
  id: number;
  postid: string;
  content: string;
}

export interface AuthResponse {
  access_token: string;
  expires_in: number;
}

export interface UserRecord {
  [userId: string]: string;  
}

export interface UsersResponse {
  users: UserRecord;
}


export interface PostsResponse {
  posts: Post[];
}

export interface CommentsResponse {
  comments: Comment[];
}

export type ApiResponse = UsersResponse | PostsResponse | CommentsResponse;

export interface TopUser {
  id: string;
  name: string;
  postCount: number;
}

export interface TopUsersResponse {
  topUsers: TopUser[];
}

export interface ErrorResponse {
  error: string;
}
