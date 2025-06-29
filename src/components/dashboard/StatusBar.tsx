// src/components/dashboard/StatusBar.tsx
"use client";

import { useState, useEffect } from "react";

// ==================== 타입 정의 ====================
interface StatusCardProps {
  icon: string;
  title: string;
  value: number;
  subtitle: string;
  color: string;
}

interface StatData {
  posts: number;
  visitors: number;
  commits: number;
}

// ==================== 상수 ====================
const MOCK_DATA: StatData = {
  posts: 42,
  visitors: 1247,
  commits: 156,
};

const ANIMATION_CONFIG = {
  duration: 2000,
  interval: 50,
} as const;

// ==================== 유틸리티 함수 ====================
const getStatusColor = (isOnline: boolean): string =>
  isOnline ? "bg-green-500/20" : "bg-red-500/20";

const getStatusText = (isOnline: boolean): string =>
  isOnline ? "online" : "offline";

// ==================== 컴포넌트 ====================
function AnimatedCounter({ target }: { target: number }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const increment =
      target / (ANIMATION_CONFIG.duration / ANIMATION_CONFIG.interval);

    const timer = setInterval(() => {
      setCount((prev) => {
        const next = prev + increment;
        if (next >= target) {
          clearInterval(timer);
          return target;
        }
        return next;
      });
    }, ANIMATION_CONFIG.interval);

    return () => clearInterval(timer);
  }, [target]);

  return Math.floor(count);
}

function StatusCard({ icon, title, value, subtitle, color }: StatusCardProps) {
  return (
    <div className="bg-gray-900/50 backdrop-blur-lg border border-blue-500/20 rounded-lg p-4 hover:border-blue-400/40 transition-all duration-200 group">
      <div className="flex items-center space-x-3">
        <div
          className={`w-10 h-10 ${color} rounded-lg flex items-center justify-center group-hover:scale-105 transition-transform`}
        >
          <span className="text-xl">{icon}</span>
        </div>
        <div className="flex-1">
          <div className="text-xs text-gray-400 uppercase tracking-wide">
            {title}
          </div>
          <div className="text-2xl font-bold text-white">
            <AnimatedCounter target={value} />
          </div>
          <div className="text-xs text-gray-500">{subtitle}</div>
        </div>
      </div>
    </div>
  );
}

function SectionHeader() {
  return (
    <div className="flex items-center space-x-2">
      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
      <h2 className="text-lg font-light text-blue-300 tracking-wider">
        SYSTEM STATUS
      </h2>
    </div>
  );
}

function useGitHubStatus() {
  const [isOnline, setIsOnline] = useState(true);

  useEffect(() => {
    const checkStatus = () => {
      setIsOnline(Math.random() > 0.1); // 90% 확률로 온라인
    };

    checkStatus();
    const interval = setInterval(checkStatus, 30000);

    return () => clearInterval(interval);
  }, []);

  return isOnline;
}

// ==================== 메인 컴포넌트 ====================
export default function StatusBar() {
  const isGitHubOnline = useGitHubStatus();

  const statusCards = [
    {
      icon: "📝",
      title: "Total Posts",
      value: MOCK_DATA.posts,
      subtitle: "published articles",
      color: "bg-blue-500/20",
    },
    {
      icon: "👥",
      title: "Visitors",
      value: MOCK_DATA.visitors,
      subtitle: "this month",
      color: "bg-green-500/20",
    },
    {
      icon: "📊",
      title: "GitHub",
      value: MOCK_DATA.commits,
      subtitle: `commits • ${getStatusText(isGitHubOnline)}`,
      color: getStatusColor(isGitHubOnline),
    },
  ];

  return (
    <div className="space-y-4">
      <SectionHeader />
      <div className="space-y-3">
        {statusCards.map((card, index) => (
          <StatusCard key={index} {...card} />
        ))}
      </div>
    </div>
  );
}
