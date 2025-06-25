import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import { Toaster } from "react-hot-toast";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata = {
  title: "Student-Teacher Booking App",
  description: "Book appointments between students and teachers",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} font-sans bg-slate-50 min-h-screen flex flex-col`}
      >
        <Navbar />
        <main className="container mx-auto p-4 flex-grow">{children}</main>
        <footer className="bg-gray-900 text-white text-center py-4 text-sm">
          &copy; {new Date().getFullYear()} Student-Teacher Booking App
        </footer>
        <Toaster 
          position="top-right" 
          toastOptions={{
            style: {
              background: '#FFFFFF',
              color: '#333333',
              boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
              borderRadius: '0.5rem',
              padding: '0.75rem 1rem',
            },
            success: {
              style: {
                border: '1px solid #D1FAE5',
                backgroundColor: '#ECFDF5',
              },
              iconTheme: {
                primary: '#10B981',
                secondary: '#ECFDF5',
              },
            },
            error: {
              style: {
                border: '1px solid #FEE2E2',
                backgroundColor: '#FEF2F2',
              },
              iconTheme: {
                primary: '#EF4444',
                secondary: '#FEF2F2',
              },
            },
          }}
        />
      </body>
    </html>
  );
}
