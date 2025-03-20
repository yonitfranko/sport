import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layouts/MainLayout';
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
  { id: 'long_jump', name: 'קפיצה לרוחק', icon: '↔️', unit: 'מטרים', color: 'indigo' },
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

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<MainLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/students" element={<StudentsPage />} />
          <Route path="/measurements" element={<MeasurementsPage />} />
          <Route path="/statistics" element={<StatisticsPage />} />
          <Route path="/achievements" element={<AchievementsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/class/:gradeId/:classId" element={<ClassPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
