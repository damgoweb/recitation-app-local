import Link from 'next/link';

export function Header() {
  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <Link href="/" className="flex items-center">
            <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-blue-600">
              朗読エクササイズ
            </h1>
          </Link>
          
          <nav className="flex items-center gap-2 sm:gap-4">
            <Link 
              href="/"
              className="text-base sm:text-lg text-gray-700 hover:text-blue-600 transition-colors px-2 sm:px-3 py-2 rounded-lg hover:bg-gray-100"
              aria-label="ホームに戻る"
            >
              ホーム
            </Link>
          </nav>
        </div>
      </div>
    </header>
  );
}