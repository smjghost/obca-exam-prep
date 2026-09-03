import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Papa from 'papaparse';
import {
  ChevronLeft,
  ChevronRight,
  RotateCw,
  Shuffle,
  BookmarkX,
  CheckCircle2,
  XCircle,
  Download,
  Check,
  HelpCircle,
  BookOpen,
  LayoutGrid,
  Sparkles,
  Eye,
  EyeOff,
  Keyboard,
  X,
  Trash2,
} from 'lucide-react';
import { Flashcard } from '../types';
import {
  FILES,
  cleanQuestionText,
  getRowField,
  parseQuestion,
  parseAnswer,
  getTypeColor,
} from '../utils';

const FILE_URLS: Record<string, string> = {
  '单选题.csv': 'single.csv',
  '多选题.csv': 'multiple.csv',
  '判断题.csv': 'true_false.csv',
};

export function PracticeMode({
  wrongCards,
  setWrongCards,
}: {
  wrongCards: Flashcard[];
  setWrongCards: React.Dispatch<React.SetStateAction<Flashcard[]>>;
}) {
  const [selectedFile, setSelectedFile] = useState<string>(FILES[0]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string[]>>({});
  const [isGridOpen, setIsGridOpen] = useState(false);
  const [showClearConfirm, setShowClearConfirm] = useState(false);

  useEffect(() => {
    if (selectedFile === '错题本') {
      setOriginalCards(wrongCards);
      setCards(isShuffled ? [...wrongCards].sort(() => Math.random() - 0.5) : wrongCards);
      setLoading(false);
      setCurrentIndex(0);
      setIsFlipped(false);
      setSelectedAnswers({});
    } else {
      loadCards(selectedFile);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedFile, isShuffled]);

  const loadCards = async (filename: string) => {
    setLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    setSelectedAnswers({});
    try {
      const rawBase = import.meta.env.BASE_URL || '/';
      const baseUrl = rawBase.endsWith('/') ? rawBase : `${rawBase}/`;
      const fileUrl = FILE_URLS[filename];
      const response = await fetch(`${baseUrl}${fileUrl}`);
      if (!response.ok) throw new Error('Network response was not ok');
      const csvText = await response.text();

      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedCards = results.data
            .map((row: any, idx: number) => {
              const id = getRowField(row, '题号', 'ID', 'id') || String(idx + 1);
              const front = getRowField(row, '题目(正面)', '正面', '题目', 'front', 'question');
              const back = getRowField(row, '答案(背面)', '背面', '答案', 'back', 'answer');
              const type = getRowField(row, '题型', 'type') || filename.replace('.csv', '');
              return { id, front: cleanQuestionText(front), back: back.trim(), type: type.trim() };
            })
            .filter((c) => c.front);

          setOriginalCards(parsedCards);
          setCards(isShuffled ? [...parsedCards].sort(() => Math.random() - 0.5) : parsedCards);
          setLoading(false);
        },
      });
    } catch (err) {
      console.error('Failed to load file', err);
      setOriginalCards([]);
      setCards([]);
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => setIsFlipped((prev) => !prev), []);

  const handleMarkRight = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (cards.length === 0) return;
      const currentCard = cards[currentIndex];

      setWrongCards((prev) => prev.filter((c) => c.front !== currentCard.front));
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFlipped(false);
      }
    },
    [cards, currentIndex, setWrongCards]
  );

  const handleMarkWrong = useCallback(
    (e?: React.MouseEvent) => {
      if (e) e.stopPropagation();
      if (cards.length === 0) return;
      const currentCard = cards[currentIndex];

      if (!wrongCards.find((c) => c.front === currentCard.front)) {
        setWrongCards((prev) => [...prev, currentCard]);
      }
      if (currentIndex < cards.length - 1) {
        setCurrentIndex((prev) => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFlipped(false);
      }
    },
    [cards, currentIndex, wrongCards, setWrongCards]
  );

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowRight') handleNext();
      else if (e.key === 'ArrowLeft') handlePrev();
      else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault();
        handleFlip();
      } else if (e.key === '1' && isFlipped) {
        handleMarkWrong();
      } else if (e.key === '2' && isFlipped) {
        handleMarkRight();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip, handleMarkWrong, handleMarkRight, isFlipped]);

  const handleDownloadCSV = () => {
    if (originalCards.length === 0) return;
    const exportData = originalCards.map((c, idx) => ({
      题号: c.id || String(idx + 1),
      '题目(正面)': c.front,
      '答案(背面)': c.back,
      题型: c.type,
    }));
    const csv = Papa.unparse(exportData);
    const blob = new Blob([new Uint8Array([0xef, 0xbb, 0xbf]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', selectedFile === '错题本' ? '错题本_纯净版.csv' : `${selectedFile.replace('.csv', '')}_纯净版.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleOptionClick = (label: string) => {
    const isMultiple = currentCard?.type?.includes('多选') || selectedFile.includes('多选');
    const current = selectedAnswers[currentIndex] || [];
    if (isMultiple) {
      if (current.includes(label)) setSelectedAnswers({ ...selectedAnswers, [currentIndex]: current.filter((l) => l !== label) });
      else setSelectedAnswers({ ...selectedAnswers, [currentIndex]: [...current, label].sort() });
    } else {
      setSelectedAnswers({ ...selectedAnswers, [currentIndex]: [label] });
    }
  };

  const currentCard = cards[currentIndex];
  const parsedQuestion = useMemo(() => (currentCard ? parseQuestion(currentCard.front) : { stem: '', options: [] }), [currentCard]);
  const parsedAnswer = useMemo(() => (currentCard ? parseAnswer(currentCard.back) : { answer: '', explanation: '' }), [currentCard]);
  const isCurrentCardInWrongList = useMemo(() => {
    if (!currentCard) return false;
    return !!wrongCards.find((c) => c.front === currentCard.front);
  }, [currentCard, wrongCards]);

  return (
    <>
      <div className="w-full max-w-3xl flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex flex-wrap gap-2">
          {FILES.map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                selectedFile === file
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-600/20 ring-2 ring-blue-600/20'
                  : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              {file.replace('.csv', '')}
            </button>
          ))}
          <button
            onClick={() => setSelectedFile('错题本')}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
              selectedFile === '错题本'
                ? 'bg-rose-600 text-white shadow-sm shadow-rose-600/20 ring-2 ring-rose-600/20'
                : 'bg-white text-rose-600 border border-rose-200 hover:bg-rose-50'
            }`}
          >
            <BookmarkX className="w-4 h-4" />
            错题本 <span className="text-xs">({wrongCards.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={toggleShuffle}
            disabled={cards.length === 0}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors disabled:opacity-40 ${
              isShuffled ? 'bg-purple-50 text-purple-700 border-purple-200' : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
            }`}
          >
            <Shuffle className="w-3.5 h-3.5" /> {isShuffled ? '乱序: 开' : '乱序: 关'}
          </button>
          <button
            onClick={() => setIsGridOpen(true)}
            disabled={cards.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 disabled:opacity-40 transition-colors"
          >
            <LayoutGrid className="w-3.5 h-3.5" /> 题号列表
          </button>
          {selectedFile === '错题本' && wrongCards.length > 0 && (
            <button
              onClick={() => setShowClearConfirm(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-50 text-rose-700 border border-rose-200 hover:bg-rose-100 transition-colors"
            >
              <Trash2 className="w-3.5 h-3.5" /> 清空
            </button>
          )}
          <button
            onClick={handleDownloadCSV}
            disabled={originalCards.length === 0}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-emerald-700 border border-emerald-200 hover:bg-emerald-50 disabled:opacity-40 transition-colors"
          >
            <Download className="w-3.5 h-3.5" /> 导出
          </button>
        </div>
      </div>

      <main className="w-full max-w-3xl flex-1 flex flex-col justify-start">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border border-slate-200 shadow-xs">
            <RotateCw className="w-8 h-8 text-blue-600 animate-spin mb-3" />
            <p className="text-sm text-slate-500 font-medium">正在读取题库...</p>
          </div>
        ) : cards.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-80 bg-white rounded-2xl border border-slate-200 shadow-xs p-8 text-center">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <h3 className="text-base font-semibold text-slate-800 mb-1">
              {selectedFile === '错题本' ? '错题本暂无题目' : `题库已清空`}
            </h3>
          </div>
        ) : (
          <div className="w-full flex flex-col gap-4">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-3 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${getTypeColor(currentCard?.type || '')}`}>
                  {currentCard?.type}
                </span>
                <span className="text-xs text-slate-400">·</span>
                <span className="text-xs font-medium text-slate-500">
                  第 <span className="text-slate-900 font-bold">{currentIndex + 1}</span> / {cards.length} 题
                </span>
              </div>
              <div className="flex items-center gap-3">
                {isCurrentCardInWrongList && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-rose-600 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                    <BookmarkX className="w-3 h-3" /> 已在错题本
                  </span>
                )}
                <div className="w-24 md:w-32 bg-slate-100 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-blue-600 h-full transition-all duration-300 rounded-full"
                    style={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all">
              <div className="flex items-center justify-between px-6 py-3.5 bg-slate-50/70 border-b border-slate-100">
                <div className="flex items-center gap-2 text-xs font-semibold text-slate-600">
                  {isFlipped ? (
                    <span className="flex items-center gap-1.5 text-emerald-700">
                      <Sparkles className="w-4 h-4" /> 答案与深度解析
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-blue-700">
                      <HelpCircle className="w-4 h-4" /> 试题题干与选项
                    </span>
                  )}
                </div>
                <button
                  onClick={handleFlip}
                  className="flex items-center gap-1.5 text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50/80 px-2.5 py-1 rounded-lg transition-colors"
                >
                  {isFlipped ? (
                    <>
                      <EyeOff className="w-3.5 h-3.5" />返回题目
                    </>
                  ) : (
                    <>
                      <Eye className="w-3.5 h-3.5" />查看答案
                    </>
                  )}
                </button>
              </div>

              <div className="p-6 md:p-8">
                {!isFlipped ? (
                  <div className="flex flex-col gap-6">
                    <div className="text-base md:text-lg font-medium text-slate-900 leading-relaxed">{parsedQuestion.stem}</div>
                    {parsedQuestion.options.length > 0 ? (
                      <div className="space-y-3 pt-1">
                        {parsedQuestion.options.map((opt) => {
                          const isSelected = (selectedAnswers[currentIndex] || []).includes(opt.label);
                          let btnStyle = isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md' : 'bg-white border-slate-200/80 text-slate-700 hover:border-blue-300';
                          let iconStyle = isSelected ? 'bg-white/20 text-white border-white/30' : 'bg-slate-100 text-slate-600 border-slate-200';

                          return (
                            <button
                              key={opt.label}
                              type="button"
                              onClick={() => handleOptionClick(opt.label)}
                              className={`w-full text-left p-3.5 md:p-4 rounded-xl border transition-all flex items-start gap-3.5 group cursor-pointer ${btnStyle}`}
                            >
                              <span
                                className={`w-7 h-7 shrink-0 rounded-lg font-bold text-xs flex items-center justify-center border transition-colors ${iconStyle}`}
                              >
                                {opt.label}
                              </span>
                              <span className="text-sm md:text-base leading-relaxed pt-0.5">{opt.text}</span>
                            </button>
                          );
                        })}
                      </div>
                    ) : (
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        {['正确', '错误'].map((choice) => {
                          const isSelected = (selectedAnswers[currentIndex] || []).includes(choice);
                          return (
                            <button
                              key={choice}
                              type="button"
                              onClick={() => handleOptionClick(choice)}
                              className={`p-4 rounded-xl border text-center font-medium transition-all ${
                                isSelected ? 'bg-blue-600 border-blue-600 text-white shadow-md font-bold' : 'bg-white border-slate-200 text-slate-700 hover:border-blue-300 hover:bg-slate-50'
                              }`}
                            >
                              <span className="text-base">{choice}</span>
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col gap-5 animate-in fade-in duration-200">
                    <div className="p-4 rounded-xl bg-emerald-50/90 border border-emerald-200 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-emerald-600 flex items-center justify-center text-white shrink-0">
                          <Check className="w-5 h-5 stroke-[2.5]" />
                        </div>
                        <div>
                          <div className="text-xs font-semibold text-emerald-700 uppercase">标准答案</div>
                          <div className="text-lg md:text-xl font-bold text-emerald-950">{parsedAnswer.answer || '详见解析'}</div>
                        </div>
                      </div>
                      {selectedAnswers[currentIndex]?.length ? (
                        <div className="text-right">
                          <div className="text-xs text-slate-500">您的选择</div>
                          <div className="text-sm font-semibold text-slate-800">{selectedAnswers[currentIndex].join('、')}</div>
                        </div>
                      ) : null}
                    </div>
                    {parsedAnswer.explanation && (
                      <div className="pt-2">
                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">官方深度解析与考点分析</h4>
                        <div className="text-sm md:text-base text-slate-700 leading-relaxed whitespace-pre-wrap bg-slate-50/50 p-5 rounded-xl border border-slate-200/60 max-h-[420px] overflow-y-auto">
                          {parsedAnswer.explanation}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="px-6 py-4 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
                <button
                  onClick={handleFlip}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 shadow-2xs"
                >
                  <RotateCw className="w-4 h-4 text-slate-500" /> {isFlipped ? '返回看题目' : '翻转看答案'}
                </button>
                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleMarkWrong}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 shadow-2xs"
                  >
                    <XCircle className="w-4 h-4 text-rose-600" /> 答错了 (1)
                  </button>
                  <button
                    onClick={handleMarkRight}
                    className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-sm font-medium bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  >
                    <CheckCircle2 className="w-4 h-4" /> 已掌握 (2)
                  </button>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-1 pt-1">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Keyboard className="w-3.5 h-3.5" /> <span>支持快捷键：← 上一题 · → 下一题 · 空格 翻转 · 1 答错 · 2 掌握</span>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={handlePrev}
                  disabled={currentIndex === 0}
                  className="flex items-center gap-1 px-4 py-2 bg-white rounded-xl border border-slate-200 text-slate-700 text-sm font-medium hover:bg-slate-50 disabled:opacity-40 shadow-2xs"
                >
                  <ChevronLeft className="w-4 h-4" /> 上一题
                </button>
                <button
                  onClick={handleNext}
                  disabled={currentIndex === cards.length - 1}
                  className="flex items-center gap-1 px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 disabled:opacity-40 shadow-sm"
                >
                  下一题 <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {isGridOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-xl w-full max-h-[80vh] flex flex-col overflow-hidden border border-slate-200">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2 font-bold text-slate-800">
                <LayoutGrid className="w-5 h-5 text-blue-600" /> 题号导航 ({cards.length} 题)
              </div>
              <button onClick={() => setIsGridOpen(false)} className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto flex-1">
              <div className="grid grid-cols-5 sm:grid-cols-8 gap-2">
                {cards.map((c, idx) => {
                  const isCurrent = idx === currentIndex;
                  const isWrong = !!wrongCards.find((w) => w.front === c.front);
                  const isAnswered = !!selectedAnswers[idx]?.length;
                  return (
                    <button
                      key={idx}
                      onClick={() => {
                        setCurrentIndex(idx);
                        setIsFlipped(false);
                        setIsGridOpen(false);
                      }}
                      className={`h-10 rounded-xl text-xs font-semibold flex flex-col items-center justify-center border transition-all ${
                        isCurrent
                          ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-600/20'
                          : isWrong
                          ? 'bg-rose-50 text-rose-700 border-rose-200 hover:bg-rose-100'
                          : isAnswered
                          ? 'bg-blue-50 text-blue-700 border-blue-200 hover:bg-blue-100'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span>{idx + 1}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {showClearConfirm && (
        <div className="fixed inset-0 z-[60] bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
           <div className="bg-white rounded-2xl shadow-xl max-w-sm w-full p-6 text-center">
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-800 mb-2">确认清空错题本</h3>
              <p className="text-sm text-slate-500 mb-6">您确定要清空所有的错题记录吗？清空后不可恢复。</p>
              <div className="flex items-center gap-3">
                 <button onClick={() => setShowClearConfirm(false)} className="flex-1 py-2.5 rounded-xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-colors">取消</button>
                 <button onClick={() => {
                   setWrongCards([]);
                   setShowClearConfirm(false);
                 }} className="flex-1 py-2.5 rounded-xl bg-rose-600 text-white font-semibold hover:bg-rose-700 transition-colors">确认清空</button>
              </div>
           </div>
        </div>
      )}
    </>
  );
}
