/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';
import Papa from 'papaparse';
import { ChevronLeft, ChevronRight, RotateCw, FileText, Shuffle, BookmarkX, CheckCircle, XCircle, Download } from 'lucide-react';

interface Flashcard {
  front: string;
  back: string;
  type: string;
}

const FILES = [
  '单选题.csv',
  '多选题.csv',
  '判断题.csv',
];

const cleanQuestionText = (text: string) => {
  if (!text) return '';
  // Removes optional [xxx题], optional spaces, digits, optional punctuation (、 or .), and optional spaces
  return text.replace(/^(?:\[.*?\]\s*)?\d+[、\.]?\s*/, '').trim();
};

export default function App() {
  const [selectedFile, setSelectedFile] = useState<string>(FILES[0]);
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [originalCards, setOriginalCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isShuffled, setIsShuffled] = useState(false);
  
  const [wrongCards, setWrongCards] = useState<Flashcard[]>(() => {
    const saved = localStorage.getItem('oceanbase_wrong_cards');
    if (saved) {
      try { 
        const parsed = JSON.parse(saved); 
        return parsed.map((c: Flashcard) => ({
          ...c,
          front: cleanQuestionText(c.front)
        }));
      } catch (e) { return []; }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('oceanbase_wrong_cards', JSON.stringify(wrongCards));
  }, [wrongCards]);

  useEffect(() => {
    if (selectedFile === '错题本') {
      setOriginalCards(wrongCards);
      setCards(isShuffled ? [...wrongCards].sort(() => Math.random() - 0.5) : wrongCards);
      setLoading(false);
      setCurrentIndex(0);
      setIsFlipped(false);
    } else {
      loadCards(selectedFile);
    }
  }, [selectedFile]);

  const loadCards = async (filename: string) => {
    setLoading(true);
    setIsFlipped(false);
    setCurrentIndex(0);
    try {
      // Use import.meta.env.BASE_URL to support sub-path deployments like GitHub Pages
      const baseUrl = import.meta.env.BASE_URL || '/';
      const response = await fetch(`${baseUrl}${filename}`);
      const csvText = await response.text();
      
      Papa.parse(csvText, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsedCards = results.data
            .map((row: any) => ({
              front: cleanQuestionText(row['front'] || row['正面'] || ''),
              back: row['back'] || row['背面'] || '',
              type: row['type'] || row['题型'] || '',
            }))
            .filter((c) => c.front); // Only keep rows with content
            
          setOriginalCards(parsedCards);
          setCards(isShuffled ? [...parsedCards].sort(() => Math.random() - 0.5) : parsedCards);
          setLoading(false);
        }
      });
    } catch (err) {
      console.error("Failed to load file", err);
      setLoading(false);
    }
  };

  const handleNext = useCallback(() => {
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, cards.length]);

  const handlePrev = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  const handleFlip = useCallback(() => {
    setIsFlipped(prev => !prev);
  }, []);

  const handleMarkRight = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (cards.length === 0) return;
    
    const currentCard = cards[currentIndex];
    
    if (selectedFile === '错题本') {
      const newWrong = wrongCards.filter(c => c.front !== currentCard.front);
      setWrongCards(newWrong);
      const newCards = cards.filter((_, i) => i !== currentIndex);
      setCards(newCards);
      setOriginalCards(newWrong);
      
      if (currentIndex >= newCards.length && newCards.length > 0) {
        setCurrentIndex(newCards.length - 1);
      }
      setIsFlipped(false);
    } else {
      setWrongCards(prev => prev.filter(c => c.front !== currentCard.front));
      if (currentIndex < cards.length - 1) {
        setCurrentIndex(prev => prev + 1);
        setIsFlipped(false);
      } else {
        setIsFlipped(false);
      }
    }
  }, [cards, currentIndex, selectedFile, wrongCards]);

  const handleMarkWrong = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    if (cards.length === 0) return;
    
    const currentCard = cards[currentIndex];
    
    if (!wrongCards.find(c => c.front === currentCard.front)) {
      setWrongCards(prev => [...prev, currentCard]);
    }
    
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setIsFlipped(false);
    }
  }, [cards, currentIndex, wrongCards]);

  const toggleShuffle = () => {
    setIsShuffled(!isShuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    if (!isShuffled) {
      setCards([...originalCards].sort(() => Math.random() - 0.5));
    } else {
      setCards(originalCards);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input (not currently in app, but safe)
      if (document.activeElement?.tagName === 'INPUT' || document.activeElement?.tagName === 'TEXTAREA') return;
      
      if (e.key === 'ArrowRight') {
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        handlePrev();
      } else if (e.key === ' ' || e.key === 'Spacebar') {
        e.preventDefault(); // Prevent page scrolling
        handleFlip();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleNext, handlePrev, handleFlip]);

  const handleDownloadCSV = () => {
    if (originalCards.length === 0) return;
    
    // Create export data based on originalCards
    const exportData = originalCards.map(c => ({
      '题型': c.type,
      '正面': c.front,
      '背面': c.back,
    }));
    
    const csv = Papa.unparse(exportData);
    // Add BOM so Excel opens UTF-8 correctly
    const blob = new Blob([new Uint8Array([0xEF, 0xBB, 0xBF]), csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    
    const fileName = selectedFile === '错题本' ? '错题本_纯净版.csv' : `${selectedFile.replace('.csv', '')}_纯净版.csv`;
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-neutral-50 flex flex-col items-center p-6 font-sans">
      <header className="mb-8 text-center max-w-3xl w-full">
        <h1 className="text-3xl font-bold text-neutral-800 tracking-tight flex items-center justify-center gap-2 mb-4">
          <FileText className="w-8 h-8 text-blue-600" />
          OceanBase 题库刷题
        </h1>
        
        {/* File Selector */}
        <div className="flex flex-wrap gap-2 justify-center mb-4">
          {FILES.map((file) => (
            <button
              key={file}
              onClick={() => setSelectedFile(file)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedFile === file
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-white text-neutral-600 border border-neutral-200 hover:bg-neutral-100'
              }`}
            >
              {file.replace('.csv', '')}
            </button>
          ))}
          <button
            onClick={() => setSelectedFile('错题本')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors flex items-center gap-1.5 ${
              selectedFile === '错题本'
                ? 'bg-red-500 text-white shadow-md'
                : 'bg-white text-red-500 border border-red-200 hover:bg-red-50'
            }`}
          >
            <BookmarkX className="w-4 h-4" /> 错题本 ({wrongCards.length})
          </button>
        </div>
        
        <div className="flex justify-center gap-3">
          <button
            onClick={toggleShuffle}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors ${
              isShuffled 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-white text-neutral-500 border border-neutral-200 hover:bg-neutral-100'
            }`}
          >
            <Shuffle className="w-3 h-3" />
            {isShuffled ? '乱序模式: 开' : '乱序模式: 关'}
          </button>
          
          <button
            onClick={handleDownloadCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-white text-emerald-600 border border-emerald-200 hover:bg-emerald-50"
            title="导出当前题库纯净版 CSV"
          >
            <Download className="w-3 h-3" />
            导出当前题库(CSV)
          </button>
        </div>
      </header>

      <main className="w-full max-w-2xl flex-1 flex flex-col justify-center relative">
        {loading ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-neutral-100">
            <RotateCw className="w-8 h-8 text-neutral-400 animate-spin" />
          </div>
        ) : cards.length === 0 ? (
          <div className="flex items-center justify-center h-64 bg-white rounded-2xl shadow-sm border border-neutral-100 text-neutral-500">
            {selectedFile === '错题本' ? '太棒了，目前没有错题！' : '没有找到题目数据'}
          </div>
        ) : (
          <div className="w-full">
            {/* Card Progress */}
            <div className="flex justify-between items-center text-sm font-medium text-neutral-500 mb-4 px-2">
              <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full">
                {cards[currentIndex]?.type || '未分类'}
              </span>
              <span>
                {currentIndex + 1} / {cards.length}
              </span>
            </div>

            {/* Flashcard Area */}
            <div 
              className="relative w-full h-[400px] cursor-pointer"
              style={{ perspective: '1000px' }}
              onClick={handleFlip}
            >
              <div 
                className={`w-full h-full transition-transform duration-500 relative`}
                style={{ 
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}
              >
                {/* Front Side */}
                <div 
                  className={`absolute inset-0 bg-white rounded-2xl shadow-lg border border-neutral-100 p-8 flex flex-col justify-center items-center text-center`}
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden' }}
                >
                  <p className="text-xl md:text-2xl font-medium text-neutral-800 leading-relaxed whitespace-pre-wrap">
                    {cards[currentIndex]?.front}
                  </p>
                  <div className="absolute bottom-6 flex items-center gap-2 text-neutral-400 text-sm font-medium">
                    <RotateCw className="w-4 h-4" />
                    点击翻转看答案
                  </div>
                </div>

                {/* Back Side */}
                <div 
                  className={`absolute inset-0 bg-neutral-800 rounded-2xl shadow-lg p-8 flex flex-col items-center text-center text-white overflow-hidden`}
                  style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                >
                  <div className="w-full flex-1 flex items-center justify-center pb-16 overflow-y-auto">
                    <p className="text-lg md:text-xl leading-relaxed whitespace-pre-wrap max-w-prose">
                      {cards[currentIndex]?.back}
                    </p>
                  </div>
                  
                  <div className="absolute bottom-6 w-full px-8 flex justify-between gap-4">
                    <button
                      onClick={handleMarkWrong}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white py-3 px-2 rounded-xl text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <XCircle className="w-5 h-5" /> 答错了 (加错题)
                    </button>
                    <button
                      onClick={handleMarkRight}
                      className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white py-3 px-2 rounded-xl text-sm md:text-base font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5" /> 答对了 (下一题)
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flex justify-center items-center gap-6 mt-8">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className="p-4 bg-white rounded-full shadow-sm border border-neutral-100 text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Previous card"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              
              <button
                onClick={handleNext}
                disabled={currentIndex === cards.length - 1}
                className="p-4 bg-white rounded-full shadow-sm border border-neutral-100 text-neutral-600 hover:bg-neutral-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                aria-label="Next card"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
