import "./globals.css";
import Providers from "./providers";
import { Navbar } from "../components/navbar";

export const metadata = {
  title: "HOPE_IRL | Career Support Partner",
  description: "Career consultancy web application - HOPE_IRL"
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <div className="min-h-screen bg-cloud-gradient relative overflow-hidden">
            <div className="cloud-noise" />
            <div className="cloud-blob blob-a" />
            <div className="cloud-blob blob-b" />
            <div className="cloud-blob blob-c" />
            <Navbar />
            <main className="relative z-10 mx-auto w-full max-w-6xl px-4 py-8">
              {children}
            </main>
            <footer className="relative z-10 py-8 text-center text-white/50 text-sm">
              © {new Date().getFullYear()} HOPE_IRL • Your Trusted Career Support Partner
            </footer>
          </div>
        </Providers>
      </body>
    </html>
  );
}
