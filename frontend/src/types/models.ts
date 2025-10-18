/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AnalyzePostsResponse {
  posts: PaginatedPosts;
  summary: SummaryPanel;
  filters: FiltersPanel;
  duration?: number | null;
}
export interface PaginatedPosts {
  items: PostBase[];
  total_count: number;
  current_page: number;
  page_size: number;
  total_pages: number;
}
export interface PostBase {
  id: number;
  user_id: number;
  title: string;
  body: string;
  flag_reason?: string | null;
}
export interface SummaryPanel {
  top_three_users: number[];
  common_words: WordCount[];
  bot_count: number;
  short_title_count: number;
  duplicate_count: number;
}
export interface WordCount {
  word: string;
  count: number;
}
export interface FiltersPanel {
  all_users: number[];
  all_flag_reasons: string[];
}
export interface PostCreate {
  id: number;
  user_id: number;
  title: string;
  body: string;
  flag_reason?: string | null;
}
export interface PostQueryParams {
  /**
   * Filter posts by reason
   */
  reason?: string | null;
  /**
   * Search posts by title
   */
  search?: string | null;
  /**
   * Filter posts by user ID
   */
  user_id?: number | null;
  /**
   * Order by column (e.g., 'title:asc' or 'title:desc')
   */
  order_by?: ("title:asc" | "title:desc" | "id:asc" | "id:desc") | null;
  page?: number;
  page_size?: number;
}
export interface PostResponse {
  id: number;
  user_id: number;
  title: string;
  body: string;
  flag_reason?: string | null;
}
