import React, { useEffect, useState } from 'react';
import { X, Volume2, BookPlus, Check, Sparkles, HelpCircle, Layers, Lightbulb, BookOpen } from 'lucide-react';
import { TargetWordUsage, DELELevel } from '../types';

interface WordDetailModalProps {
  word: TargetWordUsage | null;
  isOpen: boolean;
  onClose: () => void;
  onAddToNotebook?: (word: TargetWordUsage) => void;
  isAlreadyInNotebook?: boolean;
}

export const WordDetailModal: React.FC<WordDetailModalProps> = ({
  word,
  isOpen,
  onClose,
  onAddToNotebook,
  isAlreadyInNotebook = false,
}) => {
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [enrichedData, setEnrichedData] = useState<TargetWordUsage | null>(word);
  const [loadingEnrichment, setLoadingEnrichment] = useState(false);
  const [added, setAdded] = useState(isAlreadyInNotebook);

  useEffect(() => {
    setEnrichedData(word);
    setAdded(isAlreadyInNotebook);

    if (isOpen && word) {
      // If missing phonetics or collocations or exam examples, attempt to fetch enrichments from API asynchronously
      if (!word.phonetic || !word.deleCollocations || word.deleCollocations.length === 0) {
        fetchEnrichment(word);
      }
    }
  }, [isOpen, word, isAlreadyInNotebook]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen || !word) return null;

  const current = enrichedData || word;

  const fetchEnrichment = async (w: TargetWordUsage) => {
    setLoadingEnrichment(true);
    try {
      const res = await fetch('/api/analyze-word', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          word: w.original,
          formInArticle: w.formInArticle,
          contextSentence: w.contextSentence,
          deleLevel: w.level || 'B2',
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setEnrichedData((prev) => (prev ? { ...prev, ...data } : w));
      }
    } catch (e) {
      console.warn('Could not fetch on-demand word enrichment:', e);
    } finally {
      setLoadingEnrichment(false);
    }
  };

  const handlePlayAudio = () => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();

    const text = current.formInArticle || current.original;
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;

    utterance.onstart = () => setIsPlayingAudio(true);
    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
  };

  const handleAdd = () => {
    if (onAddToNotebook && !added) {
      onAddToNotebook(current);
      setAdded(true);
    }
  };

  // Default multi POS fallback if none returned
  const multiPosList = current.multiPosDefinitions && current.multiPosDefinitions.length > 0
    ? current.multiPosDefinitions
    : [{ pos: current.partOfSpeech || 'palabra', meaning: current.chineseMeaning }];

  // Default DELE Collocations fallback if none
  const collocations = current.deleCollocations && current.deleCollocations.length > 0
    ? current.deleCollocations
    : [`${current.formInArticle || current.original} + sustantivo`, `en relación con ${current.original}`];

  // Default Exam Examples fallback
  const examExamplesList = current.examExamples && current.examExamples.length > 0
    ? current.examExamples
    : current.contextSentence
    ? [{ sentenceEs: current.contextSentence, sentenceCn: `在文中的语境使用 (${current.chineseMeaning})` }]
    : [];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-xl bg-white dark:bg-[#1A1B1F] text-[#0F304F] dark:text-[#E2E0D8] rounded-3xl shadow-2xl border border-slate-200/80 dark:border-zinc-800 p-6 sm:p-8 space-y-6 overflow-hidden max-h-[90vh] overflow-y-auto cursor-default"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-zinc-800/80 pb-4">
          <div className="space-y-1 pr-6">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black font-serif text-[#94A02F] dark:text-[#A8B832] tracking-wide">
                {current.formInArticle || current.original}
              </h2>

              {current.original && current.original.toLowerCase() !== (current.formInArticle || '').toLowerCase() && (
                <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 dark:bg-zinc-800 text-xs font-mono font-medium text-slate-600 dark:text-[#7CA3C4]">
                  原词: {current.original}
                </span>
              )}

              <span className="px-2.5 py-0.5 rounded-full bg-[#94A02F]/15 dark:bg-[#A8B832]/20 text-[#94A02F] dark:text-[#A8B832] font-mono font-bold text-xs border border-[#94A02F]/30 dark:border-[#A8B832]/30">
                DELE {current.level || 'B2'}
              </span>
            </div>

            {/* Phonetic & Audio */}
            <div className="flex items-center space-x-3 pt-1">
              <span className="font-mono text-sm font-semibold text-slate-500 dark:text-[#7CA3C4]">
                {current.phonetic || `/${current.original}/`}
              </span>

              <button
                type="button"
                onClick={handlePlayAudio}
                title="发音朗读 (Standard Spanish)"
                className={`p-1.5 rounded-xl transition-all ${
                  isPlayingAudio
                    ? 'bg-amber-500 text-slate-950 animate-pulse'
                    : 'bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-[#0F304F] dark:text-[#E2E0D8]'
                }`}
              >
                <Volume2 className="w-4 h-4 text-[#94A02F] dark:text-[#A8B832]" />
              </button>
            </div>
          </div>

          {/* Close Button */}
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800/80 dark:hover:bg-zinc-700 transition-colors"
            title="关闭弹窗 (ESC)"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Main Content Sections */}
        <div className="space-y-5 text-sm">
          {/* Section 1: 多词性释义 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#7CA3C4] flex items-center space-x-1.5">
              <Layers className="w-4 h-4 text-[#94A02F] dark:text-[#A8B832]" />
              <span>多词性精准释义</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#242529] border border-slate-200/60 dark:border-zinc-800 space-y-2">
              {multiPosList.map((item, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs sm:text-sm">
                  <span className="px-2 py-0.5 rounded-md bg-[#94A02F]/15 dark:bg-[#A8B832]/20 text-[#94A02F] dark:text-[#A8B832] font-mono font-bold text-xs shrink-0">
                    {item.pos}
                  </span>
                  <span className="font-medium text-[#0F304F] dark:text-[#E2E0D8]">
                    {item.meaning}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: DELE 适配固定搭配 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#7CA3C4] flex items-center space-x-1.5">
              <Sparkles className="w-4 h-4 text-[#94A02F] dark:text-[#A8B832]" />
              <span>DELE 适配搭配 & 高频词组</span>
            </h3>

            <div className="flex flex-wrap gap-2">
              {collocations.map((col, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-[#242529] border border-slate-200/80 dark:border-zinc-700/80 font-serif font-semibold text-xs sm:text-sm text-[#0F304F] dark:text-[#E2E0D8]"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>

          {/* Section 3: DELE 官方考试例句 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#7CA3C4] flex items-center space-x-1.5">
              <BookOpen className="w-4 h-4 text-[#94A02F] dark:text-[#A8B832]" />
              <span>DELE 官方考试真题例句</span>
            </h3>

            <div className="space-y-2">
              {examExamplesList.map((ex, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-2xl bg-slate-50 dark:bg-[#242529] border border-slate-200/60 dark:border-zinc-800 space-y-1 text-xs sm:text-sm"
                >
                  <p className="font-serif italic font-medium text-[#0F304F] dark:text-[#E2E0D8] leading-relaxed">
                    "{ex.sentenceEs}"
                  </p>
                  <p className="text-xs text-slate-500 dark:text-[#7CA3C4] font-sans">
                    {ex.sentenceCn}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Section 4: 易混辨析 & DELE 提示 */}
          <div className="space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-[#7CA3C4] flex items-center space-x-1.5">
              <Lightbulb className="w-4 h-4 text-[#94A02F] dark:text-[#A8B832]" />
              <span>易混辨析 & 备考考点提炼</span>
            </h3>

            <div className="p-3.5 rounded-2xl bg-[#94A02F]/10 dark:bg-[#A8B832]/10 border border-[#94A02F]/20 dark:border-[#A8B832]/20 space-y-2 text-xs sm:text-sm">
              {current.confusedWords && (
                <p className="text-[#0F304F] dark:text-[#E2E0D8] leading-relaxed">
                  <strong className="text-[#94A02F] dark:text-[#A8B832]">易混辨析：</strong> {current.confusedWords}
                </p>
              )}

              <p className="text-[#0F304F] dark:text-[#E2E0D8] leading-relaxed">
                <strong className="text-[#94A02F] dark:text-[#A8B832]">DELE 应用建议：</strong> {current.usageTip}
              </p>
            </div>
          </div>
        </div>

        {/* Modal Action Footer */}
        <div className="pt-4 border-t border-slate-100 dark:border-zinc-800/80 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-400 dark:text-zinc-500">
            按 ESC 键或点击空白区域即可关闭
          </span>

          <div className="flex items-center space-x-2">
            {onAddToNotebook && (
              <button
                type="button"
                onClick={handleAdd}
                disabled={added}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-bold flex items-center space-x-2 transition-all ${
                  added
                    ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30'
                    : 'bg-[#94A02F] hover:bg-[#838e28] dark:bg-[#A8B832] dark:hover:bg-[#96a529] text-slate-950 shadow-md hover:scale-102'
                }`}
              >
                {added ? (
                  <>
                    <Check className="w-4 h-4" />
                    <span>已存入专属生词本</span>
                  </>
                ) : (
                  <>
                    <BookPlus className="w-4 h-4" />
                    <span>收录进专属生词本</span>
                  </>
                )}
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-[#E2E0D8] text-xs sm:text-sm font-semibold transition-colors"
            >
              关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
