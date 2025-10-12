import styles from './Footer.module.css';


export default function Footer() {
  return (
    <footer className={styles.footer}>
      <div className="container">
        <div className={styles.footer_inner}>
          <p>&copy; 2025 Post analysis</p>
        </div>
      </div>
    </footer>
  )
}
