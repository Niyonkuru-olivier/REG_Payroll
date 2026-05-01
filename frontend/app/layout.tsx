import "./globals.css";

export const metadata = {
  title: "Reserve Force Payroll System",
  description: "Secure payroll platform",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}