import { useParams, useNavigate } from 'react-router-dom';
import { Users, Medal, TrendingUp, ClipboardList, ArrowRight, Trash2, Download, Edit2, Check, X, SortAsc } from 'lucide-react';
import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';

interface Measurement {
  first: number;
  second: number;
  firstDate?: string;
  secondDate?: string;
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

const sportTypes = [
  { id: 'sprint', name: 'ריצת 100 מטר', unit: 'שניות' },
  { id: 'long_run', name: 'ריצת 2000 מטר', unit: 'שניות' },
  { id: 'long_jump', name: 'קפיצה למרחק', unit: 'מטרים' },
  { id: 'high_jump', name: 'קפיצה לגובה', unit: 'מטרים' }
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

export default function ClassPage() {
  const { gradeId, classId } = useParams();
  const navigate = useNavigate();
  const [selectedSport, setSelectedSport] = useState<string | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gender: 'male' as 'male' | 'female' });
  const [editingStudent, setEditingStudent] = useState<Student | null>(null);
  const [sortBy, setSortBy] = useState<'name' | 'measurements' | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [genderFilter, setGenderFilter] = useState<'all' | 'male' | 'female'>('all');

  useEffect(() => {
    const loadStudents = () => {
      try {
        setLoading(true);
        setError(null);

        // בדיקת פרמטרים
        if (!gradeId || !classId) {
          throw new Error('מזהה כיתה או שכבה חסרים');
        }

        console.log('Loading students for grade:', gradeId, 'class:', classId); // DEBUG

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

    loadStudents();
  }, [gradeId, classId]);

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

  const getCurrentDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  const handleMeasurementChange = (studentId: number, field: 'first' | 'second', value: string) => {
    if (!selectedSport) return;

    const numValue = parseFloat(value);
    if (isNaN(numValue)) return;

    setStudents(prevStudents =>
      prevStudents.map(student => {
        if (student.id === studentId) {
          const currentMeasurements = student.measurements[selectedSport] || { first: 0, second: 0 };
          return {
            ...student,
            measurements: {
              ...student.measurements,
              [selectedSport]: {
                ...currentMeasurements,
                [field]: numValue,
                [`${field}Date`]: getCurrentDate()
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
    navigate(-1);
  };

  const getTopPerformers = (sportId: string) => {
    const filteredStudents = students.filter(s => s.measurements[sportId]?.first || s.measurements[sportId]?.second);
    
    const getBestResult = (student: Student) => {
      const measurements = student.measurements[sportId];
      if (!measurements) return Infinity;
      
      const first = measurements.first || Infinity;
      const second = measurements.second || Infinity;
      
      if (sportId === 'sprint' || sportId === 'long_run') {
        return Math.min(first, second);
      }
      return Math.max(first, second);
    };

    const boys = filteredStudents
      .filter(s => s.gender === 'male')
      .sort((a, b) => {
        const aBest = getBestResult(a);
        const bBest = getBestResult(b);
        if (sportId === 'sprint' || sportId === 'long_run') {
          return aBest - bBest;
        }
        return bBest - aBest;
      })
      .slice(0, 2);

    const girls = filteredStudents
      .filter(s => s.gender === 'female')
      .sort((a, b) => {
        const aBest = getBestResult(a);
        const bBest = getBestResult(b);
        if (sportId === 'sprint' || sportId === 'long_run') {
          return aBest - bBest;
        }
        return bBest - aBest;
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
    const sportType = selectedSport ? sportTypes.find(s => s.id === selectedSport) : null;
    
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

    if (sortBy === 'name') {
      sortedStudents.sort((a, b) => {
        return sortOrder === 'asc' ? 
          a.name.localeCompare(b.name) : 
          b.name.localeCompare(a.name);
      });
    } else if (sortBy === 'measurements' && selectedSport) {
      sortedStudents.sort((a, b) => {
        const aValue = a.measurements[selectedSport]?.second || a.measurements[selectedSport]?.first || 0;
        const bValue = b.measurements[selectedSport]?.second || b.measurements[selectedSport]?.first || 0;
        return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
      });
    }

    return sortedStudents;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">כיתה {classId}</h2>
        <button
          onClick={goBack}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          חזרה
        </button>
      </div>

      {/* ענפי ספורט */}
      <div className="mb-8">
        <h3 className="text-xl font-semibold mb-4">בחר ענף ספורט</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sportTypes.map(sport => (
            <button
              key={sport.id}
              onClick={() => setSelectedSport(sport.id)}
              className={`p-4 rounded-lg text-white ${
                selectedSport === sport.id
                  ? getButtonColorClass(sport.id)
                  : 'bg-gray-400 hover:bg-gray-500'
              }`}
            >
              {sport.name}
            </button>
          ))}
        </div>
      </div>

      {/* הוספת תלמיד */}
      <div className="mb-8">
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
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold">תלמידי הכיתה</h3>
              <div className="flex gap-4">
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
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-50 border-b">
                    <th className="text-right py-3 px-4 font-medium text-gray-500">שם התלמיד/ה</th>
                    <th className="text-center py-3 px-4 font-medium text-gray-500">מגדר</th>
                    {selectedSport && (
                      <>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">מדידה ראשונה</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">מדידה שניה</th>
                        <th className="text-center py-3 px-4 font-medium text-gray-500">שיפור</th>
                      </>
                    )}
                    <th className="text-center py-3 px-4 font-medium text-gray-500">פעולות</th>
                  </tr>
                </thead>
                <tbody>
                  {getSortedStudents().map(student => (
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
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={student.measurements[selectedSport]?.first || ''}
                                  onChange={(e) => handleMeasurementChange(student.id, 'first', e.target.value)}
                                  placeholder="-"
                                  className={`w-20 text-center border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    student.measurements[selectedSport]?.first && student.measurements[selectedSport]?.second && 
                                    ((selectedSport === 'sprint' || selectedSport === 'long_run')
                                      ? student.measurements[selectedSport].first < student.measurements[selectedSport].second
                                      : student.measurements[selectedSport].first > student.measurements[selectedSport].second)
                                      ? 'bg-green-50 border-green-200'
                                      : ''
                                  }`}
                                />
                                <span className="text-sm text-gray-500">{sportTypes.find(s => s.id === selectedSport)?.unit}</span>
                              </div>
                              {student.measurements[selectedSport]?.firstDate && (
                                <span className="text-xs text-gray-500">{student.measurements[selectedSport].firstDate}</span>
                              )}
                            </div>
                          </td>
                          <td className="text-center py-3 px-4">
                            <div className="flex flex-col items-center gap-1">
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={student.measurements[selectedSport]?.second || ''}
                                  onChange={(e) => handleMeasurementChange(student.id, 'second', e.target.value)}
                                  placeholder="-"
                                  className={`w-20 text-center border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                    student.measurements[selectedSport]?.first && student.measurements[selectedSport]?.second && 
                                    ((selectedSport === 'sprint' || selectedSport === 'long_run')
                                      ? student.measurements[selectedSport].second < student.measurements[selectedSport].first
                                      : student.measurements[selectedSport].second > student.measurements[selectedSport].first)
                                      ? 'bg-green-50 border-green-200'
                                      : ''
                                  }`}
                                />
                                <span className="text-sm text-gray-500">{sportTypes.find(s => s.id === selectedSport)?.unit}</span>
                              </div>
                              {student.measurements[selectedSport]?.secondDate && (
                                <span className="text-xs text-gray-500">{student.measurements[selectedSport].secondDate}</span>
                              )}
                            </div>
                          </td>
                          <td className={`text-center py-3 px-4 ${
                            student.measurements[selectedSport]?.first && student.measurements[selectedSport]?.second ? 
                              `${(((student.measurements[selectedSport].second - student.measurements[selectedSport].first) / student.measurements[selectedSport].first) * 100).toFixed(1)}%`
                              : ''
                          }`}>
                            {student.measurements[selectedSport]?.first && student.measurements[selectedSport]?.second ? 
                              `${(((student.measurements[selectedSport].second - student.measurements[selectedSport].first) / student.measurements[selectedSport].first) * 100).toFixed(1)}%`
                              : '-'}
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
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* סטטיסטיקות */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-8">
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