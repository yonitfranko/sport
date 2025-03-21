import { useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Trophy, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

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

export default function SportPage() {
  const { sportId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [topPerformers, setTopPerformers] = useState<GradeTopStudents[]>([]);

  // מיפוי ענפי הספורט
  const sportTypes = {
    'sprint': { name: 'ספרינט', icon: '🏃', unit: 'שניות', isLowerBetter: true },
    'long_jump': { name: 'קפיצה למרחק', icon: '↔️', unit: 'מטרים', isLowerBetter: false },
    'high_jump': { name: 'קפיצה לגובה', icon: '↕️', unit: 'מטרים', isLowerBetter: false },
    'ball_throw': { name: 'זריקת כדור', icon: '🏐', unit: 'מטרים', isLowerBetter: false },
    'long_run': { name: 'ריצה ארוכה', icon: '🏃‍♂️', unit: 'דקות', isLowerBetter: true }
  };

  const grades = [
    { id: 'ד', name: 'שכבה ד׳' },
    { id: 'ה', name: 'שכבה ה׳' },
    { id: 'ו', name: 'שכבה ו׳' },
    { id: 'ז', name: 'שכבה ז׳' },
    { id: 'ח', name: 'שכבה ח׳' }
  ];

  useEffect(() => {
    if (!sportId || !sportTypes[sportId as keyof typeof sportTypes]) {
      navigate('/');
      return;
    }

    const loadTopPerformers = () => {
      setLoading(true);
      try {
        // טעינת התלמידים מ-localStorage
        const studentsData = localStorage.getItem('students');
        if (!studentsData) {
          setTopPerformers([]);
          return;
        }

        const students = JSON.parse(studentsData);
        const sport = sportTypes[sportId as keyof typeof sportTypes];
        
        // מציאת המצטיינים לכל שכבה
        const topPerformersByGrade = grades.map(grade => {
          // סינון תלמידים של השכבה הנוכחית שיש להם מדידות בענף הספורט הנבחר
          const gradeStudents = students.filter((s: any) => 
            s.grade === grade.id && 
            s.measurements[sportId]
          );

          // מיון התלמידים לפי התוצאה הטובה ביותר
          const sortedStudents = gradeStudents
            .map((student: any) => {
              const measurements = student.measurements[sportId];
              const bestResult = sport.isLowerBetter
                ? Math.min(measurements.first || Infinity, measurements.second || Infinity)
                : Math.max(measurements.first || -Infinity, measurements.second || -Infinity);
              const isFirstBetter = sport.isLowerBetter
                ? measurements.first < measurements.second
                : measurements.first > measurements.second;
              
              return {
                name: student.name,
                class: student.class,
                result: bestResult,
                date: isFirstBetter ? measurements.firstDate : measurements.secondDate
              };
            })
            .sort((a: TopStudent, b: TopStudent) => 
              sport.isLowerBetter 
                ? a.result - b.result 
                : b.result - a.result
            )
            .slice(0, 4); // לקיחת 4 המצטיינים בלבד

          return {
            gradeId: grade.id,
            gradeName: grade.name,
            students: sortedStudents
          };
        });

        setTopPerformers(topPerformersByGrade);
      } catch (error) {
        console.error('Error loading top performers:', error);
      } finally {
        setLoading(false);
      }
    };

    loadTopPerformers();
  }, [sportId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const sport = sportTypes[sportId as keyof typeof sportTypes];
  if (!sport) return null;

  return (
    <div className="p-6 space-y-6">
      {/* כותרת */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="text-3xl">{sport.icon}</span>
          <h1 className="text-2xl font-bold">{sport.name}</h1>
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
        {topPerformers.map((gradeData) => (
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
    </div>
  );
} 