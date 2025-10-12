"use client";

import React, { createContext, useContext } from "react";
import { AnalyzePostsResponse } from "@/types/models";

const PostsContext = createContext<AnalyzePostsResponse | null>(null);

export function PostsProvider({
  data,
  children,
}: {
  data: AnalyzePostsResponse;
  children: React.ReactNode;
}) {
  return (
    <PostsContext.Provider value={data}>
      {children}
    </PostsContext.Provider>
  );
}

export function usePostsData(): AnalyzePostsResponse {
  const context = useContext(PostsContext);
  if (!context) {
    throw new Error("usePostsData must be used within PostsProvider");
  }
  return context;
}
