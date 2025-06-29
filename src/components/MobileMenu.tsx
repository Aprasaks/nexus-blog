// src/components/MobileMenu.tsx
import Link from "next/link";
import { NAV_ITEMS, type NavItem } from "./Navigation";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
        onClick={onClose}
      />

      <div className="fixed top-0 left-0 h-full w-80 bg-gray-900/95 backdrop-blur-lg border-r border-blue-500/20 z-50 lg:hidden transform transition-transform duration-300">
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-light text-blue-300 tracking-wider">
              NAVIGATION
            </h2>
            <button
              onClick={onClose}
              className="p-2 text-gray-400 hover:text-white transition-colors"
              aria-label="메뉴 닫기"
            >
              ✕
            </button>
          </div>

          <nav className="space-y-4">
            {NAV_ITEMS.map((item) => {
              const [title, description] = item.description.split(" - ");

              return (
                <Link
                  key={item.id}
                  href={item.href}
                  onClick={onClose}
                  className="block p-3 rounded-lg border border-blue-500/20 hover:border-blue-400/40 hover:bg-blue-500/10 transition-all duration-200 group"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center text-blue-300 font-mono font-bold group-hover:bg-blue-500/30">
                      {item.label}
                    </div>
                    <div>
                      <div className="text-sm font-mono text-blue-300 group-hover:text-white">
                        {title}
                      </div>
                      <div className="text-xs text-gray-400 group-hover:text-gray-300">
                        {description}
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </>
  );
}
