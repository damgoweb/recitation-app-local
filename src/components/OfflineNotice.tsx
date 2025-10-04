'use client';

import { useOnlineStatus } from '@/hooks/useOnlineStatus';

export function OfflineNotice() {
  const isOnline = useOnlineStatus();

  if (isOnline) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-yellow-500 text-white py-3 px-4 z-50 shadow-lg">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3">
        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
        <span className="text-lg font-medium">
          オフラインです。一部の機能が利用できません。
        </span>
      </div>
    </div>
  );
}