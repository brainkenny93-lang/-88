import React, { useState } from 'react';
import { Award, CheckCircle2, XCircle, AlertTriangle, Copy, Check, RotateCcw, X, BookCheck } from 'lucide-react';
import { ClozeItem, DELELevel } from '../types';

interface PracticeResult {
  clozeItem: ClozeItem;
  userInput: string;
  isCorrect: boolean;
  isAccentErrorOnly: boolean;
}

interface ClozeSummaryModalProps {
  results: PracticeResult[];
  deleLevel: DELELevel;
  onClose: () => void;
  onRetake: () => void;
  onBatchAddToNotebook: (items: { spanish: string; chinese: string; level: DELELevel; exampleSentence: string }[]) => void;
}

export const ClozeSummaryModal: React.FC<ClozeSummaryModalProps> = ({
  results,
  deleLevel,
  onClose,
  onRetake,
  onBatchAddToNotebook,
}) => {
  const [copied, setCopied] = useState(false);

  const total = results.length;
  const correctCount = results.filter((r) => r.isCorrect).length;
  const errorCount = total - correctCount;

  const scorePercentage = Math.round((correctCount / (total || 1)) * 100);

  const missedResults = results.filter((r) => !r.isCorrect);

  const handleCopyErrors = () => {
    if (missedResults.length === 0) return;

    const formatted = missedResults
      .map(
        (r, idx) =>
          `${idx + 1}. 原词: ${r.clozeItem.originalWord} | 正确形式: ${r.clozeItem.targetAnswer} | 你的填写: ${
            r.userInput || '(未填)'
          } | 提示: ${r.clozeItem.hint}`
      )
      .join('\n');

    navigator.clipboard.writeText(`【DELE ${deleLevel} 拼写自测错词列表】\n得分: ${scorePercentage}%\n\n${formatted}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white dark:bg-[#1A1B1F] text-[#0F304F] dark:text-[#E2E0D8] rounded-3xl border border-slate-200 dark:border-zinc-800 shadow-2xl max-w-2xl w-full overflow-hidden space-y-0 my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-[#0F304F] dark:bg-[#121316] text-white p-6 relative border-b border-slate-800">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-[#94A02F] dark:bg-[#A8B832] flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-xl font-black text-white">本轮拼写自测批改结果</h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#94A02F]/20 text-[#94A02F] dark:text-[#A8B832] border border-[#94A02F]/30 text-xs font-mono font-bold">
                  DELE {deleLevel}
                </span>
              </div>
              <p className="text-xs text-slate-300 dark:text-[#7CA3C4] mt-1 font-medium">
                详细考查对目标词汇变位、重音符与拼写准确度的把控
              </p>
            </div>
          </div>

          {/* Score Stat Cards */}
          <div className="grid grid-cols-3 gap-3 mt-6">
            <div className="bg-slate-800/80 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-xs text-slate-300 font-medium">综合准确率</div>
              <div
                className={`text-2xl font-black mt-1 font-mono ${
                  scorePercentage >= 80
                    ? 'text-emerald-400'
                    : scorePercentage >= 60
                    ? 'text-[#94A02F] dark:text-[#A8B832]'
                    : 'text-rose-400'
                }`}
              >
                {scorePercentage}%
              </div>
            </div>

            <div className="bg-slate-800/80 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-xs text-slate-300 font-medium">正确词汇数</div>
              <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                {correctCount} / {total}
              </div>
            </div>

            <div className="bg-slate-800/80 dark:bg-zinc-900/80 p-3 rounded-2xl border border-slate-700/60 text-center">
              <div className="text-xs text-slate-300 font-medium">拼写待改进</div>
              <div className="text-2xl font-black text-rose-400 mt-1 font-mono">
                {errorCount}
              </div>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {errorCount === 0 ? (
            <div className="p-6 rounded-3xl bg-emerald-500/15 border border-emerald-500/30 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 dark:text-emerald-400 mx-auto" />
              <h4 className="text-base font-extrabold text-emerald-900 dark:text-emerald-300">完美无瑕！本轮所有拼写变位全对！</h4>
              <p className="text-xs text-emerald-700 dark:text-emerald-400 font-medium">
                您已完全吃透该批 DELE {deleLevel} 目标词汇在上下文中的拼写与动词变位规则。
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex flex-wrap items-center justify-between text-xs font-bold border-b border-slate-100 dark:border-zinc-800 pb-3 gap-2">
                <div className="flex items-center space-x-2">
                  <span className="text-rose-600 dark:text-rose-400">⚠️ 拼写错词总结 ({errorCount} 个)</span>
                  <span className="px-2 py-0.5 rounded-lg bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 font-normal text-[11px] flex items-center space-x-1 border border-emerald-500/30">
                    <BookCheck className="w-3.5 h-3.5" />
                    <span>错词已自动归集存入专属生词本</span>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleCopyErrors}
                  className="px-3 py-1.5 text-xs rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-700 dark:text-slate-300 font-semibold flex items-center space-x-1"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? '已复制错词' : '一键复制错词'}</span>
                </button>
              </div>

              {/* List of errors */}
              <div className="space-y-3">
                {missedResults.map((r, idx) => (
                  <div
                    key={r.clozeItem.id || idx}
                    className="p-4 rounded-2xl bg-rose-500/10 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 space-y-2 text-xs"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 font-mono font-bold">
                      <div className="flex items-center space-x-2">
                        <XCircle className="w-4 h-4 text-rose-500 shrink-0" />
                        <span className="text-[#0F304F] dark:text-[#E2E0D8] text-sm">正确形式: {r.clozeItem.targetAnswer}</span>
                        <span className="text-slate-400 dark:text-zinc-500 font-sans font-normal text-xs">
                          (原词: {r.clozeItem.originalWord})
                        </span>
                      </div>
                      <div className="text-rose-700 dark:text-rose-300 font-sans">
                        你的填报：<span className="font-bold underline">{r.userInput || '[未填写]'}</span>
                      </div>
                    </div>

                    {r.isAccentErrorOnly && (
                      <div className="text-[11px] font-semibold text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-xl flex items-center space-x-1 border border-amber-500/30">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 shrink-0" />
                        <span>重音符号缺失或位置不正确！请特别注意西语重音符号 (tilde)。</span>
                      </div>
                    )}

                    <p className="text-slate-600 dark:text-[#7CA3C4] font-sans">
                      <strong>语法/提示：</strong> {r.clozeItem.hint}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 dark:bg-[#121316] p-4 border-t border-slate-200 dark:border-zinc-800 flex items-center justify-between">
          <button
            type="button"
            onClick={onRetake}
            className="px-4 py-2 text-xs font-bold rounded-2xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 transition-colors flex items-center space-x-1.5"
          >
            <RotateCcw className="w-4 h-4" />
            <span>重新做一次此练习</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2.5 text-xs font-extrabold rounded-2xl bg-[#94A02F] hover:bg-[#838e28] dark:bg-[#A8B832] dark:hover:bg-[#96a529] text-slate-950 transition-colors shadow-md"
          >
            完成闭合
          </button>
        </div>
      </div>
    </div>
  );
};

