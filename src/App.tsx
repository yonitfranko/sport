import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, User, ClipboardList, BarChart2, Award, Settings } from 'lucide-react';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import MeasurementsPage from './pages/MeasurementsPage';
import StatisticsPage from './pages/StatisticsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import ClassPage from './pages/ClassPage';

export default function App() {
  return (
    <Router>
      <div className="flex h-screen bg-gray-100">
        {/* Sidebar */}
        <div className="w-16 bg-white shadow-lg">
          <div className="h-16 bg-blue-600 flex items-center justify-center">
            <Link to="/" className="text-white p-0">
              <Home strokeWidth={2.5} />
            </Link>
          </div>
          <div className="flex flex-col items-center py-4 space-y-4">
            <Link to="/students" className="text-gray-600 hover:text-blue-600 p-0">
              <User strokeWidth={2.5} />
            </Link>
            <Link to="/measurements" className="text-gray-600 hover:text-blue-600 p-0">
              <ClipboardList strokeWidth={2.5} />
            </Link>
            <Link to="/statistics" className="text-gray-600 hover:text-blue-600 p-0">
              <BarChart2 strokeWidth={2.5} />
            </Link>
            <Link to="/achievements" className="text-gray-600 hover:text-blue-600 p-0">
              <Award strokeWidth={2.5} />
            </Link>
            <Link to="/settings" className="text-gray-600 hover:text-blue-600 p-0">
              <Settings strokeWidth={2.5} />
            </Link>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 overflow-auto">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/students" element={<StudentsPage />} />
            <Route path="/measurements" element={<MeasurementsPage />} />
            <Route path="/statistics" element={<StatisticsPage />} />
            <Route path="/achievements" element={<AchievementsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="/class/:gradeId/:classId" element={<ClassPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
