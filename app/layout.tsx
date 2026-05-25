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
  const branch = process.env.VERCEL_GIT_COMMIT_REF ?? 'local'

  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <div style={{
          position: 'fixed',
          bottom: 12,
          right: 12,
          background: branch === 'RagIntegration' ? '#16a34a' : '#1e40af',
          color: '#fff',
          fontSize: 11,
          fontFamily: 'monospace',
          padding: '4px 10px',
          borderRadius: 999,
          zIndex: 9999,
          opacity: 0.85,
        }}>
          {branch}
        </div>
        {children}
      </body>
    </html>
  );
}