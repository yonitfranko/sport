import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Save, 
  Trash2, 
  Plus, 
  Download,
  Settings as SettingsIcon,
  ChevronDown,
  X
} from 'lucide-react';

interface SystemSettings {
  schoolName: string;
  currentYear: string;
  schoolYearStart: string;
  schoolYearEnd: string;
  improvementThreshold: number;
  measurementFrequency: 'monthly' | 'quarterly';
  firstMeasurementMonth: string;
  secondMeasurementMonth: string;
  exportFormat: 'excel' | 'csv';
  exportLanguage: 'he' | 'en';
  theme: 'light' | 'dark';
  fontSize: 'small' | 'medium' | 'large';
  notifications: {
    upcomingMeasurements: boolean;
    noImprovement: boolean;
    topPerformers: boolean;
  };
  topPerformers: {
    class: {
      male: number;
      female: number;
    };
    grade: {
      male: number;
      female: number;
    };
  };
  sports: {
    id: string;
    name: string;
    description: string;
    icon: string;
    unit: string;
    isLowerBetter: boolean;
  }[];
  grades: {
    id: string;
    name: string;
    classes: string[];
  }[];
}

const defaultSettings: SystemSettings = {
  schoolName: '',
  currentYear: new Date().getFullYear().toString(),
  schoolYearStart: '2024-09-01',
  schoolYearEnd: '2025-06-30',
  improvementThreshold: 5,
  measurementFrequency: 'monthly',
  firstMeasurementMonth: '09',
  secondMeasurementMonth: '03',
  exportFormat: 'excel',
  exportLanguage: 'he',
  theme: 'light',
  fontSize: 'medium',
  notifications: {
    upcomingMeasurements: true,
    noImprovement: true,
    topPerformers: true
  },
  topPerformers: {
    class: {
      male: 2,
      female: 2
    },
    grade: {
      male: 4,
      female: 4
    }
  },
  sports: [
    { id: 'sprint', name: 'ספרינט', description: '100 מטר', icon: '🏃', unit: 'שניות', isLowerBetter: true },
    { id: 'long_jump', name: 'קפיצה למרחק', description: 'קפיצה למרחק', icon: '↔️', unit: 'מטרים', isLowerBetter: false },
    { id: 'high_jump', name: 'קפיצה לגובה', description: 'קפיצה לגובה', icon: '↕️', unit: 'מטרים', isLowerBetter: false },
    { id: 'ball_throw', name: 'זריקת כדור', description: 'זריקת כדור', icon: '🏐', unit: 'מטרים', isLowerBetter: false },
    { id: 'long_run', name: 'ריצה ארוכה', description: '2000 מטר', icon: '🏃‍♂️', unit: 'דקות', isLowerBetter: true }
  ],
  grades: [
    { id: 'ד', name: 'שכבה ד׳', classes: ['ד1', 'ד2', 'ד3', 'ד4'] },
    { id: 'ה', name: 'שכבה ה׳', classes: ['ה1', 'ה2', 'ה3'] },
    { id: 'ו', name: 'שכבה ו׳', classes: ['ו1', 'ו2', 'ו3', 'ו4'] },
    { id: 'ז', name: 'שכבה ז׳', classes: ['ז1', 'ז2', 'ז3'] },
    { id: 'ח', name: 'שכבה ח׳', classes: ['ח1', 'ח2', 'ח3', 'ח4'] }
  ]
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState<SystemSettings>(defaultSettings);
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newSport, setNewSport] = useState({ name: '', description: '', icon: '', unit: '', isLowerBetter: true });
  const [newGrade, setNewGrade] = useState({ id: '', name: '', classes: [''] });
  const [newClass, setNewClass] = useState('');
  const [isGradesAccordionOpen, setIsGradesAccordionOpen] = useState(true);
  const [isSportsAccordionOpen, setIsSportsAccordionOpen] = useState(true);

  const commonIcons = [
    '🏃', '🏃‍♂️', '🏃‍♀️', '⚽', '🏀', '🏈', '⚾', '🏐', '🏉', '🎾', '🏓', '🏸', '🏒', '🏑', '🏏',
    '🏊', '🏊‍♂️', '🏊‍♀️', '🚴', '🚴‍♂️', '🚴‍♀️', '🚵', '🚵‍♂️', '🚵‍♀️', '🏋️', '🏋️‍♂️', '🏋️‍♀️',
    '🤸', '🤸‍♂️', '🤸‍♀️', '⛹️', '⛹️‍♂️', '⛹️‍♀️', '🏅', '🎖️', '🏆', '🎯', '🎳', '🏹', '🤺',
    '🏂', '⛷️', '🏎️', '🏍️', '🤾', '🤾‍♂️', '🤾‍♀️', '🏌️', '🏌️‍♂️', '🏌️‍♀️', '🏇', '🤹', '🤹‍♂️', '🤹‍♀️'
  ];

  useEffect(() => {
    // טעינת הגדרות מ-localStorage
    const savedSettings = localStorage.getItem('systemSettings');
    if (savedSettings) {
      setSettings(JSON.parse(savedSettings));
    }
  }, []);

  const handleSave = () => {
    console.log('SettingsPage: Saving settings:', settings);
    setIsSaving(true);
    try {
      localStorage.setItem('systemSettings', JSON.stringify(settings));
      setSaveMessage({ type: 'success', text: 'ההגדרות נשמרו בהצלחה!' });
      setShowSuccess(true);
    } catch (error) {
      setSaveMessage({ type: 'error', text: 'שגיאה בשמירת ההגדרות' });
    } finally {
      setIsSaving(false);
      setTimeout(() => {
        setSaveMessage(null);
        setShowSuccess(false);
      }, 3000);
    }
  };

  const handleReset = () => {
    if (confirm('האם אתה בטוח שברצונך לאפס את כל ההגדרות?')) {
      setSettings(defaultSettings);
      localStorage.setItem('systemSettings', JSON.stringify(defaultSettings));
      setSaveMessage({ type: 'success', text: 'ההגדרות אופסו בהצלחה!' });
      setTimeout(() => setSaveMessage(null), 3000);
    }
  };

  const addSport = () => {
    if (!newSport.name || !newSport.description || !newSport.icon || !newSport.unit) {
      alert('נא למלא את כל השדות הנדרשים');
      return;
    }
    
    const sportId = newSport.name.toLowerCase().replace(/\s+/g, '_');
    
    // בדיקה אם הענף כבר קיים
    if (settings.sports.some(s => s.id === sportId)) {
      alert('ענף ספורט עם שם זה כבר קיים');
      return;
    }

    const newSportWithId = {
      ...newSport,
      id: sportId
    };

    setSettings(prev => ({
      ...prev,
      sports: [...prev.sports, newSportWithId]
    }));

    // איפוס הטופס
    setNewSport({
      name: '',
      description: '',
      icon: '',
      unit: '',
      isLowerBetter: true
    });

    // שמירת ההגדרות
    localStorage.setItem('systemSettings', JSON.stringify({
      ...settings,
      sports: [...settings.sports, newSportWithId]
    }));
  };

  const removeSport = (sportId: string) => {
    setSettings(prev => ({
      ...prev,
      sports: prev.sports.filter(s => s.id !== sportId)
    }));
  };

  const addGrade = () => {
    if (!newGrade.id || !newGrade.name || !newGrade.classes[0]) return;
    
    setSettings(prev => ({
      ...prev,
      grades: [...prev.grades, { ...newGrade }]
    }));
    setNewGrade({ id: '', name: '', classes: [''] });
  };

  const removeGrade = (gradeId: string) => {
    setSettings(prev => ({
      ...prev,
      grades: prev.grades.filter(g => g.id !== gradeId)
    }));
  };

  const addClassToGrade = (gradeId: string) => {
    if (!newClass.trim()) return;
    
    setSettings(prev => ({
      ...prev,
      grades: prev.grades.map(grade => 
        grade.id === gradeId 
          ? { ...grade, classes: [...grade.classes, newClass.trim()] }
          : grade
      )
    }));
    setNewClass('');
  };

  const removeClassFromGrade = (gradeId: string, className: string) => {
    setSettings(prev => ({
      ...prev,
      grades: prev.grades.map(grade => 
        grade.id === gradeId 
          ? { ...grade, classes: grade.classes.filter(c => c !== className) }
          : grade
      )
    }));
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold">הגדרות מערכת</h2>
          <p className="text-gray-600 mt-2">
            הגדר את ההעדפות והפרמטרים של המערכת. שינויים אלה ישפיעו על אופן הפעולה של המערכת כולה.
          </p>
        </div>
        <button
          onClick={() => navigate('/')}
          className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
        >
          חזרה
        </button>
      </div>

      {saveMessage && (
        <div className={`mb-4 p-4 rounded-lg ${
          saveMessage.type === 'success' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'
        }`}>
          {saveMessage.text}
        </div>
      )}

      <div className="space-y-6">
        {/* School Name Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4">שם בית הספר</h3>
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={settings.schoolName}
              onChange={(e) => setSettings({ ...settings, schoolName: e.target.value })}
              className="border rounded px-4 py-2 flex-1"
              placeholder="הזן את שם בית הספר"
            />
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={settings.currentYear}
                onChange={(e) => setSettings({ ...settings, currentYear: e.target.value })}
                className="border rounded px-4 py-2 w-32"
                placeholder="שנה"
              />
              <span className="text-gray-600">תשפ"ד</span>
            </div>
          </div>
        </div>

        {/* Grades and Classes Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button
            onClick={() => setIsGradesAccordionOpen(!isGradesAccordionOpen)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-lg font-bold text-gray-700">שכבות וכיתות</h3>
            <ChevronDown
              className={`transform transition-transform ${
                isGradesAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isGradesAccordionOpen && (
            <div className="space-y-4">
              {/* Add New Grade Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-3">הוספת שכבה חדשה</h4>
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={newGrade.id}
                    onChange={(e) => setNewGrade({ ...newGrade, id: e.target.value })}
                    placeholder="קוד שכבה"
                    className="flex-1 p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newGrade.name}
                    onChange={(e) => setNewGrade({ ...newGrade, name: e.target.value })}
                    placeholder="שם שכבה"
                    className="flex-1 p-2 border rounded"
                  />
                  <button
                    onClick={addGrade}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    הוסף
                  </button>
                </div>
              </div>

              {/* Grades List */}
              <div className="space-y-4">
                {settings.grades.map((grade) => (
                  <div key={grade.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-medium">{grade.name}</h3>
                      <button
                        onClick={() => removeGrade(grade.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                    <div className="space-y-2">
                      {grade.classes.map((cls) => (
                        <div key={cls} className="flex items-center gap-2">
                          <input
                            type="text"
                            value={cls}
                            onChange={(e) => setSettings(prev => ({
                              ...prev,
                              grades: prev.grades.map((g) =>
                                g.id === grade.id ? { ...g, classes: g.classes.map((c) => c === cls ? e.target.value : c) } : g
                              )
                            }))}
                            className="flex-1 p-1 border rounded"
                          />
                          <button
                            onClick={() => removeClassFromGrade(grade.id, cls)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={20} />
                          </button>
                        </div>
                      ))}
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={newClass}
                          onChange={(e) => setNewClass(e.target.value)}
                          placeholder="הוסף כיתה חדשה"
                          className="flex-1 p-1 border rounded"
                        />
                        <button
                          onClick={() => addClassToGrade(grade.id)}
                          className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          הוסף
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sports Section */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <button
            onClick={() => setIsSportsAccordionOpen(!isSportsAccordionOpen)}
            className="w-full flex items-center justify-between mb-4"
          >
            <h3 className="text-lg font-bold text-gray-700">ענפי ספורט</h3>
            <ChevronDown
              className={`transform transition-transform ${
                isSportsAccordionOpen ? 'rotate-180' : ''
              }`}
            />
          </button>
          {isSportsAccordionOpen && (
            <div className="space-y-4">
              {/* Add New Sport Form */}
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium text-gray-700 mb-3">הוספת ענף ספורט חדש</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <input
                    type="text"
                    value={newSport.name}
                    onChange={(e) => setNewSport({ ...newSport, name: e.target.value })}
                    placeholder="שם הענף"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newSport.description}
                    onChange={(e) => setNewSport({ ...newSport, description: e.target.value })}
                    placeholder="תיאור"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newSport.icon}
                    onChange={(e) => setNewSport({ ...newSport, icon: e.target.value })}
                    placeholder="אייקון"
                    className="p-2 border rounded"
                  />
                  <input
                    type="text"
                    value={newSport.unit}
                    onChange={(e) => setNewSport({ ...newSport, unit: e.target.value })}
                    placeholder="יחידת מידה"
                    className="p-2 border rounded"
                  />
                  <select
                    value={newSport.isLowerBetter ? 'true' : 'false'}
                    onChange={(e) => setNewSport({ ...newSport, isLowerBetter: e.target.value === 'true' })}
                    className="p-2 border rounded"
                  >
                    <option value="false">ערך גבוה יותר טוב</option>
                    <option value="true">ערך נמוך יותר טוב</option>
                  </select>
                  <button
                    onClick={addSport}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    הוסף ענף
                  </button>
                </div>
              </div>

              {/* Sports List */}
              <div className="space-y-4">
                {settings.sports.map((sport, index) => (
                  <div key={sport.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-4">
                        <input
                          type="text"
                          value={sport.name}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sports: prev.sports.map((s, i) =>
                              i === index ? { ...s, name: e.target.value } : s
                            )
                          }))}
                          className="border rounded px-2 py-1"
                          placeholder="שם הענף"
                        />
                        <input
                          type="text"
                          value={sport.description}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sports: prev.sports.map((s, i) =>
                              i === index ? { ...s, description: e.target.value } : s
                            )
                          }))}
                          className="border rounded px-2 py-1"
                          placeholder="תיאור"
                        />
                        <input
                          type="text"
                          value={sport.icon}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sports: prev.sports.map((s, i) =>
                              i === index ? { ...s, icon: e.target.value } : s
                            )
                          }))}
                          className="border rounded px-2 py-1"
                          placeholder="אייקון"
                        />
                        <input
                          type="text"
                          value={sport.unit}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sports: prev.sports.map((s, i) =>
                              i === index ? { ...s, unit: e.target.value } : s
                            )
                          }))}
                          className="border rounded px-2 py-1"
                          placeholder="יחידת מידה"
                        />
                        <select
                          value={sport.isLowerBetter ? 'true' : 'false'}
                          onChange={(e) => setSettings(prev => ({
                            ...prev,
                            sports: prev.sports.map((s, i) =>
                              i === index ? { ...s, isLowerBetter: e.target.value === 'true' } : s
                            )
                          }))}
                          className="border rounded px-2 py-1"
                        >
                          <option value="false">ערך גבוה יותר טוב</option>
                          <option value="true">ערך נמוך יותר טוב</option>
                        </select>
                        <button
                          onClick={() => removeSport(sport.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={20} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* הגדרות מדידות */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            הגדרות מדידות
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                אחוז שיפור מינימלי למצטיין (%)
              </label>
              <input
                type="number"
                value={settings.improvementThreshold}
                onChange={(e) => setSettings({ ...settings, improvementThreshold: Number(e.target.value) })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                min="0"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-1">
                תדירות מדידות
              </label>
              <select
                value={settings.measurementFrequency}
                onChange={(e) => setSettings({ ...settings, measurementFrequency: e.target.value as 'monthly' | 'quarterly' })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="monthly">חודשי</option>
                <option value="quarterly">רבעוני</option>
              </select>
            </div>
          </div>
        </div>

        {/* הגדרות ייצוא */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <Download className="w-5 h-5" />
            הגדרות ייצוא
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                פורמט קובץ
              </label>
              <select
                value={settings.exportFormat}
                onChange={(e) => setSettings({ ...settings, exportFormat: e.target.value as 'excel' | 'csv' })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="excel">Excel</option>
                <option value="csv">CSV</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                שפת ייצוא
              </label>
              <select
                value={settings.exportLanguage}
                onChange={(e) => setSettings({ ...settings, exportLanguage: e.target.value as 'he' | 'en' })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="he">עברית</option>
                <option value="en">English</option>
              </select>
            </div>
          </div>
        </div>

        {/* הגדרות תצוגה */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            הגדרות תצוגה
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                ערכת נושא
              </label>
              <select
                value={settings.theme}
                onChange={(e) => setSettings({ ...settings, theme: e.target.value as 'light' | 'dark' })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="light">בהיר</option>
                <option value="dark">כהה</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                גודל טקסט
              </label>
              <select
                value={settings.fontSize}
                onChange={(e) => setSettings({ ...settings, fontSize: e.target.value as 'small' | 'medium' | 'large' })}
                className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="small">קטן</option>
                <option value="medium">בינוני</option>
                <option value="large">גדול</option>
              </select>
            </div>
          </div>
        </div>

        {/* הגדרות התראות */}
        <div className="bg-white rounded-xl shadow p-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            הגדרות התראות
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                התראות למדידות קרובות
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.upcomingMeasurements}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, upcomingMeasurements: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                התראות לתלמידים ללא שיפור
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.noImprovement}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, noImprovement: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-gray-700">
                התראות למצטיינים
              </label>
              <input
                type="checkbox"
                checked={settings.notifications.topPerformers}
                onChange={(e) => setSettings({
                  ...settings,
                  notifications: { ...settings.notifications, topPerformers: e.target.checked }
                })}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
            </div>
          </div>
        </div>

        {/* הגדרות מצטיינים */}
        <div className="bg-white rounded-xl shadow p-6 mb-6">
          <h3 className="text-lg font-bold text-gray-700 mb-4 flex items-center gap-2">
            <SettingsIcon className="w-5 h-5" />
            הגדרות מצטיינים
          </h3>
          <div className="space-y-6">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">מצטיינים כיתתיים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר מצטיינים בנים
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={settings.topPerformers.class.male}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topPerformers: {
                          ...prev.topPerformers,
                          class: { ...prev.topPerformers.class, male: parseInt(e.target.value) }
                        }
                      }))}
                      className="w-full border rounded-lg p-2"
                    />
                    <span className="text-sm text-gray-500">תלמידים</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר מצטיינים בנות
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="1"
                      max="3"
                      value={settings.topPerformers.class.female}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topPerformers: {
                          ...prev.topPerformers,
                          class: { ...prev.topPerformers.class, female: parseInt(e.target.value) }
                        }
                      }))}
                      className="w-full border rounded-lg p-2"
                    />
                    <span className="text-sm text-gray-500">תלמידות</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-md font-medium mb-4">מצטיינים שכבתיים</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר מצטיינים בנים
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="3"
                      max="6"
                      value={settings.topPerformers.grade.male}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topPerformers: {
                          ...prev.topPerformers,
                          grade: { ...prev.topPerformers.grade, male: parseInt(e.target.value) }
                        }
                      }))}
                      className="w-full border rounded-lg p-2"
                    />
                    <span className="text-sm text-gray-500">תלמידים</span>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    מספר מצטיינים בנות
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min="3"
                      max="6"
                      value={settings.topPerformers.grade.female}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        topPerformers: {
                          ...prev.topPerformers,
                          grade: { ...prev.topPerformers.grade, female: parseInt(e.target.value) }
                        }
                      }))}
                      className="w-full border rounded-lg p-2"
                    />
                    <span className="text-sm text-gray-500">תלמידות</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* כפתורי פעולה */}
        <div className="flex justify-end gap-4">
          <button
            onClick={handleReset}
            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
          >
            אפס הגדרות
          </button>
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 flex items-center gap-2 disabled:opacity-50"
          >
            {isSaving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                שומר...
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                שמור הגדרות
              </>
            )}
          </button>
        </div>
      </div>

      {showSuccess && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg">
          ההגדרות נשמרו בהצלחה!
        </div>
      )}
    </div>
  );
} 