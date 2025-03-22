import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import SettingsPage from './pages/SettingsPage';
import ClassPage from './pages/ClassPage';
import SportPage from './pages/SportPage';
import { Menu } from 'lucide-react';

export default function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <Router>
      <div className="flex h-screen bg-gray-50">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="fixed top-4 right-4 z-30 p-2 rounded-lg bg-white shadow-lg md:hidden"
        >
          <Menu className="w-6 h-6 text-gray-600" />
        </button>

        {/* Sidebar */}
        <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

        {/* Main Content */}
        <main className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/class/:gradeId/:classId" element={<ClassPage />} />
            <Route path="/sport/:sportId" element={<SportPage />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
