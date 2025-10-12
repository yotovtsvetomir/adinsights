'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import styles from './Header.module.css';
import Logo from '@/assets/logo.png';

const navLinks = [
  { label: 'Summary', href: '/posts/summary' },
  { label: 'Posts', href: '/posts' },
];

export default function Header() {
  const pathname = usePathname();

  return (
    <header className={styles.header}>
      <div className="container">
        <div className={styles.header_inner}>

          <Link href="/" className={styles.logo_link}>
            <div className={styles.logo_container}>
              <Image 
                src={Logo}
                alt="Logo" 
                width={40}
                height={40} 
              />
              <h3>Post Analysis</h3>
            </div>
          </Link>

          <nav className={styles.navigation}>
            {navLinks.map(({ label, href }) => (
              <Link
                key={href}
                href={href}
                className={`${styles.nav_link} ${pathname === href ? styles.selected : ''}`}
              >
                {label}
              </Link>
            ))}
          </nav>
          
        </div>
      </div>
    </header>
  );
}
