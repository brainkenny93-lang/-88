import React, { useState, useEffect } from 'react';
import { Volume2, VolumeX, Copy, Check, Sparkles, BookPlus, FileEdit, Languages, Eye } from 'lucide-react';
import { DELEArticleResult, TargetWordUsage } from '../types';

interface ArticleViewProps {
  article: DELEArticleResult;
  onStartPractice: () => void;
  onSaveNewWordsToNotebook: (words: TargetWordUsage[]) => void;
  onWordClick: (word: TargetWordUsage) => void;
}

export const ArticleView: React.FC<ArticleViewProps> = ({
  article,
  onStartPractice,
  onSaveNewWordsToNotebook,
  onWordClick,
}) => {
  const [viewMode, setViewMode] = useState<'bilingual' | 'spanish' | 'chinese'>('bilingual');
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [copied, setCopied] = useState(false);

  // Stop speech if article changes
  useEffect(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  }, [article.id]);

  // Audio Speech Synthesis
  const handleToggleAudio = () => {
    if (!('speechSynthesis' in window)) {
      alert('您的浏览器暂不支持语音合成功能');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    const fullSpanish = article.paragraphs.map((p) => p.spanish).join(' ');
    const utterance = new SpeechSynthesisUtterance(fullSpanish);
    utterance.lang = 'es-ES'; // European Spanish standard for DELE
    utterance.rate = article.deleLevel === 'A1' || article.deleLevel === 'A2' ? 0.85 : 0.95;

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    window.speechSynthesis.speak(utterance);
    setIsPlayingAudio(true);
  };

  const handleCopyText = () => {
    const textToCopy = article.paragraphs
      .map((p) => `${p.spanish}\n${p.chinese}`)
      .join('\n\n');

    navigator.clipboard.writeText(`${article.titleSpanish}\n${article.titleChinese}\n\n${textToCopy}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Function to highlight target words inside Spanish paragraph
  const renderParagraphWithHighlights = (paragraphText: string) => {
    if (!article.targetWordsUsed || article.targetWordsUsed.length === 0) {
      return paragraphText;
    }

    // Build regex for matching target words in paragraph
    const formsToMatch = article.targetWordsUsed.map((item) => ({
      form: item.formInArticle || item.original,
      item,
    }));

    // Sort by length descending to match longer phrases first
    formsToMatch.sort((a, b) => b.form.length - a.form.length);

    let parts: { text: string; wordItem?: TargetWordUsage }[] = [{ text: paragraphText }];

    formsToMatch.forEach(({ form, item }) => {
      const escaped = form.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
      const regex = new RegExp(`(${escaped})`, 'gi');

      const nextParts: { text: string; wordItem?: TargetWordUsage }[] = [];

      parts.forEach((part) => {
        if (part.wordItem) {
          nextParts.push(part);
          return;
        }

        const subMatches = part.text.split(regex);
        subMatches.forEach((sub) => {
          if (sub.toLowerCase() === form.toLowerCase()) {
            nextParts.push({ text: sub, wordItem: item });
          } else if (sub) {
            nextParts.push({ text: sub });
          }
        });
      });

      parts = nextParts;
    });

    return parts.map((chunk, idx) => {
      if (chunk.wordItem) {
        return (
          <span
            key={idx}
            onClick={() => chunk.wordItem && onWordClick(chunk.wordItem)}
            className="cursor-pointer px-1.5 py-0.5 mx-0.5 rounded font-bold transition-colors bg-[rgba(217,160,102,0.2)] hover:bg-[rgba(217,160,102,0.35)] text-[#D9A066] border-b-2 border-[#D9A066]"
            title="点击唤起深度解析弹窗"
          >
            {chunk.text}
          </span>
        );
      }
      return <span key={idx}>{chunk.text}</span>;
    });
  };

  return (
    <div className="card-pine overflow-hidden shadow-xl">
      {/* Top Header Bar */}
      <div className="bg-[#141D19] border-b border-[rgba(242,242,226,0.12)] p-6 sm:p-8 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(242,242,226,0.08)]">
          <div className="flex items-center space-x-2">
            <span className="badge-hazelnut">
              DELE {article.deleLevel} 范文
            </span>
            <span className="px-2.5 py-1 text-xs font-mono-code rounded bg-[rgba(255,255,255,0.06)] text-[#F2F2E2] border border-[rgba(242,242,226,0.1)]">
              {article.topicName}
            </span>
            <span className="px-2.5 py-1 text-xs font-mono-code rounded bg-[rgba(255,255,255,0.06)] text-[#C5BC8E] border border-[rgba(242,242,226,0.1)]">
              {article.style === 'formal' ? '🏛️ EXAM FORMAL' : '💬 NATIVE CASUAL'}
            </span>
          </div>

          {/* Action Toolbar */}
          <div className="flex items-center space-x-2">
            <button
              id="btn-play-audio"
              type="button"
              onClick={handleToggleAudio}
              className={`px-3 py-1.5 rounded text-xs font-mono-code flex items-center space-x-1.5 transition-all cursor-pointer border ${
                isPlayingAudio
                  ? 'bg-rose-600 text-white animate-pulse border-rose-500'
                  : 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F2F2E2] border-[rgba(242,242,226,0.15)]'
              }`}
            >
              {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-[#D9A066]" />}
              <span>{isPlayingAudio ? 'PAUSE' : '朗读全文 (Standard Spanish)'}</span>
            </button>

            <button
              id="btn-copy-article"
              type="button"
              onClick={handleCopyText}
              className="px-3 py-1.5 rounded text-xs font-mono-code bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F2F2E2] border border-[rgba(242,242,226,0.15)] flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5 text-[#D9A066]" />}
              <span>{copied ? 'COPIED' : '复制范文'}</span>
            </button>
          </div>
        </div>

        {/* Title */}
        <div>
          <h2 className="text-xl sm:text-2xl font-display text-[#D9A066] tracking-wide leading-snug">
            {article.titleSpanish}
          </h2>
          <p className="text-sm text-[#C5BC8E] opacity-80 mt-1 font-sans">{article.titleChinese}</p>
        </div>

        {/* Display Controls & Practice Trigger */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
          {/* View Mode Toggle */}
          <div className="inline-flex p-1 rounded bg-[rgba(0,0,0,0.3)] border border-[rgba(242,242,226,0.1)] text-xs font-mono-code">
            <button
              type="button"
              onClick={() => setViewMode('bilingual')}
              className={`px-3 py-1 rounded transition-all flex items-center space-x-1 cursor-pointer ${
                viewMode === 'bilingual'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#C5BC8E] hover:text-[#F2F2E2]'
              }`}
            >
              <Languages className="w-3.5 h-3.5" />
              <span>中西对照</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('spanish')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                viewMode === 'spanish'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#C5BC8E] hover:text-[#F2F2E2]'
              }`}
            >
              纯西语原文
            </button>
            <button
              type="button"
              onClick={() => setViewMode('chinese')}
              className={`px-3 py-1 rounded transition-all cursor-pointer ${
                viewMode === 'chinese'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#C5BC8E] hover:text-[#F2F2E2]'
              }`}
            >
              纯中文译文
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              id="btn-save-all-words-notebook"
              type="button"
              onClick={() => onSaveNewWordsToNotebook(article.targetWordsUsed)}
              className="px-3.5 py-1.5 rounded bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(217,160,102,0.15)] text-[#D9A066] border border-[#D9A066] text-xs font-mono-code flex items-center space-x-1.5 transition-all cursor-pointer"
            >
              <BookPlus className="w-3.5 h-3.5" />
              <span>一键存入生词本</span>
            </button>

            <button
              id="btn-start-cloze-practice"
              type="button"
              onClick={onStartPractice}
              className="px-4 py-1.5 rounded bg-[#D9A066] hover:bg-[#e2b07d] text-[#1C2822] text-xs font-mono-code font-bold flex items-center space-x-1.5 shadow-md transition-all hover:scale-102 cursor-pointer uppercase"
            >
              <FileEdit className="w-4 h-4" />
              <span>开启填空自测模式</span>
            </button>
          </div>
        </div>
      </div>

      {/* Reading Zone Container */}
      <div className="p-6 sm:p-8 space-y-6 bg-[#1C2822] transition-colors">
        {article.paragraphs.map((p, idx) => (
          <div
            key={p.id || idx}
            className="p-6 rounded bg-[#2D4034] border border-[rgba(242,242,226,0.12)] space-y-3 shadow-md"
          >
            {/* Paragraph Header */}
            <div className="text-[10px] font-mono-code uppercase tracking-wider text-[#C5BC8E] flex items-center justify-between">
              <span>PÁRRAFO {idx + 1}</span>
              <span className="text-[#D9A066]">
                点击高亮词汇唤起深度解析弹窗
              </span>
            </div>

            {/* Spanish Text */}
            {(viewMode === 'bilingual' || viewMode === 'spanish') && (
              <p className="text-base sm:text-lg text-[#F2F2E2] font-sans leading-relaxed tracking-wide">
                {renderParagraphWithHighlights(p.spanish)}
              </p>
            )}

            {/* Divider if bilingual */}
            {viewMode === 'bilingual' && <div className="border-t border-[rgba(242,242,226,0.08)] my-2"></div>}

            {/* Chinese Translation */}
            {(viewMode === 'bilingual' || viewMode === 'chinese') && (
              <p className="text-sm text-[#C5BC8E] font-sans leading-relaxed">
                {p.chinese}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
