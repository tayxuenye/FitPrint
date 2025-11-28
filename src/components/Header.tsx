'use client';

import Link from 'next/link';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
}

export default function Header({ title = 'FitPrint', showBack = false }: HeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border-b border-zinc-200 dark:border-zinc-700 z-50">
      <div className="flex items-center justify-between h-14 px-4">
        {showBack ? (
          <Link href="/" className="text-purple-600 dark:text-purple-400 font-medium">
            ← Back
          </Link>
        ) : (
          <div className="w-16" />
        )}
        <h1 className="text-lg font-semibold text-zinc-900 dark:text-white">
          {title}
        </h1>
        <div className="w-16" />
      </div>
    </header>
  );
}
