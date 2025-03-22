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

export interface ApiResponse {
  users?: Record<string, string>;
  posts?: Post[];
  comments?: Comment[];
}
