import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { Users, Medal, TrendingUp, ClipboardList, Edit2, Check, X, Trash2, ArrowLeft } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Measurement {
  first: number | null;
  second: number | null;
  firstDate?: string | null;
  secondDate?: string | null;
}

interface StudentMeasurements {
  [key: string]: Measurement;
}

interface Student {
  id: number;
  name: string;
  gender: 'male' | 'female';
  measurements: StudentMeasurements;
  grade: string;
  class: string;
}

interface SportType {
  id: string;
  name: string;
  description: string;
  icon: string;
  unit: string;
  isLowerBetter: boolean;
}

const getCurrentDate = () => {
  const today = new Date();
  return today.toISOString().split('T')[0];
};

export default function ClassPage() {
  const { gradeId, classId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedSport, setSelectedSport] = useState<string | null>(() => {
    const params = new URLSearchParams(location.search);
    return params.get('sport');
  });
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gender: 'male' as 'male' | 'female' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');
  const [firstMeasurementDate, setFirstMeasurementDate] = useState(getCurrentDate());
  const [secondMeasurementDate, setSecondMeasurementDate] = useState(getCurrentDate());
  const [sports, setSports] = useState<SportType[]>([]);

  useEffect(() => {
    const loadStudents = () => {
      try {
        setLoading(true);
        setError(null);

        // טעינת תלמידים מה-localStorage
        const savedStudents = localStorage.getItem('students');
        console.log('Saved students from localStorage:', savedStudents); // DEBUG

        if (!savedStudents) {
          console.log('No students found in localStorage'); // DEBUG
          setStudents([]);
          return;
        }

        const allStudents: Student[] = JSON.parse(savedStudents);
        console.log('All students:', allStudents); // DEBUG

        // סינון התלמידים לפי הכיתה הנוכחית
        const classStudents = allStudents.filter(
          student => student.grade === gradeId && student.class === classId
        );
        console.log('Filtered students for this class:', classStudents); // DEBUG

        setStudents(classStudents);
      } catch (err) {
        console.error('Error loading students:', err);
        setError('שגיאה בטעינת נתוני התלמידים');
      } finally {
        setLoading(false);
      }
    };

    // טעינת הגדרות המערכת
    const loadSettings = () => {
      try {
        const savedSettings = localStorage.getItem('systemSettings');
        console.log('Saved settings from localStorage:', savedSettings); // DEBUG
        
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          console.log('Parsed settings:', settings); // DEBUG
          
          if (settings.sports) {
            console.log('Setting sports:', settings.sports); // DEBUG
            setSports(settings.sports);
          } else {
            console.log('No sports found in settings, using defaults'); // DEBUG
            setSports([
              { id: 'sprint', name: 'ריצה קצרה', description: 'ריצה של 100 מטר', icon: '🏃', unit: 'שניות', isLowerBetter: true },
              { id: 'long_jump', name: 'קפיצה לרוחק', description: 'קפיצה לרוחק', icon: '🦘', unit: 'מטרים', isLowerBetter: false },
              { id: 'high_jump', name: 'קפיצה לגובה', description: 'קפיצה לגובה', icon: '⬆️', unit: 'מטרים', isLowerBetter: false },
              { id: 'ball_throw', name: 'זריקת כדור', description: 'זריקת כדור', icon: '⚾', unit: 'מטרים', isLowerBetter: false },
              { id: 'long_run', name: 'ריצה ארוכה', description: 'ריצה של 1000 מטר', icon: '🏃', unit: 'דקות', isLowerBetter: true }
            ]);
          }
        } else {
          console.log('No settings found in localStorage, using defaults'); // DEBUG
          setSports([
            { id: 'sprint', name: 'ריצה קצרה', description: 'ריצה של 100 מטר', icon: '🏃', unit: 'שניות', isLowerBetter: true },
            { id: 'long_jump', name: 'קפיצה לרוחק', description: 'קפיצה לרוחק', icon: '🦘', unit: 'מטרים', isLowerBetter: false },
            { id: 'high_jump', name: 'קפיצה לגובה', description: 'קפיצה לגובה', icon: '⬆️', unit: 'מטרים', isLowerBetter: false },
            { id: 'ball_throw', name: 'זריקת כדור', description: 'זריקת כדור', icon: '⚾', unit: 'מטרים', isLowerBetter: false },
            { id: 'long_run', name: 'ריצה ארוכה', description: 'ריצה של 1000 מטר', icon: '🏃', unit: 'דקות', isLowerBetter: true }
          ]);
        }
      } catch (err) {
        console.error('Error loading settings:', err);
        // במקרה של שגיאה, נשתמש בהגדרות ברירת מחדל
        setSports([
          { id: 'sprint', name: 'ריצה קצרה', description: 'ריצה של 100 מטר', icon: '🏃', unit: 'שניות', isLowerBetter: true },
          { id: 'long_jump', name: 'קפיצה לרוחק', description: 'קפיצה לרוחק', icon: '🦘', unit: 'מטרים', isLowerBetter: false },
          { id: 'high_jump', name: 'קפיצה לגובה', description: 'קפיצה לגובה', icon: '⬆️', unit: 'מטרים', isLowerBetter: false },
          { id: 'ball_throw', name: 'זריקת כדור', description: 'זריקת כדור', icon: '⚾', unit: 'מטרים', isLowerBetter: false },
          { id: 'long_run', name: 'ריצה ארוכה', description: 'ריצה של 1000 מטר', icon: '🏃', unit: 'דקות', isLowerBetter: true }
        ]);
      }
    };

    // טעינת הספורט הנבחר מה-URL
    const params = new URLSearchParams(location.search);
    const sportId = params.get('sport');
    console.log('Sport ID from URL:', sportId); // DEBUG
    
    if (sportId) {
      console.log('Setting selected sport:', sportId); // DEBUG
      setSelectedSport(sportId);
    }

    loadStudents();
    loadSettings();
  }, [gradeId, classId, location.search]);

  // אם הדף בטעינה, מציג אנימציית טעינה
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // אם יש שגיאה בטעינה, מציג הודעת שגיאה
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

  // חישוב סטטיסטיקות
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

  const handleMeasurementChange = (studentId: number, field: 'first' | 'second', value: string) => {
    if (!selectedSport) return;

    const numValue = value === '' ? null : parseFloat(value);
    
    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          const currentMeasurements = student.measurements[selectedSport] || {};
          return {
            ...student,
            measurements: {
              ...student.measurements,
              [selectedSport]: {
                ...currentMeasurements,
                [field]: numValue,
                [`${field}Date`]: numValue !== null ? (field === 'first' ? firstMeasurementDate : secondMeasurementDate) : null
              }
            }
          };
        }
        return student;
      })
    );
  };

  const addStudent = () => {
    if (!newStudent.name.trim()) return;
    
    if (!gradeId || !classId) {
      console.error('Grade or class ID is missing');
      return;
    }

    setStudents(prev => [...prev, {
      id: prev.length + 1,
      name: newStudent.name.trim(),
      gender: newStudent.gender,
      measurements: {},
      grade: gradeId,
      class: classId
    }]);

    // שמירת התלמידים המעודכנים ב-localStorage
    const savedStudents = localStorage.getItem('students');
    const allStudents = savedStudents ? JSON.parse(savedStudents) : [];
    const updatedStudents = [...allStudents, {
      id: allStudents.length + 1,
      name: newStudent.name.trim(),
      gender: newStudent.gender,
      measurements: {},
      grade: gradeId,
      class: classId
    }];
    localStorage.setItem('students', JSON.stringify(updatedStudents));

    setNewStudent({ name: '', gender: 'male' });
    setShowAddStudent(false);
  };

  const goBack = () => {
    const params = new URLSearchParams(location.search);
    const fromSport = params.get('sport');
    if (fromSport) {
      navigate(`/sport/${fromSport}`);
    } else {
      navigate(-1);
    }
  };

  const getTopPerformers = (sportId: string) => {
    const sport = sports.find(s => s.id === sportId);
    if (!sport) return { boys: [], girls: [] };

    const filteredStudents = students.filter(s => s.measurements[sportId]?.first || s.measurements[sportId]?.second);
    
    const getBestResult = (student: Student) => {
      const measurements = student.measurements[sportId];
      if (!measurements) return sport.isLowerBetter ? Infinity : -Infinity;
      
      const first = measurements.first || (sport.isLowerBetter ? Infinity : -Infinity);
      const second = measurements.second || (sport.isLowerBetter ? Infinity : -Infinity);
      
      return sport.isLowerBetter ? Math.min(first, second) : Math.max(first, second);
    };

    const boys = filteredStudents
      .filter(s => s.gender === 'male')
      .sort((a, b) => {
        const aBest = getBestResult(a);
        const bBest = getBestResult(b);
        return sport.isLowerBetter ? aBest - bBest : bBest - aBest;
      })
      .slice(0, 2);

    const girls = filteredStudents
      .filter(s => s.gender === 'female')
      .sort((a, b) => {
        const aBest = getBestResult(a);
        const bBest = getBestResult(b);
        return sport.isLowerBetter ? aBest - bBest : bBest - aBest;
      })
      .slice(0, 2);

    return { boys, girls };
  };

  const deleteStudent = (studentId: number) => {
    if (!confirm('האם אתה בטוח שברצונך למחוק תלמיד/ה זו?')) return;

    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      const allStudents: Student[] = JSON.parse(savedStudents);
      const updatedStudents = allStudents.filter(s => s.id !== studentId);
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      setStudents(prev => prev.filter(s => s.id !== studentId));
    }
  };

  const handleEditStudent = (student: Student) => {
    setEditingStudent(student);
  };

  const saveEditedStudent = () => {
    if (!editingStudent) return;

    const savedStudents = localStorage.getItem('students');
    if (savedStudents) {
      const allStudents: Student[] = JSON.parse(savedStudents);
      const updatedStudents = allStudents.map(s => 
        s.id === editingStudent.id ? editingStudent : s
      );
      localStorage.setItem('students', JSON.stringify(updatedStudents));
      setStudents(prev => prev.map(s => 
        s.id === editingStudent.id ? editingStudent : s
      ));
    }
    setEditingStudent(null);
  };

  const exportToExcel = () => {
    const sportType = selectedSport ? sports.find(s => s.id === selectedSport) : null;
    
    const data = students
      .filter(student => genderFilter === 'all' || student.gender === genderFilter)
      .map(student => {
        const measurements = selectedSport ? student.measurements[selectedSport] : null;
        return {
          'שם': student.name,
          'מגדר': student.gender === 'male' ? 'זכר' : 'נקבה',
          'כיתה': student.class,
          'מדידה ראשונה': measurements?.first || '',
          'תאריך מדידה ראשונה': measurements?.firstDate || '',
          'מדידה שניה': measurements?.second || '',
          'תאריך מדידה שניה': measurements?.secondDate || '',
          'שיפור': measurements?.first && measurements?.second ? 
            `${(((measurements.second - measurements.first) / measurements.first) * 100).toFixed(1)}%` : ''
        };
      });

    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'תלמידים');
    XLSX.writeFile(wb, `כיתה_${classId}_${sportType?.name || 'כל_הענפים'}.xlsx`);
  };

  const getSortedStudents = () => {
    let sortedStudents = [...students];
    
    if (genderFilter !== 'all') {
      sortedStudents = sortedStudents.filter(s => s.gender === genderFilter);
    }

    return sortedStudents;
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users size={32} className="text-blue-500" />
          <div>
            <h1 className="text-2xl font-bold">כיתה {classId}</h1>
            <div className="text-gray-600">שכבה {gradeId}</div>
          </div>
        </div>
        <button
          onClick={goBack}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          חזרה
        </button>
      </div>

      {/* Sports Grid */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">ענפי ספורט</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sports.map(sport => (
            <button
              key={sport.id}
              onClick={() => {
                console.log('Navigating to sport:', sport.id); // DEBUG
                setSelectedSport(sport.id);
              }}
              className={`flex flex-col items-center justify-center p-4 rounded-lg transition-all transform hover:scale-105 ${
                selectedSport === sport.id 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
              }`}
            >
              <span className="text-3xl mb-2">{sport.icon}</span>
              <span className="font-medium text-center">{sport.name}</span>
              <span className="text-sm text-center mt-1 opacity-75">{sport.description}</span>
            </button>
          ))}
        </div>
      </div>

      {/* הוספת תלמיד */}
      <div className="mb-8">
        <div className="text-gray-500 text-sm mb-4">
          הוספת תלמיד/ה חדש/ה לכיתה. הזינו את השם והמגדר ולחצו על "הוסף".
        </div>
        {!showAddStudent ? (
          <button
            onClick={() => setShowAddStudent(true)}
            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
          >
            הוסף תלמיד/ה
          </button>
        ) : (
          <div className="flex gap-4 items-center">
            <input
              type="text"
              value={newStudent.name}
              onChange={(e) => setNewStudent({ ...newStudent, name: e.target.value })}
              placeholder="שם התלמיד/ה"
              className="border p-2 rounded-lg"
            />
            <select
              value={newStudent.gender}
              onChange={(e) => setNewStudent({ ...newStudent, gender: e.target.value as 'male' | 'female' })}
              className="border p-2 rounded-lg"
            >
              <option value="male">זכר</option>
              <option value="female">נקבה</option>
            </select>
            <button
              onClick={addStudent}
              className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
            >
              הוסף
            </button>
            <button
              onClick={() => setShowAddStudent(false)}
              className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
            >
              ביטול
            </button>
          </div>
        )}
      </div>

      {students.length === 0 ? (
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg">
          לא נמצאו תלמידים בכיתה זו
        </div>
      ) : (
        <>
          {/* טבלת תלמידים ומדידות */}
          <div className="bg-white rounded-xl shadow p-6 mb-8">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-xl font-semibold">תלמידי הכיתה</h3>
                {selectedSport && (
                  <div className="text-gray-600 mt-1">
                    {sports.find(s => s.id === selectedSport)?.name} - {sports.find(s => s.id === selectedSport)?.description}
                  </div>
                )}
              </div>
              <div className="flex gap-4">
                <div className="text-gray-500 text-sm">
                  <p>ייצוא נתונים לאקסל</p>
                  <p>סינון לפי מגדר</p>
                </div>
                <button
                  onClick={exportToExcel}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                >
                  ייצא לאקסל
                </button>
                <select
                  value={genderFilter}
                  onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
                  className="border p-2 rounded-lg"
                >
                  <option value="all">הכל</option>
                  <option value="male">בנים</option>
                  <option value="female">בנות</option>
                </select>
              </div>
            </div>

            <div className="overflow-x-auto">
              <div className="text-gray-500 text-sm mb-2">
                <p>הזינו את תוצאות המדידות בשדות המתאימים. המערכת תחשב אוטומטית את אחוז השיפור.</p>
                <p>תוצאה טובה יותר תוצג ברקע ירוק.</p>
              </div>
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-right py-3 px-4 font-medium text-gray-500">שם התלמיד/ה</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">מגדר</th>
                    {selectedSport && (
                      <>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">
                          <div>מדידה ראשונה</div>
                          <div className="text-sm font-normal mt-1">
                            <input
                              type="date"
                              value={firstMeasurementDate}
                              onChange={(e) => setFirstMeasurementDate(e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">
                          <div>מדידה שניה</div>
                          <div className="text-sm font-normal mt-1">
                            <input
                              type="date"
                              value={secondMeasurementDate}
                              onChange={(e) => setSecondMeasurementDate(e.target.value)}
                              className="border rounded px-2 py-1 text-sm"
                            />
                          </div>
                        </th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">שיפור</th>
                      </>
                    )}
                    <th className="text-center py-3 px-4 font-medium text-gray-500">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedStudents().map(student => {
                    const measurements: Measurement = selectedSport ? (student.measurements[selectedSport] || { first: null, second: null, firstDate: null, secondDate: null }) : { first: null, second: null, firstDate: null, secondDate: null };
                    const sport = sports.find(s => s.id === selectedSport);
                    
                    // בדיקת תקינות המדידות
                    const hasValidMeasurements = measurements.first !== null && measurements.second !== null;
                    
                    const isFirstBetter = hasValidMeasurements && sport?.isLowerBetter !== undefined
                      ? (sport.isLowerBetter ? (measurements.first as number) < (measurements.second as number) : (measurements.first as number) > (measurements.second as number))
                      : false;
                      
                    const isSecondBetter = hasValidMeasurements && sport?.isLowerBetter !== undefined
                      ? (sport.isLowerBetter ? (measurements.second as number) < (measurements.first as number) : (measurements.second as number) > (measurements.first as number))
                      : false;

                    return (
                      <tr key={student.id} className="border-b last:border-0 hover:bg-gray-50">
                        <td className="py-3 px-4">
                          {editingStudent?.id === student.id ? (
                            <input
                              type="text"
                              value={editingStudent.name}
                              onChange={(e) => setEditingStudent({ ...editingStudent, name: e.target.value })}
                              className="border rounded px-2 py-1 w-full"
                            />
                          ) : (
                            student.name
                          )}
                        </td>
                        <td className="text-center py-3 px-4">
                          {editingStudent?.id === student.id ? (
                            <select
                              value={editingStudent.gender}
                              onChange={(e) => setEditingStudent({ ...editingStudent, gender: e.target.value as 'male' | 'female' })}
                              className="border rounded px-2 py-1"
                            >
                              <option value="male">זכר</option>
                              <option value="female">נקבה</option>
                            </select>
                          ) : (
                            <span className={student.gender === 'male' ? 'text-blue-600' : 'text-pink-600'}>
                              {student.gender === 'male' ? '👦' : '👧'}
                            </span>
                          )}
                        </td>
                        {selectedSport && (
                          <>
                            <td className="text-center py-3 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={measurements.first ?? ''}
                                onChange={(e) => handleMeasurementChange(student.id, 'first', e.target.value)}
                                className={`w-24 text-center border rounded p-1 ${isFirstBetter ? 'bg-green-50 border-green-200' : ''}`}
                                placeholder="הזן תוצאה"
                              />
                            </td>
                            <td className="text-center py-3 px-4">
                              <input
                                type="number"
                                step="0.01"
                                value={measurements.second ?? ''}
                                onChange={(e) => handleMeasurementChange(student.id, 'second', e.target.value)}
                                className={`w-24 text-center border rounded p-1 ${isSecondBetter ? 'bg-green-50 border-green-200' : ''}`}
                                placeholder="הזן תוצאה"
                              />
                            </td>
                            <td className="text-center py-3 px-4">
                              {hasValidMeasurements && (
                                <span className={
                                  (((measurements.second as number) - (measurements.first as number)) / (measurements.first as number)) * 100 > 0
                                    ? 'text-green-600'
                                    : 'text-red-600'
                                }>
                                  {(((measurements.second as number) - (measurements.first as number)) / (measurements.first as number) * 100).toFixed(1)}%
                                </span>
                              )}
                            </td>
                          </>
                        )}
                        <td className="text-center py-3 px-4">
                          <div className="flex items-center justify-center gap-2">
                            {editingStudent?.id === student.id ? (
                              <>
                                <button
                                  onClick={saveEditedStudent}
                                  className="p-1 text-green-600 hover:text-green-800"
                                >
                                  <Check size={20} />
                                </button>
                                <button
                                  onClick={() => setEditingStudent(null)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <X size={20} />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => handleEditStudent(student)}
                                  className="p-1 text-blue-600 hover:text-blue-800"
                                >
                                  <Edit2 size={20} />
                                </button>
                                <button
                                  onClick={() => deleteStudent(student.id)}
                                  className="p-1 text-red-600 hover:text-red-800"
                                >
                                  <Trash2 size={20} />
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* מצטיינים */}
          {selectedSport && (
            <div className="bg-white rounded-xl shadow p-6 mb-8">
              <h3 className="text-xl font-semibold mb-4">מצטיינים בענף {sports.find(s => s.id === selectedSport)?.name}</h3>
              <div className="text-gray-500 text-sm mb-4">
                מוצגים שני התלמידים המצטיינים ביותר בכל מגדר, עם התוצאה הטובה ביותר והתאריך שבו הושגה.
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-700 mb-2">בנים</h4>
                  <div className="space-y-2">
                    {getTopPerformers(selectedSport).boys.map(student => {
                      const measurements = student.measurements[selectedSport];
                      const bestResult = (selectedSport === 'sprint' || selectedSport === 'long_run')
                        ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                        : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);
                      const isFirstBetter = measurements.first !== null && measurements.second !== null && 
                        ((selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? measurements.first < measurements.second
                          : measurements.first > measurements.second);
                      const bestDate = isFirstBetter ? measurements.firstDate : measurements.secondDate;
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between">
                          <span className="text-gray-700">{student.name}</span>
                          <div className="text-right">
                            <span className="text-blue-600 font-medium block">
                              {bestResult} {sports.find(s => s.id === selectedSport)?.unit}
                            </span>
                            {bestDate && (
                              <span className="text-xs text-gray-500 block">
                                {bestDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
                <div className="bg-pink-50 rounded-lg p-4">
                  <h4 className="font-medium text-pink-700 mb-2">בנות</h4>
                  <div className="space-y-2">
                    {getTopPerformers(selectedSport).girls.map(student => {
                      const measurements = student.measurements[selectedSport];
                      const bestResult = (selectedSport === 'sprint' || selectedSport === 'long_run')
                        ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                        : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);
                      const isFirstBetter = measurements.first !== null && measurements.second !== null && 
                        ((selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? measurements.first < measurements.second
                          : measurements.first > measurements.second);
                      const bestDate = isFirstBetter ? measurements.firstDate : measurements.secondDate;
                      
                      return (
                        <div key={student.id} className="flex items-center justify-between">
                          <span className="text-gray-700">{student.name}</span>
                          <div className="text-right">
                            <span className="text-pink-600 font-medium block">
                              {bestResult} {sports.find(s => s.id === selectedSport)?.unit}
                            </span>
                            {bestDate && (
                              <span className="text-xs text-gray-500 block">
                                {bestDate}
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

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
        </>
      )}
    </div>
  );
} 