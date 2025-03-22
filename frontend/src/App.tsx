import { useEffect, useState } from "react"
import { FetchTopUsers, FetchPostsPopular, FetchLatestPosts } from "./actions/fetch"
import type { TopUser, Post, ExtendedPosts } from "./types/types"
import { RefreshCw } from "lucide-react"

type Tab = "users" | "posts" | "latest"

export default function App() {
  const [activeTab, setActiveTab] = useState<Tab>("users")
  const [topUsers, setTopUsers] = useState<TopUser[]>([])
  const [popularPosts, setPopularPosts] = useState<ExtendedPosts[]>([])
  const [latestPosts, setLatestPosts] = useState<Post[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isRefreshing, setIsRefreshing] = useState(false)

  const fetchData = async () => {
    setIsRefreshing(true)
    try {
      if (activeTab === "users") {
        const response = await FetchTopUsers()
        setTopUsers(response.topUsers)
      } else if (activeTab === "posts") {
        const response = await FetchPostsPopular()
        setPopularPosts(response.popularPosts)
      } else {
        const response = await FetchLatestPosts()
        setLatestPosts(response.latestPosts)
      }
      setError(null)
    } catch (err) {
      setError(`Failed to fetch ${activeTab === "users" ? "top users" : "popular posts"}`)
    } finally {
      setLoading(false)
      setIsRefreshing(false)
    }
  }

  useEffect(() => {
    setLoading(true)
    fetchData()

    const intervalId = setInterval(() => {
      fetchData()
    }, 15000)

    // Cleanup interval on component unmount
    return () => clearInterval(intervalId)
  }, [activeTab])

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex space-x-1 mb-6 border-b">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === "users"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Top Users
        </button>
        <button
          onClick={() => setActiveTab("posts")}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === "posts"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Popular Posts
        </button>
        <button
          onClick={() => setActiveTab("latest")}
          className={`px-4 py-2 font-medium transition-all ${
            activeTab === "latest"
              ? "text-black border-b-2 border-black"
              : "text-gray-500 hover:text-gray-900"
          }`}
        >
          Latest Posts
        </button>
      </div>

      {isRefreshing && (
        <div className="fixed top-4 right-4 bg-black text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg animate-pulse">
          <RefreshCw className="w-4 h-4 animate-spin" />
          <span className="text-sm font-medium">Refreshing...</span>
        </div>
      )}

      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        {activeTab === "users" ? "Top Users" : activeTab === "posts" ? "Popular Posts" : "Latest Posts"}
      </h1>

      {loading && (
        <div className="flex justify-center items-center h-40">
          <div className="animate-spin rounded-full h-12 w-12 border-2 border-gray-800"></div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4 rounded">
          <div className="flex">
            <div className="ml-3">
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!loading && !error && activeTab === "users" && (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {topUsers.map((user, index) => (
              <li
                key={user.id}
                className={`p-4 flex items-center justify-between hover:bg-gray-50 transition-all ${index < 3 ? "border-l-4 border-black" : ""
                  }`}
              >
                <div className="flex items-center">
                  <div
                    className={`
                    flex items-center justify-center w-8 h-8 rounded-full mr-4
                    ${index === 0
                        ? "bg-black text-white"
                        : index === 1
                          ? "bg-gray-800 text-white"
                          : index === 2
                            ? "bg-gray-700 text-white"
                            : "bg-gray-200 text-gray-800"
                      }
                  `}
                  >
                    {index + 1}
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>
                <div className="flex items-center">
                  <span className="bg-black text-white text-xs font-medium px-3 py-1 rounded-full">
                    {user.postCount} posts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && (activeTab === "posts" || activeTab === "latest") && (
        <div className="bg-white rounded-lg shadow-xl overflow-hidden border border-gray-100">
          <ul className="divide-y divide-gray-100">
            {(activeTab === "posts" ? popularPosts : latestPosts).map((post, index) => (
              <li
                key={index}
                className="p-4 hover:bg-gray-50 transition-all"
              >
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-600 font-medium">
                      {index + 1}
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-900">{post.content}</p>
                    <div className="flex items-center gap-2 mt-2">
                      <span className="text-xs text-gray-500">Post ID: {post.id}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {!loading && !error && 
        ((activeTab === "users" && topUsers.length === 0) || 
         ((activeTab === "posts" && popularPosts.length === 0) || 
          (activeTab === "latest" && latestPosts.length === 0))) && (
        <div className="text-center p-8 bg-gray-50 rounded-lg">
          <p className="text-gray-500">No users found</p>
        </div>
      )}

      <div className="mt-6 text-center">
        <button
          onClick={fetchData}
          disabled={isRefreshing}
          className="inline-flex items-center px-6 py-3 bg-black hover:bg-gray-900 text-white font-medium rounded-lg shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh Now
        </button>
      </div>
    </div>
  )
}
