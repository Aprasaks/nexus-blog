// src/components/Logo.tsx
import Link from "next/link";

export default function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center space-x-2 group">
      <div className="relative">
        <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg flex items-center justify-center shadow-lg shadow-blue-500/25">
          <div className="w-4 h-4 border-2 border-white rounded-sm relative">
            <div className="absolute top-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
            <div className="absolute bottom-0.5 right-0.5 w-1 h-1 bg-white rounded-full" />
          </div>
        </div>
        <div className="absolute inset-0 w-8 h-8 bg-gradient-to-br from-blue-400 to-cyan-300 rounded-lg opacity-0 group-hover:opacity-50 blur transition-opacity duration-200" />
      </div>

      <div className="hidden sm:block">
        <h1 className="text-xl font-bold text-blue-300 group-hover:text-white transition-colors">
          E.D.I.T.H
        </h1>
        <p className="text-xs text-gray-400 -mt-1">Blog Platform</p>
      </div>
    </Link>
  );
}
