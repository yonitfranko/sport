import { Upload, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

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
  const [uploadError, setUploadError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setUploadError(null);
    
    if (!file) return;

    // בדיקת סוג הקובץ
    if (!file.name.endsWith('.xlsx') && !file.name.endsWith('.xls')) {
      setUploadError('נא להעלות קובץ אקסל בלבד (.xlsx או .xls)');
      return;
    }

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      
      // בדיקה שיש לפחות גיליון אחד
      if (workbook.SheetNames.length === 0) {
        setUploadError('הקובץ ריק - לא נמצאו גליונות');
        return;
      }

      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);

      // בדיקה שיש נתונים בקובץ
      if (jsonData.length === 0) {
        setUploadError('לא נמצאו נתונים בקובץ');
        return;
      }

      // וידוא שיש את כל העמודות הנדרשות
      const requiredColumns = ['שם', 'מגדר', 'כיתה'];
      const headers = Object.keys(jsonData[0] || {});
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));

      if (missingColumns.length > 0) {
        setUploadError(`חסרות העמודות הבאות: ${missingColumns.join(', ')}`);
        return;
      }

      // המרת הנתונים למבנה הנכון
      const students: Student[] = [];
      let hasErrors = false;
      const errors: string[] = [];

      for (let i = 0; i < jsonData.length; i++) {
        const row = jsonData[i] as any;
        console.log('Processing row:', row); // DEBUG
        
        // בדיקת תקינות השדות
        if (!row['שם']?.toString().trim()) {
          errors.push(`שורה ${i + 1}: חסר שם תלמיד`);
          hasErrors = true;
          continue;
        }

        if (!row['כיתה']?.toString().trim()) {
          errors.push(`שורה ${i + 1}: חסרה כיתה`);
          hasErrors = true;
          continue;
        }

        const gender = row['מגדר']?.toString().toLowerCase();
        if (gender !== 'זכר' && gender !== 'נקבה') {
          errors.push(`שורה ${i + 1}: מגדר חייב להיות 'זכר' או 'נקבה'`);
          hasErrors = true;
          continue;
        }

        const classInfo = row['כיתה'].toString().trim();
        const grade = classInfo.charAt(0);
        
        // בדיקה שהכיתה תקינה
        const validGrade = grades.find(g => g.id === grade);
        if (!validGrade) {
          errors.push(`שורה ${i + 1}: שכבה לא תקינה - ${grade}`);
          hasErrors = true;
          continue;
        }

        if (!validGrade.classes.includes(classInfo)) {
          errors.push(`שורה ${i + 1}: כיתה לא תקינה - ${classInfo}`);
          hasErrors = true;
          continue;
        }

        const student: Student = {
          id: i + 1,
          name: row['שם'].toString().trim(),
          gender: gender === 'זכר' ? 'male' : 'female',
          class: classInfo,
          grade: grade,
          measurements: {}
        };
        
        console.log('Adding student:', student); // DEBUG
        students.push(student);
      }

      if (hasErrors) {
        setUploadError(`נמצאו שגיאות בקובץ:\n${errors.join('\n')}`);
        return;
      }

      // שמירת הנתונים ב-localStorage
      localStorage.setItem('students', JSON.stringify(students));
      console.log('Saved students:', students); // DEBUG
      
      alert(`${students.length} תלמידים נטענו בהצלחה!`);
      
      try {
        // ניווט לכיתה הראשונה שנטענה
        if (students.length > 0) {
          const firstStudent = students[0];
          if (firstStudent.grade && firstStudent.class) {
            console.log('Navigating to:', `/class/${firstStudent.grade}/${firstStudent.class}`); // DEBUG
            // שימוש ב-setTimeout כדי לתת ל-localStorage להתעדכן
            setTimeout(() => {
              navigate(`/class/${firstStudent.grade}/${firstStudent.class}`);
            }, 100);
          } else {
            console.error('Missing grade or class information for navigation');
          }
        }
      } catch (error) {
        console.error('Navigation error:', error);
      }

      // ניקוי שדה הקובץ
      event.target.value = '';

    } catch (error) {
      console.error('Error reading Excel file:', error);
      setUploadError('שגיאה בקריאת הקובץ. אנא ודא שהקובץ תקין ומכיל את העמודות הנדרשות.');
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
      
      {/* Sports Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">ענפי ספורט</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {sportTypes.map(sport => (
            <button
              key={sport.id}
              onClick={() => handleSportClick(sport.id)}
              className={`${getButtonColorClass(sport.id)} rounded-lg p-4 text-white text-center transition-all`}
            >
              <div className="text-2xl mb-2">{sport.icon}</div>
              <div className="font-medium">{sport.name}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Classes Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">כיתות</h3>
        <div className="space-y-4">
          {grades.map(grade => (
            <div key={grade.id} className="border rounded-lg overflow-hidden">
              <button
                onClick={() => toggleGrade(grade.id)}
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
                      onClick={() => navigateToClass(grade.id, classId)}
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

      {/* Excel Upload Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">העלאת רשימת תלמידים</h3>
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-700 mb-2">מבנה הקובץ הנדרש:</h4>
            <ul className="list-disc list-inside text-blue-600 space-y-1">
              <li>עמודת 'שם' - שם התלמיד/ה</li>
              <li>עמודת 'מגדר' - זכר/נקבה</li>
              <li>עמודת 'כיתה' - למשל: ו2</li>
            </ul>
          </div>
          
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
              <span className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 cursor-pointer">
                בחר קובץ
              </span>
            </label>
          </div>

          {uploadError && (
            <div className="bg-red-50 text-red-600 p-4 rounded-lg whitespace-pre-line">
              {uploadError}
            </div>
          )}
        </div>
      </div>

      {/* Recent Measurements Section */}
      <div className="bg-white rounded-xl shadow p-6">
        <h3 className="text-lg font-bold text-gray-700 mb-4">מדידות אחרונות</h3>
        <div className="space-y-3">
          {recentMeasurements.map((measurement, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
            >
              <div>
                <span className="font-medium">{measurement.studentName}</span>
                <span className="text-gray-500 text-sm"> • כיתה {measurement.className}</span>
              </div>
              <div className="text-right">
                <div className="font-medium text-gray-900">{measurement.result}</div>
                <div className="text-sm text-gray-500">{measurement.sport}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 