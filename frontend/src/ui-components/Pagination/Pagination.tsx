'use client';

import { useEffect, useState } from 'react';
import styles from './Pagination.module.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

// Hook to detect mobile screen width
function useIsMobile(breakpoint = 768) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= breakpoint);
    };

    handleResize(); // initial check
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [breakpoint]);

  return isMobile;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  const isMobile = useIsMobile();

  if (totalPages <= 1) return null;

  const handlePageClick = (page: number, shouldScroll: boolean = true) => {
    if (page >= 1 && page <= totalPages) {
      onPageChange(page);
      if (shouldScroll) {
        setTimeout(() => {
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 0);
      }
    }
  };

  const getPageNumbers = () => {
    const pages: (number | 'prev-ellipsis' | 'next-ellipsis')[] = [];

    if (isMobile) {
      // Mobile logic: < 1 ... currentPage ... totalPages >
      pages.push(1);

      if (currentPage > 2) {
        pages.push('prev-ellipsis');
      }

      if (currentPage !== 1 && currentPage !== totalPages) {
        pages.push(currentPage);
      }

      if (currentPage < totalPages - 1) {
        pages.push('next-ellipsis');
      }

      if (totalPages !== 1) {
        pages.push(totalPages);
      }

      return pages;
    }

    // Desktop logic
    const totalButtons = 7; // total buttons including ellipsis

    if (totalPages <= totalButtons) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }

    pages.push(1);

    const leftSibling = Math.max(currentPage - 1, 2);
    const rightSibling = Math.min(currentPage + 1, totalPages - 1);

    if (currentPage <= 4) {
      for (let i = 2; i <= 5; i++) pages.push(i);
      pages.push('next-ellipsis');
    } else if (currentPage >= totalPages - 3) {
      pages.push('prev-ellipsis');
      for (let i = totalPages - 4; i < totalPages; i++) pages.push(i);
    } else {
      pages.push('prev-ellipsis');
      pages.push(leftSibling);
      pages.push(currentPage);
      pages.push(rightSibling);
      pages.push('next-ellipsis');
    }

    pages.push(totalPages);
    return pages;
  };

  const pageItems = getPageNumbers().map((page, index) => {
    if (page === 'prev-ellipsis') {
      return (
        <button
          key={`prev-ellipsis-${index}`}
          className={styles.pageButton}
          onClick={() => handlePageClick(Math.max(currentPage - 3, 1), false)}
        >
          ...
        </button>
      );
    }

    if (page === 'next-ellipsis') {
      return (
        <button
          key={`next-ellipsis-${index}`}
          className={styles.pageButton}
          onClick={() => handlePageClick(Math.min(currentPage + 3, totalPages), false)}
        >
          ...
        </button>
      );
    }

    return (
      <button
        key={page}
        className={`${styles.pageButton} ${page === currentPage ? styles.active : ''}`}
        onClick={() => handlePageClick(Number(page))}
      >
        {page}
      </button>
    );
  });

  return (
    <div className={styles.pagination}>
      <button
        onClick={() => handlePageClick(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${styles.left} ${styles.navButton}`}
      >
        <span className="material-symbols-outlined">keyboard_arrow_left</span>
      </button>

      {pageItems}

      <button
        onClick={() => handlePageClick(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={styles.navButton}
      >
        <span className="material-symbols-outlined">keyboard_arrow_right</span>
      </button>
    </div>
  );
}
