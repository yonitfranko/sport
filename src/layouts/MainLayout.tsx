import { Outlet } from 'react-router-dom';
import { Home, User, ClipboardList, BarChart2, Award, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';

export default function MainLayout() {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden" dir="rtl">
      {/* Sidebar */}
      <div className="w-20 bg-indigo-700 flex flex-col items-center py-8">
        <div className="flex flex-col space-y-8 items-center">
          {/* Logo */}
          <Link to="/" className="w-12 h-12 bg-white rounded-full flex items-center justify-center">
            <span className="text-indigo-700 font-bold text-lg">ספ</span>
          </Link>
          
          {/* Navigation */}
          <Link 
            to="/" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Home strokeWidth={2.5} size={24} />
          </Link>
          <Link 
            to="/students" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/students') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <User strokeWidth={2.5} size={24} />
          </Link>
          <Link 
            to="/measurements" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/measurements') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <ClipboardList strokeWidth={2.5} size={24} />
          </Link>
          <Link 
            to="/statistics" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/statistics') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <BarChart2 strokeWidth={2.5} size={24} />
          </Link>
          <Link 
            to="/achievements" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/achievements') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Award strokeWidth={2.5} size={24} />
          </Link>
        </div>
        
        {/* Settings */}
        <div className="mt-auto">
          <Link 
            to="/settings" 
            className={`w-12 h-12 p-0 rounded-xl flex items-center justify-center transition-colors ${
              isActive('/settings') ? 'bg-white text-indigo-700' : 'bg-indigo-600 text-white hover:bg-indigo-500'
            }`}
          >
            <Settings strokeWidth={2.5} size={24} />
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white shadow-sm px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-800">מערכת מדידות ספורט</h1>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
} 