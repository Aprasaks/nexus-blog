// src/app/dashboard/page.tsx
"use client";

import StatusBar from "../../components/dashboard/StatusBar";
import AIPanel from "../../components/dashboard/AIPanel";
import ActivityList from "../../components/dashboard/ActivityList";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-950 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3">
            <StatusBar />
          </div>
          <div className="lg:col-span-6">
            <AIPanel />
          </div>
          <div className="lg:col-span-3">
            <ActivityList />
          </div>
        </div>
      </div>
    </div>
  );
}
