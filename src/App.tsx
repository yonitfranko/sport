import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { Home, User, ClipboardList, BarChart2, Award, Settings } from 'lucide-react';
import HomePage from './pages/HomePage';
import StudentsPage from './pages/StudentsPage';
import MeasurementsPage from './pages/MeasurementsPage';
import StatisticsPage from './pages/StatisticsPage';
import AchievementsPage from './pages/AchievementsPage';
import SettingsPage from './pages/SettingsPage';
import ClassPage from './pages/ClassPage';

// נתוני ענפי הספורט
const sportTypes = [
  { id: 'sprint', name: 'ספרינט', icon: '🏃', unit: 'שניות', color: 'teal' },
  { id: 'long_jump', name: 'קפיצה למרחק', icon: '↔️', unit: 'מטרים', color: 'indigo' },
  { id: 'high_jump', name: 'קפיצה לגובה', icon: '↕️', unit: 'מטרים', color: 'purple' },
  { id: 'ball_throw', name: 'זריקת כדור', icon: '🏐', unit: 'מטרים', color: 'amber' },
  { id: 'long_run', name: 'ריצה ארוכה', icon: '🏃‍♂️', unit: 'דקות', color: 'rose' }
];

// נתוני מצטיינים לדוגמה
const topStudents = {
  'sprint': {
    'ד': 'רוני אלון - 12.5 שניות',
    'ה': 'מיכל לוי - 12.0 שניות',
    'ו': 'נועה גל - 11.8 שניות',
    'ז': 'גלי כהן - 11.2 שניות',
    'ח': 'אלון שגב - 10.8 שניות'
  }
};

// פונקציית עזר לקבלת צבע הרקע
const getButtonColorClass = (sportId: string) => {
  const colorMap: { [key: string]: string } = {
    'sprint': 'bg-teal-500 hover:bg-teal-600',
    'long_jump': 'bg-indigo-500 hover:bg-indigo-600',
    'high_jump': 'bg-purple-500 hover:bg-purple-600',
    'ball_throw': 'bg-amber-500 hover:bg-amber-600',
    'long_run': 'bg-rose-500 hover:bg-rose-600'
  };
  return colorMap[sportId] || 'bg-gray-500 hover:bg-gray-600';
};

// פונקציית עזר לקבלת צבע הרקע של תיבת המצטיינים
const getBgColorClass = (sportId: string) => {
  const colorMap: { [key: string]: string } = {
    'sprint': 'bg-teal-50',
    'long_jump': 'bg-indigo-50',
    'high_jump': 'bg-purple-50',
    'ball_throw': 'bg-amber-50',
    'long_run': 'bg-rose-50'
  };
  return colorMap[sportId] || 'bg-gray-50';
};

// פונקציית עזר לקבלת צבע הטקסט
const getTextColorClass = (sportId: string) => {
  const colorMap: { [key: string]: string } = {
    'sprint': 'text-teal-700',
    'long_jump': 'text-indigo-700',
    'high_jump': 'text-purple-700',
    'ball_throw': 'text-amber-700',
    'long_run': 'text-rose-700'
  };
  return colorMap[sportId] || 'text-gray-700';
};

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
