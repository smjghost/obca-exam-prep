import React, { useState, useEffect, useMemo } from 'react';
import Papa from 'papaparse';
import {
  ClipboardList,
  RotateCw,
  PlayCircle,
  History,
  Clock,
  Trophy,
  CheckCircle2,
  XCircle,
  Star,
  LayoutGrid,
  X,
  Keyboard,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Trash2,
} from 'lucide-react';
import { Flashcard, ExamRecord, ExamDetail } from '../types';
import { getRowField, cleanQuestionText, parseAnswer, formatTime, getTypeColor, parseQuestion } from '../utils';

const FILE_URLS: Record<string, string> = {
  '单选题.csv': 'single.csv',
  '多选题.csv': 'multiple.csv',
  '判断题.csv': 'true_false.csv',
};

export function ExamMode({
  wrongCards,
  setWrongCards,
}: {
  wrongCards: Flashcard[];
  setWrongCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}) {
  const [phase, setPhase] = useState<'setup' | 'running' | 'review'>('setup');
  const [examCards, setExamCards] = useState<Flashcard[]>([]);
  const [examAnswers, setExamAnswers] = useState<Record<number, string[]>>({});
  const [examMarked, setExamMarked] = useState<Record<number, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(3600); // 60 mins
  const [loading, setLoading] = useState(false);
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showExitModal, setShowExitModal] = useState(false);
  const [recordToDeleteId, setRecordToDeleteId] = useState<string | null>(null);

  const [examHistory, setExamHistory] = useState<ExamRecord[]>(() => {
    const saved = localStorage.getItem('oceanbase_exam_history');
    return saved ? JSON.parse(saved) : [];
  });
  const [currentRecord, setCurrentRecord] = useState<ExamRecord | null>(null);

  useEffect(() => {
    localStorage.setItem('oceanbase_exam_history', JSON.stringify(examHistory));
  }, [examHistory]);

  useEffect(() => {
    let timer: any;
    if (phase === 'running' && timeRemaining > 0) {
      timer = setInterval(() => setTimeRemaining((t) => t - 1), 1000);
    } else if (phase === 'running' && timeRemaining <= 0) {
      submitExam(true);
    }
    return () => clearInterval(timer);
  }, [phase, timeRemaining]);

  const generateExamPaper = async () => {
    setLoading(true);
    try {
      const rawBase = import.meta.env.BASE_URL || '/';
      const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;

      const fetchFile = async (name: string) => {
        const fileUrl = FILE_URLS[name];
        let res;
        let retries = 3;
        while (retries > 0) {
          try {
            res = await fetch(`${baseUrl}${fileUrl}`);
            if (res.ok) break;
          } catch (fetchErr) {
            if (retries === 1) throw fetchErr;
          }
          retries--;
          await new Promise(r => setTimeout(r, 1000));
        }
        if (!res || !res.ok) throw new Error('Network response was not ok');
        const text = await res.text();
        return new Promise<Flashcard[]>((resolve) => {
          Papa.parse(text, {
            header: true,
            skipEmptyLines: true,
            complete: (r) => {
              resolve(
                r.data
                  .map((row: any, idx) => ({
                    id: getRowField(row, '题号', 'ID', 'id') || String(idx + 1),
                    front: cleanQuestionText(getRowField(row, '题目(正面)', '正面', '题目', 'front')),
                    back: getRowField(row, '答案(背面)', '背面', '答案', 'back').trim(),
                    type: getRowField(row, '题型', 'type') || name.replace('.csv', ''),
                  }))
                  .filter((c) => c.front)
              );
            },
          });
        });
      };

      const [single, multi, tf] = await Promise.all([fetchFile('单选题.csv'), fetchFile('多选题.csv'), fetchFile('判断题.csv')]);

      const shuffle = (arr: any[]) => [...arr].sort(() => Math.random() - 0.5);

      const pickedSingle = shuffle(single).slice(0, 20);
      const pickedMulti = shuffle(multi).slice(0, 15);
      const pickedTf = shuffle(tf).slice(0, 15);

      const finalPaper = [...pickedTf, ...pickedSingle, ...pickedMulti];
      setExamCards(finalPaper);
      setExamAnswers({});
      setExamMarked({});
      setCurrentIndex(0);
      setTimeRemaining(3600);
      setPhase('running');
    } catch (err) {
      console.error('Failed to generate exam', err);
      alert('生成考卷失败，请检查网络或题库文件是否存在。');
    } finally {
      setLoading(false);
    }
  };

  const handleOptionClick = (label: string) => {
    if (phase !== 'running') return;
    const card = examCards[currentIndex];
    const isMultiple = card.type.includes('多选');
    const current = examAnswers[currentIndex] || [];

    if (isMultiple) {
      if (current.includes(label)) setExamAnswers({ ...examAnswers, [currentIndex]: current.filter((l) => l !== label) });
      else setExamAnswers({ ...examAnswers, [currentIndex]: [...current, label].sort() });
    } else {
      setExamAnswers({ ...examAnswers, [currentIndex]: [label] });
    }
  };

  const toggleMark = () => {
    setExamMarked((prev) => ({ ...prev, [currentIndex]: !prev[currentIndex] }));
  };

  const submitExam = (isTimeout = false) => {
    if (!isTimeout && !showConfirmModal) {
      setShowConfirmModal(true);
      return;
    }

    let score = 0;
    const details: ExamDetail[] = [];
    const newWrongCards = [...wrongCards];

    examCards.forEach((card, idx) => {
      const userAns = examAnswers[idx] || [];
      const isMulti = card.type.includes('多选');
      const isTf = card.type.includes('判断');

      const parsedAns = parseAnswer(card.back);
      let correctArr: string[] = [];
      if (isTf) {
        correctArr = [parsedAns.answer.includes('对') || parsedAns.answer.includes('正确') || parsedAns.answer === 'A' ? '正确' : '错误'];
      } else {
        correctArr = parsedAns.answer.match(/[A-G]/g) || [];
      }

      const sortedCorrect = correctArr.sort().join(',');
      const sortedUser = userAns.sort().join(',');
      const isCorrect = sortedCorrect === sortedUser && sortedCorrect !== '';

      if (isCorrect) {
        if (isTf) score += 1;
        else if (isMulti) score += 3;
        else score += 2;

        const wrongIdx = newWrongCards.findIndex((c) => c.front === card.front);
        if (wrongIdx !== -1) {
          newWrongCards.splice(wrongIdx, 1);
        }
      } else {
        if (!newWrongCards.find((c) => c.front === card.front)) {
          newWrongCards.push(card);
        }
      }

      details.push({ card, userAnswers: userAns, correctAnswers: correctArr, isCorrect });
    });

    setWrongCards(newWrongCards);

    const record: ExamRecord = {
      id: Date.now().toString(),
      date: new Date().toLocaleString('zh-CN', { hour12: false }),
      score,
      passed: score >= 60,
      timeSpent: 3600 - timeRemaining,
      details,
      markedStatus: examMarked,
    };

    const newHistory = [record, ...examHistory].slice(0, 20); // Keep last 20
    setExamHistory(newHistory);
    setCurrentRecord(record);
    setPhase('review');
    setCurrentIndex(0);
    setIsGridOpen(false);
    setShowConfirmModal(false);
  };

  const handleNext = () => {
    if (currentIndex < (phase === 'running' ? examCards.length : currentRecord?.details.length || 0) - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, phase, examCards.length, currentRecord]);

  const currentCard = phase === 'running' ? examCards[currentIndex] : currentRecord?.details[currentIndex]?.card;
  const parsedQuestion = useMemo(() => (currentCard ? parseQuestion(currentCard.front) : { stem: '', options: [] }), [currentCard]);
  const parsedAnswer = useMemo(() => (currentCard ? parseAnswer(currentCard.back) : { answer: '', explanation: '' }), [currentCard]);
  const isMulti = currentCard?.type.includes('多选');
  const isTf = currentCard?.type.includes('判断');
  const cardsCount = phase === 'running' ? examCards.length : currentRecord?.details.length || 0;

  if (phase === 'setup') {
    return (
      <div className="w-full max-w-3xl flex flex-col gap-6">
        <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <ClipboardList className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">OBCA 模拟考试全真演练</h2>
          <p className="text-slate-500 mb-8 max-w-lg mx-auto">
            全真模拟考试环境，系统将从题库中随机抽取题目。考试结束后系统将自动批改、计分，并同步错题至错题本。
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8 text-left">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-1">组卷规则</div>
              <div className="text-xs text-slate-500">
                判断 15题 (1分/题)
                <br />
                单选 20题 (2分/题)
                <br />
                多选 15题 (3分/题)
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-1">判分标准</div>
              <div className="text-xs text-slate-500">
                满分 100 分
                <br />
                及格线 60 分
                <br />
                <span className="text-rose-600">多选题必须全对才得分</span>
              </div>
            </div>
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100">
              <div className="text-sm font-semibold text-slate-700 mb-1">考试要求</div>
              <div className="text-xs text-slate-500">
                时长 60 分钟
                <br />
                超时自动强制交卷
                <br />
                考中不可看解析
              </div>
            </div>
          </div>

          <button
            onClick={generateExamPaper}
            disabled={loading}
            className="flex items-center justify-center gap-2 w-full md:w-auto md:px-12 py-3.5 mx-auto bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-base transition-colors shadow-sm disabled:opacity-70"
          >
            {loading ? <RotateCw className="w-5 h-5 animate-spin" /> : <PlayCircle className="w-5 h-5" />}
            {loading ? '正在生成试卷...' : '开始模拟考试'}
          </button>
        </div>

        {examHistory.length > 0 && (
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-slate-500" /> 历史模考成绩
            </h3>
            <div className="space-y-3">
              {examHistory.map((rec) => (
                <div key={rec.id} className="flex items-center justify-between p-3 rounded-lg border border-slate-100 bg-slate-50/50 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        rec.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {rec.score}
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-slate-700">{rec.date}</div>
                      <div className="text-xs text-slate-500">耗时 {formatTime(rec.timeSpent)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setCurrentRecord(rec);
                        setPhase('review');
                        setCurrentIndex(0);
                      }}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 px-3 py-1.5 rounded-lg transition-colors"
                    >
                      查看复盘
                    </button>
                    <button
                      onClick={() => setRecordToDeleteId(rec.id)}
                      className="text-xs font-medium text-rose-600 hover:text-rose-700 bg-rose-50 p-1.5 rounded-lg transition-colors"
                      title="删除记录"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {recordToDeleteId && (
          <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
             <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
                <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Trash2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-slate-800 mb-2">确认删除记录</h3>
                <p className="text-sm text-slate-500 mb-6">您确定要删除这条模考记录吗？删除后不可恢复。</p>
                <div className="flex items-center gap-3">
                   <button onClick={() => setRecordToDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">取消</button>
                   <button onClick={() => {
                     setExamHistory((prev) => prev.filter((r) => r.id !== recordToDeleteId));
                     setRecordToDeleteId(null);
                   }} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors">确认删除</button>
                </div>
             </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="w-full max-w-3xl flex flex-col gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 px-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {phase === 'running' ? (
              <span className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold ${timeRemaining < 300 ? 'bg-rose-50 text-rose-600 animate-pulse' : 'bg-slate-100 text-slate-700'}`}>
                <Clock className="w-4 h-4" /> {formatTime(timeRemaining)}
              </span>
            ) : (
              <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-bold bg-blue-50 text-blue-700">
                <Trophy className="w-4 h-4" /> 得分: {currentRecord?.score}
              </span>
            )}
            <span className="text-xs font-medium text-slate-500 ml-2">
              第 <span className="text-slate-900 font-bold">{currentIndex + 1}</span> / {cardsCount} 题
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(currentCard?.type || '')}`}>
              {currentCard?.type} {phase === 'running' ? `(${isTf ? '1分' : isMulti ? '3分' : '2分'})` : ''}
            </span>
            {phase === 'running' ? (
              <button onClick={() => submitExam()} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                交卷
              </button>
            ) : (
              <button onClick={() => setPhase('setup')} className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-4 py-1.5 rounded-lg text-sm font-semibold transition-colors">
                退出复盘
              </button>
            )}
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
          {phase === 'review' && currentRecord && (
            <div className={`px-6 py-3 border-b flex items-center justify-between ${currentRecord.details[currentIndex].isCorrect ? 'bg-emerald-50 border-emerald-100' : 'bg-rose-50 border-rose-100'}`}>
              <span className={`text-sm font-bold flex items-center gap-1.5 ${currentRecord.details[currentIndex].isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {currentRecord.details[currentIndex].isCorrect ? <CheckCircle2 className="w-5 h-5" /> : <XCircle className="w-5 h-5" />}
                {currentRecord.details[currentIndex].isCorrect ? '回答正确' : '回答错误'}
              </span>
              <div className="text-right text-xs">
                <div className="text-slate-500 mb-0.5">
                  您的选项：<span className="font-bold text-slate-700">{currentRecord.details[currentIndex].userAnswers.join('、') || '未作答'}</span>
                </div>
                <div className="text-slate-500">
                  正确答案：<span className="font-bold text-slate-700">{currentRecord.details[currentIndex].correctAnswers.join('、')}</span>
                </div>
              </div>
            </div>
          )}

          <div className="p-6 md:p-8 flex-1">
            <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed mb-6">{parsedQuestion.stem}</div>

            {parsedQuestion.options.length > 0 ? (
              <div className="space-y-3">
                {parsedQuestion.options.map((opt) => {
                  const userAns = phase === 'running' ? examAnswers[currentIndex] || [] : currentRecord?.details[currentIndex].userAnswers || [];
                  const isSelected = userAns.includes(opt.label);
                  let btnStyle = isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300';
                  let iconStyle = isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-600 border-slate-200';

                  if (phase === 'review' && currentRecord) {
                    const isCorrectOpt = currentRecord.details[currentIndex].correctAnswers.includes(opt.label);
                    if (isCorrectOpt) {
                      btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-900';
                      iconStyle = 'bg-emerald-600 text-white border-emerald-600';
                    } else if (isSelected && !isCorrectOpt) {
                      btnStyle = 'bg-rose-50 border-rose-300 text-rose-900';
                      iconStyle = 'bg-rose-500 text-white border-rose-500';
                    } else {
                      btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                      iconStyle = 'bg-slate-100 text-slate-400 border-slate-200';
                    }
                  }

                  return (
                    <button
                      key={opt.label}
                      type="button"
                      onClick={() => handleOptionClick(opt.label)}
                      disabled={phase === 'review'}
                      className={`w-full text-left p-3.5 md:p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                        phase === 'running' ? 'hover:border-blue-200 cursor-pointer' : 'cursor-default'
                      } ${btnStyle}`}
                    >
                      <span className={`w-7 h-7 shrink-0 rounded-lg font-bold text-xs flex items-center justify-center border transition-colors ${iconStyle}`}>
                        {opt.label}
                      </span>
                      <span className="text-sm md:text-base leading-relaxed pt-0.5">{opt.text}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                {['正确', '错误'].map((choice) => {
                  const userAns = phase === 'running' ? examAnswers[currentIndex] || [] : currentRecord?.details[currentIndex].userAnswers || [];
                  const isSelected = userAns.includes(choice);
                  let btnStyle = isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md font-bold' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50';

                  if (phase === 'review' && currentRecord) {
                    const isCorrectOpt = currentRecord.details[currentIndex].correctAnswers.includes(choice);
                    if (isCorrectOpt) btnStyle = 'bg-emerald-50 border-emerald-300 text-emerald-700 ring-1 ring-emerald-300 font-bold';
                    else if (isSelected && !isCorrectOpt) btnStyle = 'bg-rose-50 border-rose-300 text-rose-700 ring-1 ring-rose-300 font-bold';
                    else btnStyle = 'bg-white border-slate-200 text-slate-400 opacity-60';
                  }

                  return (
                    <button
                      key={choice}
                      type="button"
                      onClick={() => handleOptionClick(choice)}
                      disabled={phase === 'review'}
                      className={`p-4 rounded-xl border text-center font-medium transition-all ${
                        phase === 'running' ? 'hover:border-blue-200 hover:bg-slate-50 cursor-pointer' : 'cursor-default'
                      } ${btnStyle}`}
                    >
                      <span className="text-base">{choice}</span>
                    </button>
                  );
                })}
              </div>
            )}

            {phase === 'review' && parsedAnswer.explanation && (
              <div className="mt-8 pt-6 border-t border-slate-100">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">官方深度解析与考点分析</h4>
                <div className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-xl border border-slate-200/60">
                  {parsedAnswer.explanation}
                </div>
              </div>
            )}
          </div>
          
          <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
             <div className="flex items-center gap-3">
               {phase === 'running' && (
                 <button onClick={toggleMark} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${examMarked[currentIndex] ? 'bg-amber-50 border-amber-200 text-amber-700' : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'}`}>
                   <Star className={`w-4 h-4 ${examMarked[currentIndex] ? 'fill-amber-400 text-amber-500' : ''}`} /> 标记
                 </button>
               )}
               {phase === 'review' && currentRecord?.markedStatus?.[currentIndex] && (
                 <span className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium bg-amber-50 border border-amber-200 text-amber-700">
                   <Star className="w-4 h-4 fill-amber-400 text-amber-500" /> 遇阻标记
                 </span>
               )}
               <button onClick={() => setIsGridOpen(true)} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border border-slate-200 bg-white text-slate-600 hover:bg-slate-50">
                 <LayoutGrid className="w-4 h-4" /> 答题卡
               </button>
             </div>
             
             <div className="flex items-center gap-2">
                <button onClick={handlePrev} disabled={currentIndex === 0} className="flex items-center justify-center w-10 h-10 bg-white rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-2xs">
                  <ChevronLeft className="w-5 h-5" />
                </button>
                <button onClick={handleNext} disabled={currentIndex === cardsCount - 1} className="flex items-center justify-center w-10 h-10 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-40 shadow-sm">
                  <ChevronRight className="w-5 h-5" />
                </button>
             </div>
          </div>
        </div>
      </div>

      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <LayoutGrid className="w-5 h-5 text-blue-600" /> 答题卡 ({cardsCount} 题)
              </div>
              <button onClick={() => setIsGridOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-2">
                {Array.from({ length: cardsCount }).map((_, idx) => {
                  const isCurrent = idx === currentIndex;
                  
                  let cellStyle = 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100';
                  let showStar = false;
                  
                  if (phase === 'running') {
                    const isAnswered = !!examAnswers[idx]?.length;
                    const isMarked = !!examMarked[idx];
                    showStar = isMarked;
                    
                    if (isCurrent) cellStyle = 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20';
                    else if (isMarked) cellStyle = 'bg-amber-50 text-amber-700 border-amber-300';
                    else if (isAnswered) cellStyle = 'bg-blue-50 text-blue-700 border-blue-200';
                  } else if (phase === 'review' && currentRecord) {
                    const isCorrect = currentRecord.details[idx].isCorrect;
                    showStar = !!currentRecord.markedStatus?.[idx];

                    if (isCurrent) cellStyle = 'bg-slate-800 text-white border-slate-800 ring-2 ring-slate-800/20';
                    else if (isCorrect) cellStyle = 'bg-emerald-50 text-emerald-700 border-emerald-200';
                    else cellStyle = 'bg-rose-50 text-rose-700 border-rose-200';
                  }

                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsGridOpen(false);
                      }}
                      className={`h-10 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all relative ${cellStyle}`}
                    >
                      <span>{idx + 1}</span>
                      {showStar && (
                        <Star className={`absolute -top-1 -right-1 w-3 h-3 fill-amber-400 text-amber-500`} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
              <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认交卷</h3>
              {(() => {
                 const answeredCount = Object.keys(examAnswers).filter((k) => examAnswers[k as any].length > 0).length;
                 return answeredCount < 50 ? (
                    <p className="text-sm text-slate-500 mb-6">您还有 <span className="font-bold text-rose-600">{50 - answeredCount}</span> 题未作答，确定要提前交卷吗？</p>
                 ) : (
                    <p className="text-sm text-slate-500 mb-6">您已完成所有题目，确定要提交试卷吗？</p>
                 );
              })()}
              <div className="flex items-center gap-3">
                 <button onClick={() => setShowConfirmModal(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">继续答题</button>
                 <button onClick={() => submitExam(false)} className="flex-1 py-2.5 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition-colors">确认交卷</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
