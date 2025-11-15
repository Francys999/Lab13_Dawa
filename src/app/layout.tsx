import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import LogoutButton from "@/components/LogoutButton";
import Provider from "@/components/SessionProvider";

import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Next Auth App",
  description: "My Next Auth App",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  // Obtener la sesión en el servidor
  const session = await getServerSession(authOptions);

  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>

        {/* NAVBAR */}
        <nav className="w-full bg-black shadow-sm">
          <div className="mx-auto px-6 py-4 flex items-center justify-between">
            <Link href="/" className="text-xl font-semibold text-white">
              MyAuthApp
            </Link>

            <ul className="flex items-center justify-center gap-6 text-sm text-white">

              {/* Siempre visible */}
              <li>
                <Link href="/dashboard" className="hover:text-gray-300">
                  Dashboard
                </Link>
              </li>

              {/* Mostrar Profile solo si hay sesión */}
              {session?.user && (
                <li>
                  <Link href="/profile" className="hover:text-gray-300">
                    Profile
                  </Link>
                </li>
              )}

              {/* Logout solo si hay sesión */}
              {session?.user && (
                <li>
                  <LogoutButton />
                </li>
              )}

              {/* Avatar del usuario */}
              {session?.user?.image && (
                <li>
                  <Image
                    height={40}
                    width={40}
                    src={session.user.image}
                    alt="Profile"
                    className="w-10 h-10 rounded-full"
                  />
                </li>
              )}
            </ul>
          </div>
        </nav>

        {/* Provider para manejar la sesión en componentes cliente */}
        <Provider>
          <main>{children}</main>
        </Provider>

      </body>
    </html>
  );
}
