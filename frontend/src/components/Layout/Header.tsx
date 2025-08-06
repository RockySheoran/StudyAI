import Link from 'next/link';
import { useRouter } from 'next/router';

const Header = () => {
  const router = useRouter();

  // Helper function to determine active link
  const isActive = (pathname: string) => router.pathname === pathname;

  return (
    <header className="w-full h-16 border-b border-gray-200 bg-white">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center">
          <Link href="/" className="text-blue-600 font-bold text-xl hover:text-blue-700 transition-colors">
            AI Interviewer
          </Link>
        </div>

        {/* Navigation */}
        <nav className="hidden md:block">
          <ul className="flex space-x-8">
            <li>
              <Link 
                href="/" 
                className={`py-1 border-b-2 transition-colors ${isActive('/') 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-blue-600'}`}
              >
                Home
              </Link>
            </li>
            <li>
              <Link 
                href="/interviews/history" 
                className={`py-1 border-b-2 transition-colors ${isActive('/interviews/history') 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-blue-600'}`}
              >
                History
              </Link>
            </li>
            <li>
              <Link 
                href="/profile" 
                className={`py-1 border-b-2 transition-colors ${isActive('/profile') 
                  ? 'border-blue-600 text-blue-600 font-medium' 
                  : 'border-transparent text-gray-600 hover:text-blue-600'}`}
              >
                Profile
              </Link>
            </li>
          </ul>
        </nav>

        {/* Mobile menu button (optional) */}
        <button className="md:hidden text-gray-600 hover:text-gray-900">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
          </svg>
        </button>
      </div>
    </header>
  );
};

export default Header;