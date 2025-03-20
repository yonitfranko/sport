import { Star, Award, BarChart2, Upload, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

interface SportType {
  id: string;
  name: string;
  icon: string;
  unit: string;
  color: string;
}

interface Grade {
  id: string;
  name: string;
  classes: string[];
}

const sportTypes: SportType[] = [
  { id: 'sprint', name: 'ספרינט', icon: '🏃', unit: 'שניות', color: 'teal' },
  { id: 'long_jump', name: 'קפיצה למרחק', icon: '↔️', unit: 'מטרים', color: 'indigo' },
  { id: 'high_jump', name: 'קפיצה לגובה', icon: '↕️', unit: 'מטרים', color: 'purple' },
  { id: 'ball_throw', name: 'זריקת כדור', icon: '🏐', unit: 'מטרים', color: 'amber' },
  { id: 'long_run', name: 'ריצה ארוכה', icon: '🏃‍♂️', unit: 'דקות', color: 'rose' }
];

const grades: Grade[] = [
  { id: 'ד', name: 'שכבה ד׳', classes: ['ד1', 'ד2', 'ד3', 'ד4'] },
  { id: 'ה', name: 'שכבה ה׳', classes: ['ה1', 'ה2', 'ה3'] },
  { id: 'ו', name: 'שכבה ו׳', classes: ['ו1', 'ו2', 'ו3', 'ו4'] },
  { id: 'ז', name: 'שכבה ז׳', classes: ['ז1', 'ז2', 'ז3'] },
  { id: 'ח', name: 'שכבה ח׳', classes: ['ח1', 'ח2', 'ח3', 'ח4'] }
];

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

export default function HomePage() {
  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      console.log('Selected file:', file.name);
    }
  };

  const toggleGrade = (gradeId: string) => {
    setOpenGrade(openGrade === gradeId ? null : gradeId);
  };

  const navigateToClass = (gradeId: string, classId: string) => {
    navigate(`/class/${gradeId}/${classId}`);
  };

  const handleSportClick = (sportId: string) => {
    // בעתיד - ניווט לדף סטטיסטיקות של הספורט
    console.log('Selected sport:', sportId);
  };

  // נתוני דמו למדידות אחרונות
  const recentMeasurements = [
    { studentName: 'דניאל כהן', className: 'ו2', result: '11.8', sport: 'ריצת 100 מטר' },
    { studentName: 'מיכל לוי', className: 'ו2', result: '12.9', sport: 'ריצת 100 מטר' },
    { studentName: 'יעל ברק', className: 'ו1', result: '13.1', sport: 'ריצת 100 מטר' }
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-700">ברוך הבא, מורה!</h2>
      
      {/* Excel Upload Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">העלאת רשימת תלמידים</h3>
        <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg p-6 bg-gray-50 hover:bg-gray-100 transition-colors">
          <Upload className="w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-600 mb-2">גרור לכאן קובץ אקסל או</p>
          <label className="relative">
            <input
              type="file"
              accept=".xlsx,.xls"
              onChange={handleFileUpload}
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            />
            <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors cursor-pointer">
              בחר קובץ
            </span>
          </label>
          <p className="text-gray-500 text-sm mt-2">קבצי אקסל בלבד (.xlsx, .xls)</p>
        </div>
      </div>
      
      {/* Sport Types Grid */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">ענפי ספורט</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sportTypes.map(sport => (
            <div key={sport.id} className="flex flex-col">
              <button 
                onClick={() => handleSportClick(sport.id)}
                className={`w-full h-12 rounded-lg p-2 text-white transition-all ${getButtonColorClass(sport.id)}`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{sport.icon}</span>
                  <span className="font-medium">{sport.name}</span>
                </div>
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Grades Accordion */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">שכבות וכיתות</h3>
        <div className="space-y-2">
          {grades.map((grade) => (
            <div key={grade.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGrade(grade.id)}
                className="w-full px-4 py-3 flex items-center justify-between bg-gray-50 hover:bg-gray-100 transition-colors"
              >
                <span className="font-medium text-gray-700">{grade.name}</span>
                <ChevronDown
                  size={20}
                  className={`text-gray-500 transition-transform ${
                    openGrade === grade.id ? 'transform rotate-180' : ''
                  }`}
                />
              </button>
              {openGrade === grade.id && (
                <div className="p-4 bg-white border-t">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {grade.classes.map((className) => (
                      <button
                        key={className}
                        onClick={() => navigateToClass(grade.id, className)}
                        className="px-4 py-2 text-sm bg-indigo-50 text-indigo-700 rounded-lg hover:bg-indigo-100 transition-colors"
                      >
                        כיתה {className}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">פעולות מהירות</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="bg-amber-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-amber-600 transition flex items-center justify-center gap-2">
            <Star size={20} />
            מצטיינים
          </button>
          <button className="bg-purple-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-purple-600 transition flex items-center justify-center gap-2">
            <Award size={20} />
            הפקת דוח מצטיינים
          </button>
          <button className="bg-teal-500 text-white rounded-lg px-4 py-3 font-medium hover:bg-teal-600 transition flex items-center justify-center gap-2">
            <BarChart2 size={20} />
            השוואת נתונים
          </button>
        </div>
      </div>

      {/* מדידות אחרונות */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">מדידות אחרונות</h3>
        <div className="space-y-4">
          {recentMeasurements.map((measurement, i) => (
            <div key={i} className="flex items-center justify-between p-2 border-b last:border-0">
              <div>
                <div className="font-medium">{measurement.studentName}</div>
                <div className="text-sm text-gray-500">כיתה {measurement.className}</div>
              </div>
              <div className="text-right">
                <div className="font-medium">{measurement.result} שניות</div>
                <div className="text-sm text-gray-500">{measurement.sport}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 