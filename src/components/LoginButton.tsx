// src/components/LoginButton.tsx
export default function LoginButton() {
  const handleClick = () => {
    console.log("로그인 클릭!");
    // TODO: 로그인 모달 연결
  };

  return (
    <button
      onClick={handleClick}
      className="p-2 text-blue-300 hover:text-white transition-colors group"
      aria-label="로그인"
    >
      <div className="w-8 h-8 bg-blue-500/20 rounded-lg flex items-center justify-center group-hover:bg-blue-500/30 transition-colors">
        <svg
          className="w-4 h-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      </div>
    </button>
  );
}
