/* tslint:disable */
/* eslint-disable */
/**
/* This file was automatically generated from pydantic models by running pydantic2ts.
/* Do not modify it by hand - just update the pydantic models and then re-run the script
*/

export interface AnalyzePostsResponse {
  shorter_titles_posts: PostBase[];
  duplicates_posts: PostBase[];
  bot_users_posts: PostBase[];
  top_users_unique_words: number[];
  top_three_users_posts: PostBase[];
  most_common_words: string[];
  duration?: number | null;
}
export interface PostBase {
  id: number;
  user_id: number;
  title: string;
  body: string;
}
export interface PostCreate {
  id: number;
  user_id: number;
  title: string;
  body: string;
}
export interface PostResponse {
  id: number;
  user_id: number;
  title: string;
  body: string;
}
