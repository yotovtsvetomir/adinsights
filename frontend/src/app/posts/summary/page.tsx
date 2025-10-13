"use client";

import React from "react";
import styles from "./Summary.module.css";

import Image from "next/image";
import ProfileImage1 from "@/assets/profile_image_1.jpg";
import ProfileImage2 from "@/assets/profile_image_2.jpg";
import ProfileImage3 from "@/assets/profile_image_3.jpg";

import { usePostsData } from "@/context/PostsContext";

export default function SummaryClient() {
  const data = usePostsData();

  const profileImages = [ProfileImage1, ProfileImage2, ProfileImage3];
  const medals = ["🥇", "🥈", "🥉"];
  const imageSizes = [120, 100, 90];

  return (
    <div className="container fullHeight centerWrapper">
      <div className={styles.summarySection}>
        <div className={styles.top_three}>
          <h2>Most unique words in titles</h2>
          <ul className={styles.topThreeList}>
            {data.summary.top_three_users.map((userId, index) => (
              <li
                key={userId}
                className={`${styles.userItem} ${
                  index === 0
                    ? styles.firstPlace
                    : index === 1
                    ? styles.secondPlace
                    : styles.thirdPlace
                }`}
              >
                <Image
                  src={profileImages[index]}
                  alt={`Profile Image ${index + 1}`}
                  width={imageSizes[index]}
                  height={imageSizes[index]}
                  className={styles.profileImage}
                />
                <p>
                  {medals[index]} User #{userId}
                </p>
              </li>
            ))}
          </ul>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.common_words}>
          <h2>Most frequently used words in titles</h2>
          <div className={styles.wordCloud}>
            {data.summary.common_words.map(({ word, count }, index) => (
              <div
                className={styles.wordBlob}
                key={word}
                style={{
                  backgroundColor: `hsl(${(index * 40) % 360}, 70%, 80%)`,
                }}
              >
                <span>{word}</span>
                <span>({count})</span>
              </div>
            ))}
          </div>
        </div>

        <div className={styles.divider}></div>

        <div className={styles.flag_counts}>
          <h2>Post Flag Counts</h2>
          <ul>
            <li>
              <span
                className="material-symbols-outlined"
                title="Bot posts"
              >
                robot_2
              </span>
              <span>Bot posts</span>
              <span>{data.summary.bot_count}</span>
            </li>
            <li>
              <span
                className="material-symbols-outlined"
                title="Short title"
              >
                short_text
              </span>
              <span>Short title posts</span>
              <span>{data.summary.short_title_count}</span>
            </li>
            <li>
              <span
                className="material-symbols-outlined"
                title="Duplicate titles"
              >
                content_copy
              </span>
              <span>Duplicate titles (same user)</span>
              <span>{data.summary.duplicate_count}</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}
