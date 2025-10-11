"use client";

import React from "react";
import { AnalyzePostsResponse } from "../types/models";

interface ClientHomeProps {
  data: AnalyzePostsResponse;
}

function formatDuration(duration: number): string {
  const unit = duration < 1 ? "milliseconds" : (Math.abs(duration - 1) < 0.0001 ? "second" : "seconds");
  const rounded = duration.toFixed(3);
  return `${rounded} ${unit}`;
}

export default function ClientHome({ data }: ClientHomeProps) {

  return (
    <div>
      <p>The request took {formatDuration(data.duration)}</p>
      <p>Keep in mind this is deployed on a very small node and not using proper deployment</p>

      <h2>Titles shorter than 15 characters</h2>
      <ul>
        {data.shorter_titles_posts.map((post) => (
          <li key={post.id}>
            <b>{post.title}</b> (User {post.user_id})
          </li>
        ))}
      </ul>

      <h2>Duplicate titles by the same user</h2>
      <ul>
        {data.duplicates_posts.map((post) => (
          <li key={post.id}>
            <b>{post.title}</b> (User {post.user_id})
          </li>
        ))}
      </ul>

      <h2>Users with more than 5 posts having similar titles</h2>
      <ul>
        {data.bot_users_posts.map((post) => (
          <li key={post.id}>
            <b>{post.title}</b> (User {post.user_id})
          </li>
        ))}
      </ul>

      <h2>Identify the users (userId) with the most unique words across all their post titles</h2>
      <ul>
        {data.top_users_unique_words.map((user) => (
          <li key={user}>
            (User {user})
          </li>
        ))}
      </ul>

      <h2>Return the top three users based on this metric</h2>
      <ul>
        {data.top_three_users_posts.map((post) => (
          <li key={post.id}>
            <b>{post.title}</b> (User {post.user_id})
          </li>
        ))}
      </ul>

      <h2>Most Common Words</h2>
      <ul>
        {data.most_common_words.map((word) => (
          <li key={word}>{word}</li>
        ))}
      </ul>
    </div>
  );
}
