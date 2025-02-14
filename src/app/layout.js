import './globals.css';

export const metadata = {
  title: 'Invoice Generator',
  description: 'Generate professional bills from Excel templates',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head />
      <body>{children}</body>
    </html>
  );
}