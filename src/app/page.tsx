'use client';

import Link from 'next/link';
import Navigation from '@/components/Navigation';

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-600 via-purple-700 to-purple-900 dark:from-zinc-900 dark:via-zinc-900 dark:to-black">
      {/* Hero Section */}
      <main className="flex flex-col items-center justify-center min-h-screen px-6 pb-20 text-center">
        {/* Logo/Icon */}
        <div className="w-20 h-20 bg-white/10 backdrop-blur-sm rounded-3xl flex items-center justify-center mb-6 animate-pulse">
          <span className="text-4xl">👗</span>
        </div>

        {/* Brand */}
        <h1 className="text-4xl font-bold text-white mb-3">
          FitPrint
        </h1>
        <p className="text-lg text-purple-200 dark:text-zinc-400 mb-8 max-w-xs">
          Your AI-powered digital wardrobe and styling companion
        </p>

        {/* Features */}
        <div className="grid gap-4 w-full max-w-sm mb-8">
          <Link
            href="/wardrobe"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">🧥</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">My Wardrobe</h3>
              <p className="text-sm text-purple-200 dark:text-zinc-400">
                Upload and manage your clothing items
              </p>
            </div>
          </Link>

          <Link
            href="/recommendations"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">✨</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">AI Outfits</h3>
              <p className="text-sm text-purple-200 dark:text-zinc-400">
                Get smart outfit recommendations
              </p>
            </div>
          </Link>

          <Link
            href="/analytics"
            className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-4 flex items-center gap-4 hover:bg-white/20 transition-colors"
          >
            <div className="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center">
              <span className="text-2xl">📊</span>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-white">Analytics</h3>
              <p className="text-sm text-purple-200 dark:text-zinc-400">
                Color trends and usage insights
              </p>
            </div>
          </Link>
        </div>

        {/* CTA */}
        <Link
          href="/wardrobe"
          className="bg-white text-purple-700 px-8 py-3 rounded-full font-semibold hover:bg-purple-100 transition-colors shadow-lg"
        >
          Get Started
        </Link>

        {/* Demo Badge */}
        <div className="absolute top-4 right-4">
          <span className="bg-white/10 backdrop-blur-sm text-white text-xs px-3 py-1 rounded-full border border-white/20">
            Hackathon Demo
          </span>
        </div>
      </main>

      <Navigation />
    </div>
  );
}
