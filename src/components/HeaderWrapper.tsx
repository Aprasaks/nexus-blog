"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  // 랜딩 페이지에서는 헤더 숨기기
  if (pathname === "/") {
    return null;
  }

  return <Header />;
}
