'use client';

import Link from 'next/link';
import { useAuthStore } from '@/lib/stores/auth-store';
import { useThemeStore } from '@/lib/stores/theme-store';
import { Button } from '@/components/ui/button';

export function Header() {
  const { user, isAuthenticated, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-gray-900/95 dark:border-gray-800">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <Link href="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-emerald-600 rounded-lg" />
          <span className="text-xl font-bold text-gray-900 dark:text-white">
            HydroWatch
          </span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6">
          {isAuthenticated ? (
            <>
              <Link
                href="/river"
                className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
              >
                River Tracker
              </Link>
              <Link
                href="/dams"
                className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
              >
                Dams
              </Link>
              <Link
                href="/groundwater"
                className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
              >
                Groundwater
              </Link>
              <Link
                href="/rainfall"
                className="text-gray-700 hover:text-green-600 dark:text-gray-300 dark:hover:text-green-400"
              >
                Rainfall
              </Link>
            </>
          ) : null}
        </nav>

        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
            aria-label="Toggle theme"
          >
            {theme === 'light' ? '🌙' : '☀️'}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-4">
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {user?.name}
              </span>
              <Button variant="outline" size="sm" onClick={logout}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  Login
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="primary" size="sm">
                  Sign Up
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

