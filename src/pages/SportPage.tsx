import { useParams, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft, ChevronDown } from 'lucide-react';

interface TopStudent {
  name: string;
  class: string;
  result: number;
  date: string;
}

interface GradeTopStudents {
  gradeId: string;
  gradeName: string;
  first: TopStudent[];
  second: TopStudent[];
}

interface Student {
  id: number;
  name: string;
  gender: 'male' | 'female';
  measurements: Measurement[];
  grade: string;
  class: string;
}

interface Grade {
  id: string;
  name: string;
  sportId: string;
  studentIds: number[];
  classes: string[];
}

interface Measurement {
  sportId: string;
  gradeId: string;
  first: number | null;
  second: number | null;
  firstDate?: string;
  secondDate?: string;
}

interface MeasurementResult {
  student: Student;
  first: number | null;
  second: number | null;
  firstDate: string;
  secondDate: string;
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
  const { sportId } = useParams<{ sportId: string }>();
  const navigate = useNavigate();
  const [students, setStudents] = useState<Student[]>([]);
  const [grades, setGrades] = useState<Grade[]>([]);
  const [loading, setLoading] = useState(true);
  const [openGrade, setOpenGrade] = useState<string | null>(null);
  const [topPerformers, setTopPerformers] = useState<GradeTopStudents[]>([]);
  const [sport, setSport] = useState<Sport | null>(null);

  useEffect(() => {
    const loadData = () => {
      try {
        const studentsData = localStorage.getItem('students');
        const gradesData = localStorage.getItem('grades');
        const sportsData = localStorage.getItem('sports');

        console.log('Raw data from localStorage:', { studentsData, gradesData, sportsData });

        if (studentsData && gradesData && sportsData) {
          const allStudents: Student[] = JSON.parse(studentsData);
          const allGrades: Grade[] = JSON.parse(gradesData);
          const allSports: Sport[] = JSON.parse(sportsData);

          console.log('Parsed data:', { 
            studentsCount: allStudents.length,
            gradesCount: allGrades.length,
            sportsCount: allSports.length
          });

          const currentSport = allSports.find(s => s.id === sportId);
          console.log('Found sport:', currentSport);
          
          if (currentSport) {
            setSport(currentSport);
            setStudents(allStudents);
            setGrades(allGrades);
          }
        }
      } catch (err) {
        console.error('Error loading data:', err);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [sportId]);

  useEffect(() => {
    if (!grades.length || !sport || !students.length || !sportId) {
      console.log('Missing required data:', {
        hasGrades: grades.length > 0,
        hasSport: !!sport,
        hasStudents: students.length > 0,
        sportId
      });
      return;
    }

    try {
      const top = grades.map(grade => {
        const gradeStudents = students.filter(s => s.grade === grade.id);
        console.log(`Processing grade ${grade.name}, found ${gradeStudents.length} students`);

        const measurements = gradeStudents.map(student => {
          // Check if student has measurements array
          if (!Array.isArray(student.measurements)) {
            console.log(`Student ${student.name} has no measurements array`);
            return null;
          }

          const measurement = student.measurements.find(m => m.sportId === sportId);
          if (!measurement) {
            console.log(`No measurement found for student ${student.name} in sport ${sportId}`);
            return null;
          }
          
          return {
            student,
            first: measurement.first,
            second: measurement.second,
            firstDate: measurement.firstDate ?? '',
            secondDate: measurement.secondDate ?? ''
          };
        }).filter((m): m is NonNullable<typeof m> => m !== null);

        console.log(`Found ${measurements.length} valid measurements for grade ${grade.name}`);

        const bestFirst = measurements
          .filter((m): m is typeof m & { first: number } => m.first !== null)
          .sort((a, b) => sport.isLowerBetter ? a.first - b.first : b.first - a.first)
          .slice(0, 4);

        const bestSecond = measurements
          .filter((m): m is typeof m & { second: number } => m.second !== null)
          .sort((a, b) => sport.isLowerBetter ? a.second - b.second : b.second - a.second)
          .slice(0, 4);

        console.log(`Top performers for grade ${grade.name}:`, {
          firstCount: bestFirst.length,
          secondCount: bestSecond.length
        });

        return {
          gradeId: grade.id,
          gradeName: grade.name,
          first: bestFirst.map(m => ({
            name: m.student.name,
            class: m.student.class,
            result: m.first,
            date: m.firstDate
          })),
          second: bestSecond.map(m => ({
            name: m.student.name,
            class: m.student.class,
            result: m.second,
            date: m.secondDate
          }))
        };
      });

      console.log('Setting top performers:', top);
      setTopPerformers(top);
    } catch (err) {
      console.error('Error processing measurements:', err);
    }
  }, [grades, students, sportId, sport]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!sport) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-gray-600">לא נמצא ענף ספורט</div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
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

      {/* Top Performers Grid */}
      <div className="space-y-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">מצטיינים שכבתיים</h2>
          <p className="text-gray-600">
            החלק הזה ייטען כאשר יהיו נתוני אמת. הוא יחפש את הציונים הטובים ביותר מכל שכבה בענף הספורט הנ"ל.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {topPerformers.map(gradeData => (
            <div
              key={gradeData.gradeId}
              className="bg-white rounded-xl shadow-lg p-6"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-800">{gradeData.gradeName}</h2>
                <Trophy className="text-yellow-500" size={24} />
              </div>
              
              <div className="space-y-4">
                {gradeData.first.length > 0 && (
                  <div className="text-center text-gray-500 py-2">
                    מדידה ראשונה
                  </div>
                )}
                {gradeData.first.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-50' :
                      index === 1 ? 'bg-gray-50' :
                      index === 2 ? 'bg-orange-50' :
                      'bg-blue-50'
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">כיתה {item.class}</div>
                    <div className="mt-1 font-bold text-gray-800">
                      {item.result} {sport.unit}
                    </div>
                    {item.date && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="space-y-4 mt-4">
                {gradeData.second.length > 0 && (
                  <div className="text-center text-gray-500 py-2">
                    מדידה שנייה
                  </div>
                )}
                {gradeData.second.map((item, index) => (
                  <div
                    key={index}
                    className={`p-3 rounded-lg ${
                      index === 0 ? 'bg-yellow-50' :
                      index === 1 ? 'bg-gray-50' :
                      index === 2 ? 'bg-orange-50' :
                      'bg-blue-50'
                    }`}
                  >
                    <div className="font-medium">{item.name}</div>
                    <div className="text-sm text-gray-600">כיתה {item.class}</div>
                    <div className="mt-1 font-bold text-gray-800">
                      {item.result} {sport.unit}
                    </div>
                    {item.date && (
                      <div className="text-xs text-gray-500 mt-1">
                        {new Date(item.date).toLocaleDateString('he-IL')}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Classes Accordion */}
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