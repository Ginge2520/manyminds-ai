import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ManyMinds AI",
  description: "Top AI agents. One team. One app.",
  icons: {
    icon: "/assets/manyminds-ai-logo.png",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
