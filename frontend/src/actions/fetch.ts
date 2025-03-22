import { FetchPopularResponse, TopUsersResponse } from "../types/types";

export async function FetchTopUsers(): Promise<TopUsersResponse> {
  const data = await fetch("http://localhost:8080/users");
  const users = (await data.json()) as TopUsersResponse;
  return users;
}


export async function FetchPostsPopular() : Promise<FetchPopularResponse> {
  const data = await fetch("http://localhost:8080/posts?type=popular");
  const posts = (await data.json()) as FetchPopularResponse;
  return posts;

}