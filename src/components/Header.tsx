// src/components/Header.tsx
"use client";

import { useState } from "react";
import Logo from "./Logo";
import Navigation from "./Navigation";
import LoginButton from "./LoginButton";
import MobileMenu from "./MobileMenu";

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const toggleMobileMenu = () => setIsMobileMenuOpen(!isMobileMenuOpen);
  const closeMobileMenu = () => setIsMobileMenuOpen(false);

  return (
    <header className="w-full bg-black/90 backdrop-blur-lg border-b border-blue-500/20 sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* 왼쪽: 햄버거 + 로고 */}
          <div className="flex items-center lg:space-x-4">
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden p-2 text-blue-300 hover:text-white transition-colors"
              aria-label="메뉴 열기"
            >
              <div className="w-6 h-6 flex flex-col justify-center space-y-1">
                <div className="w-full h-0.5 bg-current transform transition-transform" />
                <div className="w-full h-0.5 bg-current transform transition-transform" />
                <div className="w-full h-0.5 bg-current transform transition-transform" />
              </div>
            </button>

            <div className="hidden lg:block">
              <Logo />
            </div>
          </div>

          {/* 중앙: 로고(모바일) + 네비게이션(데스크톱) */}
          <div className="flex-1 lg:flex-none flex justify-center">
            <div className="lg:hidden">
              <Logo />
            </div>
            <div className="hidden lg:block">
              <Navigation />
            </div>
          </div>

          {/* 오른쪽: 로그인 */}
          <LoginButton />
        </div>
      </div>

      <MobileMenu isOpen={isMobileMenuOpen} onClose={closeMobileMenu} />
    </header>
  );
}
