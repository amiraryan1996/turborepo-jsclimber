import { Banner } from "fumadocs-ui/components/banner";
import "./global.css";
import { RootProvider } from "fumadocs-ui/provider";
// import { Inter } from "next/font/google";
import type { ReactNode } from "react";

// const inter = Inter({
//   subsets: ["latin"],
// });

export default function Layout({ children }: { children: ReactNode }) {
  return (
    // <html lang="en" className={inter.className} suppressHydrationWarning>
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>
          <Banner variant="rainbow" id="welcome-text">
            Welcome to the Jsclimber Document
          </Banner>
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
