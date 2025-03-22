import { TopUsersResponse } from "../types/types";

export async function FetchTopUsers(): Promise<TopUsersResponse> {
  const data = await fetch("http://localhost:8080/users");
  const users = (await data.json()) as TopUsersResponse;
  return users;
}
