import { useState, useEffect } from 'react';
import { Info, CheckCircle2 } from 'lucide-react';
import { api } from '../lib/api';

interface Course {
  id: string;
  number: number;
  title: string;
  description: string;
  icon: string;
  topicsCount: number;
  tags: string[];
  progress: number;
  completed: boolean;
  color: string;
}

const defaultCourses: Course[] = [
  {
    id: 'trigonometry',
    number: 1,
    title: 'Trigonometry',
    description: 'Master trigonometric ratios, identities, equations, inverse functions, and applications.',
    icon: '📐',
    topicsCount: 13,
    tags: ['TRIGONOMETRY', 'ANGLES'],
    progress: 72,
    completed: false,
    color: 'from-cyan-500 to-blue-500'
  },
  {
    id: 'matrices',
    number: 2,
    title: 'Matrices & Determinants',
    description: 'Learn about matrix operations, determinants, inverse matrices, and their applications in solving equations.',
    icon: '📊',
    topicsCount: 12,
    tags: ['ALGEBRA', 'LINEAR ALGEBRA'],
    progress: 0,
    completed: false,
    color: 'from-purple-500 to-pink-500'
  },
  {
    id: 'coordinate',
    number: 3,
    title: 'Coordinate Geometry',
    description: 'Master straight lines, circles, parabolas, ellipses, and hyperbolas in 2D plane.',
    icon: '📐',
    topicsCount: 15,
    tags: ['GEOMETRY', '2D'],
    progress: 0,
    completed: false,
    color: 'from-blue-500 to-cyan-500'
  },
  {
    id: 'calculus',
    number: 4,
    title: 'Calculus',
    description: 'Understand limits, continuity, differentiation, integration and their real-world applications.',
    icon: '∫',
    topicsCount: 18,
    tags: ['CALCULUS', 'ADVANCED'],
    progress: 0,
    completed: false,
    color: 'from-green-500 to-emerald-500'
  },
  {
    id: 'probability',
    number: 5,
    title: 'Probability',
    description: 'Study probability theory, conditional probability, Bayes theorem, and distributions.',
    icon: '🎲',
    topicsCount: 10,
    tags: ['STATISTICS', 'PROBABILITY'],
    progress: 0,
    completed: false,
    color: 'from-indigo-500 to-purple-500'
  }
];

export function MyJourney() {
  const [courses, setCourses] = useState<Course[]>(defaultCourses);
  const [overallPct, setOverallPct] = useState(72);

  useEffect(() => {
    const stored = localStorage.getItem('user_session');
    const email = stored ? JSON.parse(stored).email : 'student@example.com';

    api.getJourneyMetrics(email)
      .then(res => {
        if (Array.isArray(res) && res.length > 0) {
          const trig = res.find((r: any) => r.chapter === 'Trigonometry');
          if (trig) {
            setCourses(prev => prev.map(c => c.id === 'trigonometry' ? { ...c, progress: trig.completionPct, completed: trig.completionPct >= 100 } : c));
            setOverallPct(trig.completionPct);
          }
        }
      })
      .catch(err => console.error("Failed to load journey metrics", err));
  }, []);
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-6">
        <div className="flex items-center gap-2 mb-2">
          <h1 className="text-2xl">My Journey</h1>
          <Info className="w-5 h-5 text-gray-400" />
        </div>
        <p className="text-gray-600 text-sm">Track your progress across all mathematics topics for JEE MAINS</p>
      </div>

      <div className="p-6">
        {/* Growth Cycle Header */}
        <div className="mb-6">
          <div className="text-sm text-gray-500 mb-1">GROWTH CYCLE 1</div>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-1">JEE MAINS Mathematics Mastery</h2>
              <p className="text-sm text-gray-600">Complete preparation for JEE MAINS • 120 Topics</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <div className="text-3xl font-bold text-purple-600">73%</div>
                <div className="text-xs text-gray-500">Overall Progress</div>
              </div>
              <div className="w-16 h-16">
                <svg className="transform -rotate-90" viewBox="0 0 36 36">
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#e5e7eb"
                    strokeWidth="3"
                  />
                  <path
                    d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                    fill="none"
                    stroke="#9333ea"
                    strokeWidth="3"
                    strokeDasharray="73, 100"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {courses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow cursor-pointer group"
            >
              {/* Card Header with Icon */}
              <div className={`bg-gradient-to-r ${course.color} p-6 relative`}>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center text-3xl border-2 border-white/30">
                      {course.icon}
                    </div>
                    <div>
                      <div className="text-white/80 text-xs mb-1">COURSE</div>
                      <div className="text-white font-semibold text-lg">
                        {course.number}. {course.title}
                      </div>
                    </div>
                  </div>
                  {course.completed && (
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-5 h-5 text-white" />
                    </div>
                  )}
                </div>

                {/* Progress Ring */}
                {!course.completed && (
                  <div className="absolute top-6 right-6">
                    <div className="relative w-14 h-14">
                      <svg className="transform -rotate-90 w-full h-full" viewBox="0 0 36 36">
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="rgba(255,255,255,0.3)"
                          strokeWidth="3"
                        />
                        <path
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="white"
                          strokeWidth="3"
                          strokeDasharray={`${course.progress}, 100`}
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold">
                        {course.progress}%
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Card Body */}
              <div className="p-6">
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                  {course.description}
                </p>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-700">
                    <span className="font-semibold">{course.topicsCount}</span> Topics
                  </div>
                  <div className="flex gap-2">
                    {course.tags.map((tag, index) => (
                      <span
                        key={index}
                        className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Progress Bar */}
                <div className="mt-4">
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`bg-gradient-to-r ${course.color} h-2 rounded-full transition-all`}
                      style={{ width: `${course.progress}%` }}
                    ></div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Stats Summary */}
        <div className="mt-8 grid grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-purple-600">10</div>
            <div className="text-sm text-gray-600 mt-1">Total Courses</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-green-600">1</div>
            <div className="text-sm text-gray-600 mt-1">Completed</div>
          </div>
          <div className="bg-white rounded-xl border border-gray-200 p-6 text-center">
            <div className="text-3xl font-bold text-orange-600">120</div>
            <div className="text-sm text-gray-600 mt-1">Total Topics</div>
          </div>
        </div>
      </div>
    </div>
  );
}
