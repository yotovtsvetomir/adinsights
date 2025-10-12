'use client';

import React, { useEffect, useState } from 'react';
import Image from 'next/image';
import { Spinner } from '@/ui-components/Spinner/Spinner';
import { Button } from '@/ui-components/Button/Button';
import { Input } from '@/ui-components/Input/Input';
import { Option } from '@/ui-components/Select/ReactSelect';
import Pagination from '@/ui-components/Pagination/Pagination';

import dynamic from 'next/dynamic';
import styles from './Posts.module.css';

import { AnalyzePostsResponse, PostBase, SummaryPanel } from '@types/models';
import { usePostsData } from '@/context/PostsContext';

const ReactSelect = dynamic(() => import('@/ui-components/Select/ReactSelect'), {
  ssr: false,
});

function formatDuration(duration: number): string {
  const unit =
    duration < 1
      ? 'milliseconds'
      : Math.abs(duration - 1) < 0.0001
      ? 'second'
      : 'seconds';
  const rounded = duration.toFixed(3);
  return `${rounded} ${unit}`;
}

const pageSize = 10;

// Debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedValue(value), delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
}

export default function PostsPage() {
  const contextData = usePostsData();
  const [posts, setPosts] = useState<PostBase[]>(contextData.posts.items);
  const [duration, setDuration] = useState<number>(contextData.duration ?? 0);
  const [summary, setSummary] = useState<SummaryPanel>(contextData.summary);
  const [currentPage, setCurrentPage] = useState<number>(
    contextData.posts.current_page
  );
  const [totalPages, setTotalPages] = useState<number>(
    contextData.posts.total_pages
  );
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [reasonFilter, setReasonFilter] = useState<Option | null>(null);
  const [userFilter, setUserFilter] = useState<Option | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const reasonOptions: Option[] = [
    { value: 'bot', label: 'Bot' },
    { value: 'short_title', label: 'Short Title' },
    { value: 'duplicate', label: 'Duplicate' },
  ];

  const debouncedSearchQuery = useDebounce(searchQuery, 700);

  // Reset page to 1 when filters or search changes (debounced)
  useEffect(() => {
    setCurrentPage(1);
  }, [reasonFilter, userFilter, debouncedSearchQuery]);

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      try {
        const params = new URLSearchParams({
          page: String(currentPage),
          page_size: String(pageSize),
        });

        if (debouncedSearchQuery) params.append('search', debouncedSearchQuery);
        if (reasonFilter) params.append('reason', reasonFilter.value);
        if (userFilter) params.append('user_id', userFilter.value);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/analyze-posts?${params.toString()}`
        );
        const data: AnalyzePostsResponse = await res.json();

        setPosts(data.posts.items);
        setTotalPages(data.posts.total_pages);
        setDuration(data.duration || 0);
        setSummary(data.summary);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, reasonFilter, userFilter, debouncedSearchQuery]);

  const userOptions: Option[] =
    summary?.top_three_users.map((uid) => ({
      value: uid.toString(),
      label: `User ${uid}`,
    })) || [];

  return (
    <div className="container fullHeight centerWrapper">
      <div className={styles.duration}>
        <h3>The request to the API took {formatDuration(duration)}</h3>
        <p>Keep in mind the app is deployed on a very small node</p>
      </div>

      <div className={styles.filters}>
        <div>
          <ReactSelect<Option>
            options={reasonOptions}
            value={reasonFilter}
            onChange={setReasonFilter}
            placeholder="Filter by Reason"
            isClearable
          />
        </div>

        <div>
          <ReactSelect<Option>
            options={userOptions}
            value={userFilter}
            onChange={setUserFilter}
            placeholder="Filter by User"
            isClearable
          />
        </div>

        <Input
          type="text"
          placeholder="Search by title..."
          className={styles.searchInput}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search by title"
        />
      </div>

      <h2 className={styles.heading}>All Posts</h2>

      {loading ? (
        <Spinner size={50} color="var(--color-highlight-1)" />
      ) : (
        <>
          <div className={styles.posts}>
            {posts.map((post) => (
              <div key={post.id} className={styles.card}>
                <div className={styles.imageWrapper}>
                  <Image
                    src={`https://picsum.photos/seed/${post.id}/600/400`}
                    alt={post.title}
                    fill
                    className={styles.image}
                    unoptimized
                    style={{ objectFit: 'cover' }}
                  />
                </div>
                <h2 className={styles.title}>{post.title}</h2>
                <p className={styles.author}>User ID: {post.user_id}</p>
                <p className={styles.excerpt}>{post.body.slice(0, 120)}...</p>
                {post.flag_reason && (
                  <p className={styles.flag}>
                    Reason: <strong>{post.flag_reason}</strong>
                  </p>
                )}
                <div className={styles.cardActions}>
                  <Button
                    variant="primary"
                    width="100%"
                    icon="article"
                    iconPosition="left"
                  >
                    Read more
                  </Button>
                </div>
              </div>
            ))}
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
          />

          <div className={styles.space}></div>
        </>
      )}
    </div>
  );
}
