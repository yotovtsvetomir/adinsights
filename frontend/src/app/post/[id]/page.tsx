import { notFound } from 'next/navigation';
import { Post } from '@/types/models';
import Image from 'next/image';
import Link from 'next/link';
import styles from './Post.module.css';
import { Button } from '@/ui-components/Button/Button';

interface PostPageProps {
  params: {
    id: string;
  };
}

async function fetchPostById(id: string): Promise<Post | null> {
  const res = await fetch(`${process.env.NEXT_BACKEND_API_URL}/posts/single/${id}`, {
    cache: 'no-store',
  });

  if (!res.ok) return null;

  return res.json();
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const post = await fetchPostById(id);

  if (!post) {
    notFound();
  }

  return (
    <div className="container fullHeight centerWrapper">
      <div className={`${styles.actions} ${post.id !== 1 ? styles.alignment : ""}`}>
        {post.id !== 1 &&
          <Link href={`/post/${post.id - 1}`}>
            <Button
              variant="primary"
              width="100%"
              icon="arrow_back"
              iconPosition="left"
            >
              Previous
            </Button>
          </Link>
        }

        <Link href={`/post/${post.id + 1}`}>
          <Button
            variant="primary"
            width="100%"
            icon="arrow_forward"
            iconPosition="right"
          >
            Next
          </Button>
        </Link>
      </div>

      <h1 className={styles.title}>{post.title}</h1>
      <p className={styles.meta}>
        Post ID:{post.id}, User ID:{post.user_id}
      </p>
      <div className={styles.imageWrapper}>
        <Image
          src={`https://picsum.photos/seed/${post.id}/700/450`}
          alt={post.title}
          width={700}
          height={450}
          className={styles.image}
          unoptimized
        />
      </div>

      <div className={styles.content}>
        {post.body}
      </div>
    </div>
  );
}
