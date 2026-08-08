import { ArrowLeft, Info } from 'lucide-react';

interface LeaderboardProps {
  onBack: () => void;
  currentUser?: any;
}

const topStudents = [
  {
    rank: 2,
    name: 'Sohan Guptha',
    university: 'Gokaraju Rangaraju Institute',
    score: 479040,
    streak: 973,
    avatar: '👨‍💼',
    position: 'silver'
  },
  {
    rank: 1,
    name: 'Maneesh',
    university: 'Chaitanya (Deemed To Be University)',
    score: 491398,
    streak: 987,
    avatar: '👨‍🎓',
    position: 'gold'
  },
  {
    rank: 3,
    name: 'Sai',
    university: 'Anurag Engineering College (ACE)',
    score: 476639,
    streak: 971,
    avatar: '👨‍💻',
    position: 'bronze'
  },
];

const leaderboardData = [
  { rank: 6678, name: 'Karthik Sai', university: 'NIIT University (NIIT)', score: 2475, streak: 4, avatar: '👨', isYou: true, badge: '2' },
  { rank: 1, name: 'Maneesh', university: 'Chaitanya (Deemed To Be University)', score: 491398, streak: 987, avatar: '👨‍🎓', badge: '🏆' },
  { rank: 2, name: 'Sohan Guptha', university: 'Gokaraju Rangaraju Institute Of Engineering & Technology (GRIET)', score: 479040, streak: 973, avatar: '👨‍💼', badge: '🥈' },
  { rank: 3, name: 'Sai', university: 'Anurag Engineering College (ACE)', score: 476639, streak: 971, avatar: '👨‍💻', badge: '🥉' },
  { rank: 4, name: 'Pooja. S', university: 'Vysya College', score: 468274, streak: 966, avatar: '👩', badge: '' },
  { rank: 5, name: 'Rahul Kumar', university: 'SRM Institute of Science and Technology', score: 465890, streak: 958, avatar: '👨‍🔬', badge: '' },
  { rank: 6, name: 'Priya Singh', university: 'VIT Vellore', score: 462120, streak: 945, avatar: '👩‍💼', badge: '' },
  { rank: 7, name: 'Arjun Reddy', university: 'BITS Pilani', score: 458670, streak: 932, avatar: '👨‍🎨', badge: '' },
  { rank: 8, name: 'Sneha Patel', university: 'IIT Bombay', score: 455340, streak: 928, avatar: '👩‍🔬', badge: '' },
  { rank: 9, name: 'Vikram Mehta', university: 'NIT Trichy', score: 452100, streak: 915, avatar: '👨‍💼', badge: '' },
  { rank: 10, name: 'Anjali Sharma', university: 'Delhi Technological University', score: 448560, streak: 902, avatar: '👩‍🎓', badge: '' },
];

export function Leaderboard({ onBack }: LeaderboardProps) {
  return (
    <div className="w-96 bg-gray-50 border-l border-gray-200 overflow-auto flex flex-col h-full">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 p-4 sticky top-0 z-10">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-700 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="font-medium">Back</span>
        </button>
        
        <div className="flex gap-4 border-b border-gray-200">
          <button className="pb-3 px-2 border-b-2 border-purple-600 text-purple-600 font-medium text-sm">
            Student Leaderboard
          </button>
          <button className="pb-3 px-2 text-gray-600 font-medium text-sm hover:text-gray-900">
            College Leaderboard
          </button>
        </div>
      </div>

      {/* Podium Section */}
      <div className="bg-gradient-to-b from-purple-50 to-white p-6 pb-8">
        <div className="flex items-end justify-center gap-4 mb-6">
          {/* Silver - 2nd Place */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🥈</div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center text-2xl mb-2 border-4 border-white shadow-lg">
              {topStudents[0].avatar}
            </div>
            <div className="text-sm font-semibold text-gray-800 text-center mb-1">{topStudents[0].name}</div>
            <div className="flex items-center gap-1 text-xs mb-2">
              <span>🪙</span>
              <span className="font-semibold">{topStudents[0].score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>🔥</span>
              <span>{topStudents[0].streak}</span>
            </div>
          </div>

          {/* Gold - 1st Place */}
          <div className="flex flex-col items-center -mt-6">
            <div className="text-5xl mb-2">🏆</div>
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-yellow-300 to-yellow-500 flex items-center justify-center text-3xl mb-2 border-4 border-white shadow-xl">
              {topStudents[1].avatar}
            </div>
            <div className="text-base font-bold text-gray-800 text-center mb-1">{topStudents[1].name}</div>
            <div className="flex items-center gap-1 text-sm mb-2">
              <span>🪙</span>
              <span className="font-bold">{topStudents[1].score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>🔥</span>
              <span>{topStudents[1].streak}</span>
            </div>
          </div>

          {/* Bronze - 3rd Place */}
          <div className="flex flex-col items-center">
            <div className="text-4xl mb-2">🥉</div>
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-400 to-orange-600 flex items-center justify-center text-2xl mb-2 border-4 border-white shadow-lg">
              {topStudents[2].avatar}
            </div>
            <div className="text-sm font-semibold text-gray-800 text-center mb-1">{topStudents[2].name}</div>
            <div className="flex items-center gap-1 text-xs mb-2">
              <span>🪙</span>
              <span className="font-semibold">{topStudents[2].score.toLocaleString()}</span>
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <span>🔥</span>
              <span>{topStudents[2].streak}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Leaderboard List */}
      <div className="flex-1 bg-white">
        {/* Table Header */}
        <div className="grid grid-cols-12 gap-2 px-4 py-3 border-b border-gray-200 bg-gray-50 text-xs font-semibold text-blue-600 sticky top-[140px]">
          <div className="col-span-1">Rank</div>
          <div className="col-span-6">Learners</div>
          <div className="col-span-3 text-right">Score</div>
          <div className="col-span-2 text-right">Streak</div>
        </div>

        {/* Leaderboard Items */}
        <div className="divide-y divide-gray-100">
          {leaderboardData.map((student, index) => (
            <div
              key={index}
              className={`grid grid-cols-12 gap-2 px-4 py-3 hover:bg-gray-50 transition-colors ${
                student.isYou ? 'bg-purple-50 border-l-4 border-purple-600' : ''
              }`}
            >
              {/* Rank */}
              <div className="col-span-1 flex items-center">
                <span className={`text-sm font-semibold ${student.isYou ? 'text-purple-600' : 'text-gray-700'}`}>
                  {student.rank}
                </span>
              </div>

              {/* Learner Info */}
              <div className="col-span-6 flex items-center gap-2 min-w-0">
                <div className="relative flex-shrink-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-purple-600 flex items-center justify-center text-lg">
                    {student.avatar}
                  </div>
                  {student.badge && (
                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-purple-600 rounded-full flex items-center justify-center text-xs border-2 border-white">
                      {student.badge}
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-semibold text-gray-800 truncate flex items-center gap-1">
                    {student.name}
                    {student.isYou && (
                      <span className="px-2 py-0.5 bg-purple-100 text-purple-700 text-xs rounded">You</span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 truncate">{student.university}</div>
                </div>
              </div>

              {/* Score */}
              <div className="col-span-3 flex items-center justify-end gap-1">
                <span className="text-sm">🪙</span>
                <span className="text-sm font-semibold text-gray-800">{student.score.toLocaleString()}</span>
              </div>

              {/* Streak */}
              <div className="col-span-2 flex items-center justify-end gap-1">
                <span className="text-sm">🔥</span>
                <span className="text-sm font-semibold text-gray-800">{student.streak}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="p-4 border-t border-gray-200 bg-white sticky bottom-0">
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-600">1 to 30 of 10447</span>
            <div className="flex items-center gap-1">
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-sm">
                1
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-sm">
                2
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-sm">
                3
              </button>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-sm">
                4
              </button>
              <span className="text-gray-400 px-2">...</span>
              <button className="w-8 h-8 flex items-center justify-center border border-gray-300 rounded hover:bg-gray-50 text-sm">
                349
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
