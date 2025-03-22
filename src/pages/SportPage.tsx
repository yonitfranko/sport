import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import XLSX from 'xlsx';

interface TopStudent {
  name: string;
  class: string;
  result: number;
  date: string;
}

interface GradeTopStudents {
  gradeId: string;
  gradeName: string;
  students: TopStudent[];
}

interface Student {
  id: number;
  name: string;
  gender: 'male' | 'female';
  measurements: {
    [key: string]: {
      first: number | null;
      second: number | null;
      firstDate?: string | null;
      secondDate?: string | null;
    };
  };
  grade: string;
  class: string;
}

interface Grade {
  id: string;
  name: string;
  classes: string[];
}

interface Sport {
  id: string;
  name: string;
  description: string;
  icon: string;
  unit: string;
  isLowerBetter: boolean;
}

export default function SportPage() {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [topPerformers, setTopPerformers] = useState<GradeTopStudents[]>([]);
  const [sport, setSport] = useState<Sport | null>(null);
  const [sports, setSports] = useState<Sport[]>([]);

  useEffect(() => {
    console.log('SportPage: Component mounted');
  }, []);

  useEffect(() => {
    const loadData = () => {
      try {
        setLoading(true);
        setError(null);

        // טעינת תלמידים מה-localStorage
        const savedStudents = localStorage.getItem('students');
        if (savedStudents) {
          setStudents(JSON.parse(savedStudents));
        }

        // טעינת הגדרות המערכת
        const savedSettings = localStorage.getItem('systemSettings');
        if (savedSettings) {
          const settings = JSON.parse(savedSettings);
          if (settings.grades) {
            setGrades(settings.grades);
          }
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);

        const newStudents: Student[] = jsonData.map((row: any) => ({
          id: Math.random(),
          name: row['שם'] || '',
          gender: row['מגדר'] === 'זכר' ? 'male' : 'female',
          measurements: {},
          grade: row['כיתה'] || '',
          class: row['שכבה'] || ''
        }));

        const existingStudents = localStorage.getItem('students');
        const allStudents = existingStudents ? JSON.parse(existingStudents) : [];
        const updatedStudents = [...allStudents, ...newStudents];
        localStorage.setItem('students', JSON.stringify(updatedStudents));
        setStudents(updatedStudents);
        setUploadError(null);
      } catch (err) {
        console.error('Error processing file:', err);
        setUploadError('שגיאה בעיבוד הקובץ');
      }
    };

    reader.readAsArrayBuffer(file);
  };

  const getTopPerformers = (gradeId: string, classId: string) => {
    const gradeStudents = students.filter(s => s.grade === gradeId && s.class === classId);
    
    const getBestResult = (student: Student) => {
      const measurements = student.measurements;
      if (!measurements) return 0;
      
      return Object.values(measurements).reduce((best, measurement) => {
        if (!measurement.first || !measurement.second) return best;
        const improvement = ((measurement.second - measurement.first) / measurement.first) * 100;
        return Math.max(best, improvement);
      }, 0);
    };

    const boys = gradeStudents
      .filter(s => s.gender === 'male')
      .sort((a, b) => getBestResult(b) - getBestResult(a))
      .slice(0, 2);

    const girls = gradeStudents
      .filter(s => s.gender === 'female')
      .sort((a, b) => getBestResult(b) - getBestResult(a))
      .slice(0, 2);

    return { boys, girls };
  };

  useEffect(() => {
    const loadSettings = () => {
      try {
        console.log('Loading settings for sport:', sportId);
        const savedSettings = localStorage.getItem('systemSettings');
        
        if (!savedSettings) {
          console.error('No settings found in localStorage');
          return;
        }

        const settings = JSON.parse(savedSettings);
        console.log('Parsed settings:', settings);

        if (!settings.grades || !settings.sports || !Array.isArray(settings.grades) || !Array.isArray(settings.sports)) {
          console.error('Invalid settings structure:', settings);
          return;
        }

        setGrades(settings.grades);

        if (!sportId) {
          console.error('No sportId in URL params');
          return;
        }

        const foundSport = settings.sports.find((s: Sport) => s.id === sportId);
        console.log('Found sport:', foundSport);

        if (!foundSport) {
          console.error('Sport not found:', sportId);
          return;
        }

        setSport(foundSport);
        loadTopPerformers(foundSport, settings.grades);
      } catch (error) {
        console.error('Error in loadSettings:', error);
      }
    };

    const loadTopPerformers = (currentSport: Sport, currentGrades: Grade[]) => {
      try {
        const studentsData = localStorage.getItem('students');
        if (!studentsData) {
          console.log('No students data found');
          setTopPerformers([]);
          return;
        }

        const students = JSON.parse(studentsData);
        console.log('Loaded students:', students);
        
        const topPerformersByGrade = currentGrades.map(grade => {
          const gradeStudents = students.filter((s: any) => 
            s.grade === grade.id && 
            s.measurements[sportId]
          );

          const sortedStudents = gradeStudents
            .map((student: any) => {
              const measurements = student.measurements[sportId];
              if (!measurements) return null;

              const bestResult = currentSport.isLowerBetter
                ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);

              if (bestResult === Infinity || bestResult === -Infinity) return null;

              const isFirstBetter = currentSport.isLowerBetter
                ? measurements.first < (measurements.second || Infinity)
                : measurements.first > (measurements.second || -Infinity);
              
              return {
                name: student.name,
                class: student.class,
                result: bestResult,
                date: isFirstBetter ? measurements.firstDate : measurements.secondDate
              };
            })
            .filter((s): s is TopStudent => s !== null)
            .sort((a, b) => 
              currentSport.isLowerBetter 
                ? a.result - b.result 
                : b.result - a.result
            )
            .slice(0, 4);

          return {
            gradeId: grade.id,
            gradeName: grade.name,
            students: sortedStudents
          };
        });

        console.log('Setting top performers:', topPerformersByGrade);
        setTopPerformers(topPerformersByGrade);
      } catch (error) {
        console.error('Error in loadTopPerformers:', error);
        setTopPerformers([]);
      }
    };

    loadSettings();
  }, [sportId]);

  const toggleGrade = (gradeId: string) => {
    setOpenGrade(openGrade === gradeId ? null : gradeId);
  };

  const navigateToClass = (gradeId: string, classId: string) => {
    navigate(`/class/${gradeId}/${classId}`);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!sport) return null;

  return (
    <div className="p-6 space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{sport.icon}</span>
          <div>
            <h1 className="text-2xl font-bold">{sport.name}</h1>
            <div className="text-gray-600">{sport.description}</div>
          </div>
        </div>
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <ArrowLeft size={20} />
          חזרה
        </button>
      </div>

      {/* רשימת המצטיינים לפי שכבות */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
        {topPerformers.map(gradeData => (
          <div
            key={gradeData.gradeId}
            className="bg-white rounded-xl shadow-lg p-6 transform hover:scale-105 transition-transform"
          >
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800">{gradeData.gradeName}</h2>
              <Trophy className="text-yellow-500" size={24} />
            </div>
            
            <div className="space-y-4">
              {gradeData.students.length > 0 ? (
                gradeData.students.map((student, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-50' :
                      index === 1 ? 'bg-gray-50' :
                      index === 2 ? 'bg-orange-50' :
                      'bg-blue-50'
                    }`}
                  >
                    <div className="font-medium">{student.name}</div>
                    <div className="text-sm text-gray-600">כיתה {student.class}</div>
                    <div className="mt-1 font-bold text-gray-800">
                      {student.result} {sport.unit}
                    </div>
                    {student.date && (
                      <div className="text-xs text-gray-500 mt-1">
                        {student.date}
                      </div>
                    )}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-4">
                  אין מדידות בשכבה זו
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* רשימת השכבות להזנת מדידות */}
      <div className="bg-white rounded-xl shadow p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">הזנת מדידות חדשות</h2>
        <div className="space-y-4">
          {grades.map(grade => (
            <div key={grade.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => setOpenGrade(openGrade === grade.id ? null : grade.id)}
                className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100"
              >
                <span className="font-medium">{grade.name}</span>
                <ChevronDown
                  className={`transform transition-transform ${
                    openGrade === grade.id ? 'rotate-180' : ''
                  }`}
                />
              </button>
              {openGrade === grade.id && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4">
                  {grade.classes.map(classId => (
                    <button
                      key={classId}
                      onClick={() => navigate(`/class/${grade.id}/${classId}`)}
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg p-3 text-center transition-colors"
                    >
                      כיתה {classId}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 