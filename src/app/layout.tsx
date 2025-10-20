import "./globals.css";

// Force dynamic rendering to avoid prerender conflicts with Pages Router
export const dynamic = 'force-dynamic';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Skyward Checklists</title>
        <meta name="description" content="Employee checklist management system" />
      </head>
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
