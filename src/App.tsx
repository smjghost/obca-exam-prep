import React, { useState, useEffect } from 'react';
import { BookOpen, FileText, BookmarkX, Download, PlayCircle } from 'lucide-react';
import { Flashcard } from './types';
import { PracticeMode } from './components/PracticeMode';
import { ExamMode } from './components/ExamMode';

function App() {
  const [activeTab, setActiveTab] = useState<'practice' | 'exam'>('practice');
  const [wrongCards, setWrongCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('oceanbase_wrong_cards');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('oceanbase_wrong_cards', JSON.stringify(wrongCards));
  }, [wrongCards]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 font-sans selection:bg-blue-100 selection:text-blue-900 flex flex-col items-center p-4 sm:p-6 md:p-8">
      {/* Header */}
      <header className="w-full max-w-3xl mb-8 mt-2 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-3">
            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-sm shadow-blue-600/20">
              <BookOpen className="w-5 h-5 text-white" />
            </div>
            OBCA 刷题神器
          </h1>
          <p className="text-sm text-slate-500 mt-2 font-medium">OceanBase 数据库认证专员备考专属</p>
        </div>
        
        {/* Main Navigation Tabs */}
        <div className="flex bg-slate-200/50 p-1 rounded-xl shadow-inner border border-slate-200/60 w-fit">
          <button
            onClick={() => setActiveTab('practice')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'practice'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <FileText className="w-4 h-4" /> 自由练习
          </button>
          <button
            onClick={() => setActiveTab('exam')}
            className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-bold transition-all ${
              activeTab === 'exam'
                ? 'bg-white text-blue-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-700 hover:bg-slate-200/50'
            }`}
          >
            <PlayCircle className="w-4 h-4" /> 模拟考试
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      {activeTab === 'practice' ? (
        <PracticeMode wrongCards={wrongCards} setWrongCards={setWrongCards} />
      ) : (
        <ExamMode wrongCards={wrongCards} setWrongCards={setWrongCards} />
      )}
    </div>
  );
}

export default App;
