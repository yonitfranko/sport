import { useParams, useNavigate } from 'react-router-dom';
import { Users, Medal, TrendingUp, ClipboardList, ArrowRight, Save, X } from 'lucide-react';
import { useState } from 'react';

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
}

// Demo data with correct typing
const demoStudents: Student[] = [
  {
    id: 1,
    name: 'דניאל כהן',
    gender: 'male' as const,
    measurements: {
      sprint: { first: 12.5, second: 11.8 }
    }
  },
  {
    id: 2,
    name: 'מיכל לוי',
    gender: 'female' as const,
    measurements: {
      sprint: { first: 13.2, second: 12.9 }
    }
  }
];

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
  const [students, setStudents] = useState<Student[]>(demoStudents);
  const [editingStudent, setEditingStudent] = useState<number | null>(null);
  const [showAddStudent, setShowAddStudent] = useState(false);
  const [newStudent, setNewStudent] = useState({ name: '', gender: 'male' as 'male' | 'female' });

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

  const addNewStudent = () => {
    if (!newStudent.name.trim()) {
      alert('נא להזין שם תלמיד/ה');
      return;
    }

    const newId = Math.max(...students.map(s => s.id)) + 1;
    setStudents(prev => [...prev, {
      id: newId,
      name: newStudent.name.trim(),
      gender: newStudent.gender,
      measurements: {}
    }]);

    setNewStudent({ name: '', gender: 'male' });
    setShowAddStudent(false);
  };

  const goBack = () => {
    navigate(-1);
  };

  const startEditing = (studentId: number) => {
    if (selectedSport) {
      setEditingStudent(studentId);
    }
  };

  const cancelEditing = () => {
    setEditingStudent(null);
  };

  const saveEditing = (studentId: number) => {
    if (!selectedSport) return;

    const first = parseFloat(student.measurements[selectedSport].first.toString());
    const second = parseFloat(student.measurements[selectedSport].second.toString());
    
    if (isNaN(first) || isNaN(second)) {
      alert('נא להזין מספרים תקינים');
      return;
    }

    setStudents(prevStudents => 
      prevStudents.map(student => {
        if (student.id === studentId) {
          return {
            ...student,
            measurements: {
              ...student.measurements,
              [selectedSport]: { first, second }
            }
          };
        }
        return student;
      })
    );

    setEditingStudent(null);
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
              <p className="text-xl font-bold">32</p>
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
              <p className="text-xl font-bold">8</p>
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
              <p className="text-xl font-bold">12%</p>
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
              <p className="text-xl font-bold">24</p>
            </div>
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
                  setEditingStudent(null);
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
                        onClick={addNewStudent}
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
                      <tr className="border-b">
                        <th className="text-right py-2 px-4 font-medium text-gray-500">שם התלמיד/ה</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500">מדידה ראשונה</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500">מדידה שניה</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500">שיפור</th>
                        <th className="text-center py-2 px-4 font-medium text-gray-500">פעולות</th>
                      </tr>
                    </thead>
                    <tbody>
                      {students.map(student => {
                        const measurements = student.measurements[selectedSport] || { first: 0, second: 0 };
                        const isEditing = editingStudent === student.id;
                        const currentSport = sportTypes.find(s => s.id === selectedSport);
                        let improvement = '-';
                        
                        if (measurements.first && measurements.second) {
                          const diff = (selectedSport === 'sprint' || selectedSport === 'long_run')
                            ? ((measurements.first - measurements.second) / measurements.first * 100)
                            : ((measurements.second - measurements.first) / measurements.first * 100);
                          improvement = `${diff > 0 ? '+' : ''}${diff.toFixed(1)}%`;
                        }

                        return (
                          <tr key={student.id} className="border-b last:border-0">
                            <td className="py-2 px-4">{student.name}</td>
                            <td className="text-center py-2 px-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={measurements.first || ''}
                                    onChange={(e) => handleMeasurementChange(student.id, 'first', e.target.value)}
                                    placeholder="-"
                                    className={`w-20 text-center border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                      measurements.first && measurements.second && 
                                      ((selectedSport === 'sprint' || selectedSport === 'long_run')
                                        ? measurements.first < measurements.second
                                        : measurements.first > measurements.second)
                                      ? 'bg-green-50 border-green-200'
                                      : ''
                                    }`}
                                  />
                                  <span className="text-sm text-gray-500">{currentSport?.unit}</span>
                                </div>
                                {measurements.firstDate && (
                                  <span className="text-xs text-gray-500">{measurements.firstDate}</span>
                                )}
                              </div>
                            </td>
                            <td className="text-center py-2 px-4">
                              <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-1">
                                  <input
                                    type="number"
                                    step="0.1"
                                    value={measurements.second || ''}
                                    onChange={(e) => handleMeasurementChange(student.id, 'second', e.target.value)}
                                    placeholder="-"
                                    className={`w-20 text-center border rounded px-2 py-1 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                                      measurements.first && measurements.second && 
                                      ((selectedSport === 'sprint' || selectedSport === 'long_run')
                                        ? measurements.second < measurements.first
                                        : measurements.second > measurements.first)
                                      ? 'bg-green-50 border-green-200'
                                      : ''
                                    }`}
                                  />
                                  <span className="text-sm text-gray-500">{currentSport?.unit}</span>
                                </div>
                                {measurements.secondDate && (
                                  <span className="text-xs text-gray-500">{measurements.secondDate}</span>
                                )}
                              </div>
                            </td>
                            <td className={`text-center py-2 px-4 ${improvement.startsWith('+') ? 'text-green-600' : improvement !== '-' ? 'text-red-600' : 'text-gray-500'}`}>
                              {improvement}
                            </td>
                            <td className="text-center py-2 px-4">
                              <button
                                onClick={() => startEditing(student.id)}
                                className="text-sm text-indigo-600 hover:text-indigo-800"
                              >
                                ערוך
                              </button>
                            </td>
                          </tr>
                        );
                      })}
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
                      {getTopPerformers(selectedSport).boys.map((student, index) => {
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
                      {getTopPerformers(selectedSport).girls.map((student, index) => {
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