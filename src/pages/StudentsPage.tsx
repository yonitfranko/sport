import { useNavigate } from 'react-router-dom';
import { Search, Download, Users, Medal, TrendingUp, ClipboardList } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Student {
  id: number;
  name: string;
  gender: 'male' | 'female';
  grade: string;
  class: string;
  measurements: {
    [key: string]: {
      first: number | null;
      second: number | null;
      firstDate?: string | null;
      secondDate?: string | null;
    };
  };
}

interface SportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  unit: string;
  isLowerBetter: boolean;
}

export default function StudentsPage() {
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [sportFilter, setSportFilter] = useState<string>('all');
  const [measurementFilter, setMeasurementFilter] = useState<'all' | 'has_measurements' | 'no_measurements'>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sports, setSports] = useState<SportType[]>([]);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        // טעינת הגדרות המערכת
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.sports) {
            setSports(settings.sports);
          }
        }

        // טעינת תלמידים
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        }
      } catch (err) {
        console.error('Error loading data:', err);
        setError('שגיאה בטעינת נתונים');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesGender = genderFilter === 'all' || student.gender === genderFilter;
    const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
    const matchesSport = sportFilter === 'all' || student.measurements[sportFilter];
    const matchesMeasurement = measurementFilter === 'all' || 
      (measurementFilter === 'has_measurements' && Object.values(student.measurements).some(m => m.first || m.second)) ||
      (measurementFilter === 'no_measurements' && Object.values(student.measurements).every(m => !m.first && !m.second));
    return matchesSearch && matchesGender && matchesGrade && matchesSport && matchesMeasurement;
  });

  const stats = {
    totalStudents: students.length,
    topPerformers: students.filter(s => 
      Object.values(s.measurements).some(m => 
        (m.first && m.second && Math.abs(((m.second - m.first) / m.first) * 100) > 5)
      )
    ).length,
    monthlyImprovement: students.reduce((acc, s) => {
      let improvements = 0;
      let total = 0;
      Object.values(s.measurements).forEach(m => {
        if (m.first && m.second) {
          improvements += ((m.second - m.first) / m.first) * 100;
          total++;
        }
      });
      return total ? acc + (improvements / total) : acc;
    }, 0) / students.filter(s => Object.keys(s.measurements).length > 0).length,
    monthlyMeasurements: students.reduce((acc, s) => 
      acc + Object.values(s.measurements).filter(m => m.firstDate || m.secondDate).length, 0
    )
  };

  const exportToExcel = () => {
    const data = filteredStudents.map(student => ({
      'שם': student.name,
      'מגדר': student.gender === 'male' ? 'זכר' : 'נקבה',
      'כיתה': student.class,
      'שכבה': student.grade,
      ...Object.entries(student.measurements).reduce((acc, [sportId, measurements]) => {
        const sport = sports.find(s => s.id === sportId);
        if (!sport) return acc;
        return {
          ...acc,
          [`${sport.name} - מדידה ראשונה`]: measurements.first || '',
          [`${sport.name} - תאריך ראשון`]: measurements.firstDate || '',
          [`${sport.name} - מדידה שניה`]: measurements.second || '',
          [`${sport.name} - תאריך שני`]: measurements.secondDate || '',
          [`${sport.name} - שיפור`]: measurements.first && measurements.second ? 
            `${(((measurements.second - measurements.first) / measurements.first) * 100).toFixed(1)}%` : ''
        };
      }, {})
    }));

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'תלמידים');
    XLSX.writeFile(wb, 'רשימת_תלמידים.xlsx');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 text-red-600 p-4 rounded-lg mb-4">
          {error}
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600"
        >
          חזרה לדף הבית
        </button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">רשימת תלמידים</h2>
          <p className="text-gray-600 mt-2">
            דף זה מציג את כל התלמידים במערכת ומאפשר סינון וחיפוש מתקדם. כאן תוכל לראות את כל המדידות של כל תלמיד, 
            לעקוב אחר התקדמותם ולנהל את הנתונים שלהם.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          חזרה
        </button>
      </div>

      {/* סינון וחיפוש */}
      <div className="bg-white rounded-xl shadow p-6 mb-6">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="חיפוש לפי שם..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div className="flex gap-4">
              <select
                value={genderFilter}
                onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל המגדרים</option>
                <option value="male">בנים</option>
                <option value="female">בנות</option>
              </select>
              <select
                value={gradeFilter}
                onChange={(e) => setGradeFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל השכבות</option>
                <option value="ד">שכבה ד׳</option>
                <option value="ה">שכבה ה׳</option>
                <option value="ו">שכבה ו׳</option>
                <option value="ז">שכבה ז׳</option>
                <option value="ח">שכבה ח׳</option>
              </select>
              <select
                value={sportFilter}
                onChange={(e) => setSportFilter(e.target.value)}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל הענפים</option>
                {sports.map(sport => (
                  <option key={sport.id} value={sport.id}>{sport.name}</option>
                ))}
              </select>
              <select
                value={measurementFilter}
                onChange={(e) => setMeasurementFilter(e.target.value as 'all' | 'has_measurements' | 'no_measurements')}
                className="border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">כל התלמידים</option>
                <option value="has_measurements">עם מדידות</option>
                <option value="no_measurements">ללא מדידות</option>
              </select>
              <button
                onClick={exportToExcel}
                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 flex items-center gap-2"
              >
                <Download size={20} />
                ייצא לאקסל
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* טבלת תלמידים */}
      <div className="bg-white rounded-xl shadow overflow-hidden mb-6">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b">
                <th className="text-right py-3 px-4 font-medium text-gray-500">שם התלמיד/ה</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">מגדר</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">כיתה</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">מדידות</th>
                <th className="text-center py-3 px-4 font-medium text-gray-500">פעולות</th>
              </tr>
            </thead>
            <tbody>
              {filteredStudents.map(student => (
                <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="py-3 px-4">{student.name}</td>
                  <td className="text-center py-3 px-4">
                    <span className={student.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                      {student.gender === 'male' ? '👦' : '👧'}
                    </span>
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => navigate(`/class/${student.grade}/${student.class}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      {student.class}
                    </button>
                  </td>
                  <td className="text-center py-3 px-4">
                    <div className="flex flex-wrap gap-2 justify-center">
                      {Object.entries(student.measurements).map(([sportId, measurements]) => {
                        const sport = sports.find(s => s.id === sportId);
                        if (!sport) return null;
                        const hasValidMeasurements = measurements.first !== null && measurements.second !== null;
                        const improvement = hasValidMeasurements ? 
                          ((measurements.second! - measurements.first!) / measurements.first!) * 100 : 0;
                        
                        return (
                          <div
                            key={sportId}
                            className="bg-gray-50 rounded-lg px-2 py-1 text-sm"
                          >
                            <div className="font-medium">{sport.name}</div>
                            {hasValidMeasurements && (
                              <div className={improvement > 0 ? 'text-green-600' : 'text-red-600'}>
                                {improvement.toFixed(1)}%
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => navigate(`/class/${student.grade}/${student.class}`)}
                      className="text-blue-600 hover:text-blue-800"
                    >
                      צפה בכיתה
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* סטטיסטיקות */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">מספר תלמידים</div>
            <Users className="h-6 w-6 text-blue-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{stats.totalStudents}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">מצטיינים</div>
            <Medal className="h-6 w-6 text-yellow-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{stats.topPerformers}</div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">שיפור חודשי</div>
            <TrendingUp className="h-6 w-6 text-green-500" />
          </div>
          <div className="text-2xl font-bold mt-2">
            {stats.monthlyImprovement ? `${stats.monthlyImprovement.toFixed(1)}%` : '0%'}
          </div>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center justify-between">
            <div className="text-gray-500">מדידות החודש</div>
            <ClipboardList className="h-6 w-6 text-purple-500" />
          </div>
          <div className="text-2xl font-bold mt-2">{stats.monthlyMeasurements}</div>
        </div>
      </div>
    </div>
  );
} 