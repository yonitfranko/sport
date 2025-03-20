import { useParams, useNavigate } from 'react-router-dom';
import { Users, Medal, TrendingUp, ClipboardList, ArrowRight, Trash2, Download, Edit2, Check, X, SortAsc, Filter } from 'lucide-react';
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

  // אם הדף בטעינה, מציג אנימציית טעינה
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // אם אין תלמידים בכיתה, מציג הודעה מתאימה
  if (students.length === 0) {
    return (
      <div className="p-6">
        <div className="bg-yellow-50 text-yellow-600 p-4 rounded-lg mb-4">
          לא נמצאו תלמידים בכיתה זו
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
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <button
          onClick={goBack}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <ArrowRight className="text-gray-600" size={24} />
        </button>
        <div className="flex items-center justify-between flex-1">
          <h2 className="text-xl font-bold text-gray-700">כיתה {classId}</h2>
          <span className="px-3 py-1 bg-indigo-100 text-indigo-700 rounded-full text-sm font-medium">
            שכבה {gradeId}
          </span>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-100 p-3 rounded-lg">
              <Users className="text-blue-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">תלמידים</p>
              <p className="text-xl font-bold">{stats.totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-amber-100 p-3 rounded-lg">
              <Medal className="text-amber-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">מצטיינים</p>
              <p className="text-xl font-bold">{stats.topPerformers}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-green-100 p-3 rounded-lg">
              <TrendingUp className="text-green-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">שיפור חודשי</p>
              <p className="text-xl font-bold">{stats.monthlyImprovement.toFixed(1)}%</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow p-4">
          <div className="flex items-center gap-3">
            <div className="bg-purple-100 p-3 rounded-lg">
              <ClipboardList className="text-purple-600" size={24} />
            </div>
            <div>
              <p className="text-sm text-gray-500">מדידות החודש</p>
              <p className="text-xl font-bold">{stats.monthlyMeasurements}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="bg-white rounded-xl shadow p-4">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex gap-4">
            <select
              value={sortBy || ''}
              onChange={(e) => setSortBy(e.target.value as 'name' | 'measurements' | null)}
              className="border rounded-lg px-3 py-2"
            >
              <option value="">מיין לפי...</option>
              <option value="name">שם</option>
              {selectedSport && <option value="measurements">תוצאות</option>}
            </select>
            {sortBy && (
              <button
                onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
                className="flex items-center gap-2 px-3 py-2 border rounded-lg"
              >
                <SortAsc className={sortOrder === 'desc' ? 'transform rotate-180' : ''} />
                {sortOrder === 'asc' ? 'עולה' : 'יורד'}
              </button>
            )}
            <select
              value={genderFilter}
              onChange={(e) => setGenderFilter(e.target.value as 'all' | 'male' | 'female')}
              className="border rounded-lg px-3 py-2"
            >
              <option value="all">כל המגדרים</option>
              <option value="male">בנים</option>
              <option value="female">בנות</option>
            </select>
          </div>
          <div className="flex gap-4">
            <button
              onClick={exportToExcel}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
            >
              <Download size={20} />
              ייצא לאקסל
            </button>
            <button
              onClick={() => setShowAddStudent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              הוסף תלמיד/ה
            </button>
          </div>
        </div>
      </div>

      {/* Sports Grid */}
      <div className="bg-white rounded-xl shadow">
        <div className="p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">ענפי ספורט</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {sportTypes.map(sport => (
              <button
                key={sport.id}
                onClick={() => {
                  setSelectedSport(sport.id);
                }}
                className={`w-full h-12 rounded-lg p-2 text-white transition-all ${getButtonColorClass(sport.id)} ${
                  selectedSport === sport.id ? 'ring-2 ring-offset-2' : ''
                }`}
              >
                <div className="flex items-center justify-center gap-2">
                  <span className="text-xl">{sport.name}</span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Measurements and Top Performers */}
        {selectedSport && (
          <div className="border-t">
            <div className="p-6">
              <div className="mb-6">
                <div className="flex justify-between items-center mb-4">
                  <h4 className="text-lg font-medium text-gray-700">מדידות</h4>
                  <button
                    onClick={() => setShowAddStudent(true)}
                    className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors"
                  >
                    הוסף תלמיד/ה
                  </button>
                </div>

                {showAddStudent && (
                  <div className="bg-gray-50 p-4 rounded-lg mb-4">
                    <div className="flex gap-4 items-center">
                      <input
                        type="text"
                        value={newStudent.name}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="שם התלמיד/ה"
                        className="flex-1 p-2 border rounded-lg"
                      />
                      <select
                        value={newStudent.gender}
                        onChange={(e) => setNewStudent(prev => ({ ...prev, gender: e.target.value as 'male' | 'female' }))}
                        className="p-2 border rounded-lg"
                      >
                        <option value="male">זכר</option>
                        <option value="female">נקבה</option>
                      </select>
                      <button
                        onClick={addStudent}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                      >
                        הוסף
                      </button>
                      <button
                        onClick={() => setShowAddStudent(false)}
                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
                      >
                        ביטול
                      </button>
                    </div>
                  </div>
                )}

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

              <div>
                <h4 className="text-lg font-medium text-gray-700 mb-4">מצטיינים בתחום</h4>
                <p className="text-sm text-gray-500 mb-4">* מוצגת התוצאה הטובה ביותר מבין שתי המדידות</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-blue-50 rounded-lg p-4">
                    <h5 className="font-medium text-blue-700 mb-2">בנים</h5>
                    <div className="space-y-2">
                      {getTopPerformers(selectedSport).boys.map(student => {
                        const measurements = student.measurements[selectedSport];
                        const bestResult = (selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                          : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);
                        const isFirstBetter = (selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? measurements.first < measurements.second
                          : measurements.first > measurements.second;
                        const bestDate = isFirstBetter ? measurements.firstDate : measurements.secondDate;
                        
                        return (
                          <div key={student.id} className="flex items-center justify-between">
                            <span className="text-gray-700">{student.name}</span>
                            <div className="text-right">
                              <span className="text-blue-600 font-medium block">
                                {bestResult} {sportTypes.find(s => s.id === selectedSport)?.unit}
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
                    <h5 className="font-medium text-pink-700 mb-2">בנות</h5>
                    <div className="space-y-2">
                      {getTopPerformers(selectedSport).girls.map(student => {
                        const measurements = student.measurements[selectedSport];
                        const bestResult = (selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                          : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);
                        const isFirstBetter = (selectedSport === 'sprint' || selectedSport === 'long_run')
                          ? measurements.first < measurements.second
                          : measurements.first > measurements.second;
                        const bestDate = isFirstBetter ? measurements.firstDate : measurements.secondDate;
                        
                        return (
                          <div key={student.id} className="flex items-center justify-between">
                            <span className="text-gray-700">{student.name}</span>
                            <div className="text-right">
                              <span className="text-pink-600 font-medium block">
                                {bestResult} {sportTypes.find(s => s.id === selectedSport)?.unit}
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
            </div>
          </div>
        )}
      </div>
    </div>
  );
} 