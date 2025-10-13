'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Spinner } from '@/ui-components/Spinner/Spinner';
import { Button } from '@/ui-components/Button/Button';
import { Input } from '@/ui-components/Input/Input';
import { Option } from '@/ui-components/Select/ReactSelect';
import Pagination from '@/ui-components/Pagination/Pagination';

import dynamic from 'next/dynamic';
import styles from './Posts.module.css';

import { AnalyzePostsResponse, PostBase } from '@/types/models';
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
  const [filters, setFilters] = useState<{
    all_users: number[];
    all_flag_reasons: string[];
  }>(() => ({
    all_users: contextData.filters.all_users || [],
    all_flag_reasons: contextData.filters.all_flag_reasons || [],
  }));
  const [currentPage, setCurrentPage] = useState<number>(
    contextData.posts.current_page
  );
  const [totalPages, setTotalPages] = useState<number>(
    contextData.posts.total_pages
  );
  
  const [reasonFilter, setReasonFilter] = useState<Option | null>(null);
  const [userFilter, setUserFilter] = useState<Option | null>(null);
  const [orderBy, setOrderBy] = useState<Option | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [searchQuery, setSearchQuery] = useState<string>('');
  const debouncedSearchQuery = useDebounce(searchQuery, 700);

  const hasFetchedOnce = useRef(false);
  const initialContextPage = useRef(contextData.posts.current_page);

  // Reset page to 1 when filters or search changes (debounced)
  useEffect(() => {
    setCurrentPage(1);
  }, [reasonFilter, userFilter, orderBy, debouncedSearchQuery]);

  useEffect(() => {
    if (!hasFetchedOnce.current) {
      hasFetchedOnce.current = true;

      const isInitialState =
        currentPage === initialContextPage.current &&
        !reasonFilter &&
        !userFilter &&
        !orderBy &&
        !debouncedSearchQuery;

      if (isInitialState) return;
    }

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
        if (orderBy) params.append('order_by', orderBy.value);

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/posts/analyze-posts?${params.toString()}`
        );
        const data: AnalyzePostsResponse = await res.json();

        setPosts(data.posts.items);
        setTotalPages(data.posts.total_pages);
        setDuration(data.duration || 0);
        setFilters(data.filters);
      } catch (err) {
        console.error('Failed to fetch posts:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [currentPage, reasonFilter, userFilter, orderBy, debouncedSearchQuery]);

  const userOptions: Option[] =
    filters.all_users.map((uid) => ({
      value: uid.toString(),
      label: `User ${uid}`,
    })) || [];

  const reasonOptions: Option[] =
    filters.all_flag_reasons.map((reason) => ({
      value: reason,
      label: reason.replace(/_/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
    })) || [];

  const orderByOptions: Option[] = [
    { value: 'title:asc', label: 'Title ↑' },
    { value: 'title:desc', label: 'Title ↓' },
    { value: 'id:asc', label: 'ID ↑' },
    { value: 'id:desc', label: 'ID ↓' },
  ];

  return (
    <div className="container fullHeight centerWrapper">
      <div className={styles.duration}>
        <h3>The request to the API took {formatDuration(duration)}</h3>
        <p>Since the app is for showcase it is deployed on a very small node and on docker compose</p>
        <p>It can be a lot faster on proper cloud with kube or larger node running natively</p>
      </div>

      <div className={styles.filters}>
        <div>
          <ReactSelect
            options={reasonOptions}
            value={reasonFilter}
            onChange={(option) => setReasonFilter(option ?? null)}
            placeholder="Filter by Reason"
            isClearable
            isSearchable={true}
          />
        </div>

        <div>
          <ReactSelect
            options={userOptions}
            value={userFilter}
            onChange={(option) => setUserFilter(option ?? null)}
            placeholder="Filter by User"
            isClearable
            isSearchable={true}
          />
        </div>

        <div>
          <ReactSelect
            options={orderByOptions}
            value={orderBy}
            onChange={(option) => setOrderBy(option ?? null)}
            placeholder="Order by"
            isClearable
          />
        </div>

        <Input
          id="search"
          name="search"
          type="text"
          placeholder="Search by title..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          aria-label="Search by title"
        />
      </div>

      <h2 className={styles.heading}>Posts</h2>

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
                <p className={styles.author}>Post ID: {post.id}, User ID: {post.user_id}</p>
                <p className={styles.excerpt}>{post.body.slice(0, 120)}...</p>
                {post.flag_reason && (
                  <p className={styles.flag}>
                    {post.flag_reason}
                  </p>
                )}
                <div className={styles.cardActions}>
                  <Link href={`/post/${post.id}`}>
                    <Button
                      variant="primary"
                      width="100%"
                      icon="article"
                      iconPosition="left"
                    >
                      Read more
                    </Button>
                  </Link>
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
