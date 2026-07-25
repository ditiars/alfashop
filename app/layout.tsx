import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AlfaShop",
  description: "Aplikasi Warung Kelontong Digital",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet" />
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:wght,FILL@100..700,0..1&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased bg-gray-200 text-gray-900 min-h-screen">
        {children}
      </body>
    </html>
  );
}