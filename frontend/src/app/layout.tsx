import Header from "@/components/Header/Header";
import Footer from "@/components/Footer/Footer";
import { Nunito } from "next/font/google";
import "../styles/globals.css";

const nunito = Nunito({
  variable: '--font-nunito',
  subsets: ['latin'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined&display=optional"
          rel="stylesheet"
        />
      </head>
      <body className={nunito.variable}>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
