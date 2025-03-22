import { useEffect, useState } from "react"
import { FetchTopUsers } from "./actiosn/fetch";
import { TopUser } from "./types/types";

export default function App(){
  const [topUsers, setTopUsers] = useState<TopUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchTopUsers = async () => {
    setIsRefreshing(true);
    try {
      const response = await FetchTopUsers();
      setTopUsers(response.topUsers);
      setError(null);
    } catch (err) {
      setError("Failed to fetch top users");
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchTopUsers();
    
    const intervalId = setInterval(() => {
      fetchTopUsers();
    }, 5000);

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId);
  }, []);
  
  return(
    <div>
      {isRefreshing && (
        <div style={{ position: 'fixed', top: 10, right: 10 }}>
          Refreshing...
        </div>
      )}
      <h1>Top Users</h1>
      {loading && <p>Loading...</p>}
      {error && <p>{error}</p>}
      {!loading && !error && (
        <ul>
          {topUsers.map(user => (
            <li key={user.id}>
              {user.name} - Posts: {user.postCount}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}