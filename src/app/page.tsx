"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

// ==================== 타입 정의 ====================
interface Task {
  name: string;
  threshold: number;
}

interface TypingTextProps {
  text: string;
  speed?: number;
}

interface LoadingBarProps {
  progress: number;
}

// ==================== 상수 ====================
const TASKS: Task[] = [
  { name: "Dashboard 구현중...", threshold: 25 },
  { name: "AI 모듈 초기화중...", threshold: 50 },
  { name: "데이터베이스 연결중...", threshold: 75 },
  { name: "시스템 검증중...", threshold: 100 },
];

const LOADING_SPEED = 80;
const TYPING_SPEED = {
  TITLE: 80,
  TASK: 50,
} as const;

// ==================== 컴포넌트 ====================
function TypingText({ text, speed = 100 }: TypingTextProps) {
  const [displayText, setDisplayText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timer = setTimeout(() => {
        setDisplayText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, speed);
      return () => clearTimeout(timer);
    }
  }, [currentIndex, text, speed]);

  useEffect(() => {
    setDisplayText("");
    setCurrentIndex(0);
  }, [text]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

function LoadingBar({ progress }: LoadingBarProps) {
  const getProgressColor = (): string => {
    if (progress < 33) return "#3b82f6";
    if (progress < 66) return "#06b6d4";
    return "#10b981";
  };

  const color = getProgressColor();

  return (
    <div className="w-full max-w-xs md:max-w-sm lg:w-80 h-1 bg-gray-900 rounded-full overflow-hidden border border-blue-500/20">
      <div
        className="h-full transition-all duration-500 rounded-full"
        style={{
          width: `${progress}%`,
          backgroundColor: color,
          boxShadow: `0 0 10px ${color}40`,
        }}
      />
    </div>
  );
}

function ActivateButton({ onClick }: { onClick: () => void }) {
  return (
    <div className="pt-4 text-center lg:text-left">
      <button
        onClick={onClick}
        className="group relative px-4 md:px-6 py-2 bg-transparent border border-blue-400/50 rounded-lg font-medium text-xs md:text-sm text-blue-300 hover:text-white hover:border-blue-300 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/20"
      >
        <div className="flex items-center space-x-2">
          <div className="w-1.5 h-1.5 bg-blue-400 rounded-full opacity-60 group-hover:opacity-100" />
          <span>E.D.I.T.H READY</span>
          <span className="text-xs opacity-60">▶</span>
        </div>
      </button>
    </div>
  );
}

function SystemLog({
  completedTasks,
  currentTask,
  currentTaskIndex,
  isComplete,
  onActivate,
}: {
  completedTasks: string[];
  currentTask: Task | null;
  currentTaskIndex: number;
  isComplete: boolean;
  onActivate: () => void;
}) {
  return (
    <div className="flex-1 lg:pl-16 w-full">
      <div className="space-y-2 min-h-[120px] flex flex-col justify-center">
        {/* 완료된 작업 로그 */}
        {completedTasks.map((task, index) => (
          <div
            key={`completed-${index}`}
            className="text-xs md:text-sm font-mono text-cyan-400 tracking-wide opacity-60 transition-all duration-500"
          >
            {task}
          </div>
        ))}

        {/* 현재 실행 중인 작업 */}
        {currentTask && !isComplete && (
          <div className="text-xs md:text-sm font-mono text-blue-400 tracking-wide">
            [RUN]{" "}
            <TypingText
              key={`task-${currentTaskIndex}`}
              text={currentTask.name}
              speed={TYPING_SPEED.TASK}
            />
          </div>
        )}

        {/* 시스템 활성화 버튼 */}
        {isComplete && <ActivateButton onClick={onActivate} />}
      </div>
    </div>
  );
}

function LoadingSection({
  title,
  progress,
}: {
  title: string;
  progress: number;
}) {
  return (
    <div className="flex-1 space-y-6 text-center lg:text-left">
      <h1 className="text-2xl md:text-3xl font-light text-blue-300 tracking-wide">
        <TypingText text={title} speed={TYPING_SPEED.TITLE} />
      </h1>

      <div className="flex justify-center lg:justify-start">
        <LoadingBar progress={progress} />
      </div>

      <div className="text-sm font-mono text-blue-400/70 tracking-wider">
        {progress}% COMPLETE
      </div>
    </div>
  );
}

// ==================== 메인 컴포넌트 ====================
export default function LandingPage() {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [currentTaskIndex, setCurrentTaskIndex] = useState(-1);
  const [completedTasks, setCompletedTasks] = useState<string[]>([]);

  const router = useRouter();

  // 진행률 업데이트
  useEffect(() => {
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          setIsComplete(true);
          clearInterval(interval);
          return 100;
        }
        return prev + 1;
      });
    }, LOADING_SPEED);

    return () => clearInterval(interval);
  }, []);

  // 작업 상태 관리
  useEffect(() => {
    const newIndex = TASKS.findIndex((task) => progress < task.threshold);
    const nextIndex = newIndex !== -1 ? newIndex : TASKS.length - 1;

    if (nextIndex !== currentTaskIndex && progress > 0) {
      // 이전 작업 완료 처리
      if (currentTaskIndex >= 0 && currentTaskIndex < TASKS.length) {
        const prevTask = TASKS[currentTaskIndex];
        setCompletedTasks((prev) => {
          const taskText = `[OK] ${prevTask.name}`;
          return prev.includes(taskText) ? prev : [...prev, taskText];
        });
      }

      setCurrentTaskIndex(nextIndex);
    }
  }, [progress, currentTaskIndex]);

  // 대시보드 이동
  const handleSystemActivation = () => {
    router.push("/dashboard");
  };

  // 현재 상태 계산
  const currentTitle = isComplete ? "SYSTEM ONLINE" : "INITIALIZING...";
  const currentTask =
    currentTaskIndex >= 0 && currentTaskIndex < TASKS.length
      ? TASKS[currentTaskIndex]
      : null;

  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-white p-4 md:p-8">
      <div className="w-full max-w-4xl flex flex-col lg:flex-row items-center lg:justify-between space-y-8 lg:space-y-0">
        <LoadingSection title={currentTitle} progress={progress} />

        <SystemLog
          completedTasks={completedTasks}
          currentTask={currentTask}
          currentTaskIndex={currentTaskIndex}
          isComplete={isComplete}
          onActivate={handleSystemActivation}
        />
      </div>
    </div>
  );
}
