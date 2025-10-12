import { ReactNode } from "react";
import { AnalyzePostsResponse } from "@/types/models";
import { PostsProvider } from "@/context/PostsContext";

async function fetchAnalyzePosts(): Promise<AnalyzePostsResponse> {
  const res = await fetch(`${process.env.NEXT_BACKEND_API_URL}/posts/analyze-posts`, {
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch posts analysis");
  }

  return res.json();
}

export default async function PostsLayout({ children }: { children: ReactNode }) {
  const data = await fetchAnalyzePosts();

  return <PostsProvider data={data}>{children}</PostsProvider>;
}
