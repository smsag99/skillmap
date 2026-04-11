import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "SkillMap — AI Career Coach",
  description: "From your CV to your dream job in 30 days",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        {children}
      </body>
    </html>
  );
}