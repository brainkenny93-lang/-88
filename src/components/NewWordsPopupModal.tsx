import React, { useState } from 'react';
import { Sparkles, Copy, Check, X, BookmarkCheck } from 'lucide-react';
import { TargetWordUsage, DELELevel } from '../types';

interface NewWordsPopupModalProps {
  isOpen: boolean;
  onClose: () => void;
  words: TargetWordUsage[];
  deleLevel: DELELevel;
  articleTitle: string;
}

export const NewWordsPopupModal: React.FC<NewWordsPopupModalProps> = ({
  isOpen,
  onClose,
  words,
  deleLevel,
  articleTitle,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || words.length === 0) return null;

  const handleCopyNewWords = () => {
    const formatted = words
      .map(
        (w, idx) =>
          `${idx + 1}. ${w.original} (${w.formInArticle}) [${w.partOfSpeech}]\n   释义: ${w.chineseMeaning}\n   例句: ${w.contextSentence}`
      )
      .join('\n\n');

    navigator.clipboard.writeText(
      `【DELE ${deleLevel} 文章精选新增生词集】\n文章: ${articleTitle}\n\n${formatted}`
    );
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <BookmarkCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-black text-white">本次文章新增收录生词合集</h3>
                <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-mono font-bold">
                  DELE {deleLevel}
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-1 line-clamp-1">
                来自范文: 《{articleTitle}》
              </p>
            </div>
          </div>
        </div>

        {/* Content List */}
        <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
          <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
            <span>共成功收录 {words.length} 个重点词汇：</span>
            <button
              type="button"
              onClick={handleCopyNewWords}
              className="px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs flex items-center space-x-1.5 transition-all shadow-2xs"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-950" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '已复制全部生词' : '一键复制生词内容'}</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {words.map((w, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl border border-slate-200/80 bg-slate-50/70 space-y-1 text-xs"
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm font-serif">{w.original}</span>
                  <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-900 font-mono text-[10px]">
                    文中变位: {w.formInArticle}
                  </span>
                </div>
                <p className="text-slate-700 font-medium">
                  <strong>中文释义：</strong> {w.chineseMeaning}
                </p>
                <p className="text-slate-500 font-serif italic text-[11px] line-clamp-2">
                  "{w.contextSentence}"
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-500">已自动同步存入您的【DELE专属生词本】</span>
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            知晓并闭合
          </button>
        </div>
      </div>
    </div>
  );
};
