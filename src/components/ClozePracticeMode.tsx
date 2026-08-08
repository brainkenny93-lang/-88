import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  HelpCircle,
  CheckCircle2,
  RotateCcw,
  ArrowLeft,
  ArrowRight,
  Check,
  AlertCircle,
  BookOpen,
  Keyboard,
  Sparkles,
} from 'lucide-react';
import { DELEArticleResult, ClozeItem, TargetWordUsage } from '../types';

interface PracticeResult {
  clozeItem: ClozeItem;
  userInput: string;
  isCorrect: boolean;
  isAccentErrorOnly: boolean;
}

interface ClozePracticeModeProps {
  article: DELEArticleResult;
  onFinishPractice: (results: PracticeResult[]) => void;
  onExitPractice: () => void;
  onWordClick: (word: TargetWordUsage) => void;
}

// Function to normalize accents for accent-tolerant checking
function normalizeAccents(str: string): string {
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

export const ClozePracticeMode: React.FC<ClozePracticeModeProps> = ({
  article,
  onFinishPractice,
  onExitPractice,
  onWordClick,
}) => {
  // 1. Sanitize cloze items to guarantee 100% strictly unique IDs
  const sanitizedClozeItems = useMemo(() => {
    const seenIds = new Set<string>();
    return (article.clozeItems || []).map((item, idx) => {
      let uniqueId = item.id || `cloze_p${item.paragraphIndex}_${idx}_${item.targetAnswer}`;
      if (seenIds.has(uniqueId)) {
        uniqueId = `${uniqueId}_${idx}`;
      }
      seenIds.add(uniqueId);
      return {
        ...item,
        id: uniqueId,
      };
    });
  }, [article]);

  // Map each cloze item ID to its global 0-based index across the article
  const clozeIndexMap = useMemo(() => {
    const map = new Map<string, number>();
    sanitizedClozeItems.forEach((item, idx) => {
      map.set(item.id, idx);
    });
    return map;
  }, [sanitizedClozeItems]);

  // Refs for each input element
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Track currently active/focused blank index (0 to N-1)
  const [activeInputIndex, setActiveInputIndex] = useState<number>(0);

  // Independent input states for each unique blank ID
  const [userInputs, setUserInputs] = useState<Record<string, string>>({});

  // Per-item verification state
  const [checkedItems, setCheckedItems] = useState<
    Record<string, { isChecked: boolean; isCorrect: boolean; isAccentErrorOnly: boolean }>
  >({});

  // Hint visibility toggles
  const [showHints, setShowHints] = useState<Record<string, boolean>>({});

  // Focus a specific blank by global index
  const jumpToBlank = (index: number) => {
    if (index >= 0 && index < sanitizedClozeItems.length) {
      setActiveInputIndex(index);
      const el = inputRefs.current[index];
      if (el) {
        el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        el.focus();
        el.select();
      }
    }
  };

  // Handle editing an individual blank (isolated completely to item.id)
  const handleInputChange = (id: string, value: string) => {
    setUserInputs((prev) => ({ ...prev, [id]: value }));
    // Reset checked status ONLY for this specific blank when edited
    setCheckedItems((prev) => ({
      ...prev,
      [id]: { isChecked: false, isCorrect: false, isAccentErrorOnly: false },
    }));
  };

  // Single-item Instant Verification
  const verifySingleItem = (item: ClozeItem) => {
    const input = (userInputs[item.id] || '').trim();
    const target = item.targetAnswer.trim();

    const isExact = input.toLowerCase() === target.toLowerCase();
    const isAccentMatch = normalizeAccents(input) === normalizeAccents(target);
    const isAccentErrorOnly = !isExact && isAccentMatch;

    setCheckedItems((prev) => ({
      ...prev,
      [item.id]: {
        isChecked: true,
        isCorrect: isExact,
        isAccentErrorOnly,
      },
    }));
  };

  const toggleHint = (id: string) => {
    setShowHints((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Helper to open word detail modal for a cloze item
  const openWordDetail = (cloze: ClozeItem) => {
    const wordUsage: TargetWordUsage = {
      original: cloze.originalWord,
      formInArticle: cloze.targetAnswer,
      chineseMeaning: cloze.sentenceContextChinese || cloze.hint,
      contextSentence: cloze.sentenceContextSpanish || '',
      usageTip: `自测考查提示：${cloze.hint}`,
      partOfSpeech: '目标变位词',
      level: article.deleLevel,
    };
    onWordClick(wordUsage);
  };

  // Overall Batch Submission
  const handleSubmitAll = () => {
    const newCheckedState: Record<
      string,
      { isChecked: boolean; isCorrect: boolean; isAccentErrorOnly: boolean }
    > = {};

    const results: PracticeResult[] = sanitizedClozeItems.map((item) => {
      const input = (userInputs[item.id] || '').trim();
      const target = item.targetAnswer.trim();

      const isExact = input.toLowerCase() === target.toLowerCase();
      const isAccentMatch = normalizeAccents(input) === normalizeAccents(target);

      const isCorrect = isExact;
      const isAccentErrorOnly = !isExact && isAccentMatch;

      newCheckedState[item.id] = {
        isChecked: true,
        isCorrect,
        isAccentErrorOnly,
      };

      return {
        clozeItem: item,
        userInput: input,
        isCorrect,
        isAccentErrorOnly,
      };
    });

    setCheckedItems(newCheckedState);
    onFinishPractice(results);
  };

  // Render paragraph with inputs placed at exact sequential matches
  const renderParagraphWithInputs = (pIndex: number, paragraphSpanish: string) => {
    const pClozes = sanitizedClozeItems.filter((c) => c.paragraphIndex === pIndex);

    if (pClozes.length === 0) {
      return (
        <p className="text-base text-[#0F304F] dark:text-[#E2E0D8] font-serif leading-relaxed">
          {paragraphSpanish}
        </p>
      );
    }

    // Build segments sequentially from left to right in paragraphSpanish
    const segments: { text?: string; cloze?: ClozeItem }[] = [];
    let currentPos = 0;

    pClozes.forEach((cloze) => {
      const target = cloze.targetAnswer;
      if (!target) return;

      const lowerPara = paragraphSpanish.toLowerCase();
      const lowerTarget = target.toLowerCase();

      let matchIdx = lowerPara.indexOf(lowerTarget, currentPos);

      // Fallback search if currentPos passed
      if (matchIdx === -1) {
        matchIdx = lowerPara.indexOf(lowerTarget, 0);
      }

      if (matchIdx !== -1 && matchIdx >= currentPos) {
        if (matchIdx > currentPos) {
          segments.push({ text: paragraphSpanish.substring(currentPos, matchIdx) });
        }
        segments.push({
          cloze,
          text: paragraphSpanish.substring(matchIdx, matchIdx + target.length),
        });
        currentPos = matchIdx + target.length;
      }
    });

    if (currentPos < paragraphSpanish.length) {
      segments.push({ text: paragraphSpanish.substring(currentPos) });
    }

    return (
      <div className="text-base sm:text-lg text-[#0F304F] dark:text-[#E2E0D8] font-serif leading-loose">
        {segments.map((seg, idx) => {
          if (seg.cloze) {
            const cloze = seg.cloze;
            const globalIdx = clozeIndexMap.get(cloze.id) ?? 0;
            const value = userInputs[cloze.id] || '';
            const isHintVisible = showHints[cloze.id];
            const checkState = checkedItems[cloze.id];

            const isChecked = checkState?.isChecked;
            const isCorrect = checkState?.isCorrect;
            const isWrong = isChecked && !isCorrect;
            const isActive = activeInputIndex === globalIdx;

            return (
              <span
                key={cloze.id}
                className="inline-flex flex-wrap items-center gap-1.5 mx-1 relative my-1 align-baseline"
              >
                {/* Input Box */}
                <input
                  ref={(el) => {
                    inputRefs.current[globalIdx] = el;
                  }}
                  type="text"
                  value={value}
                  onFocus={() => setActiveInputIndex(globalIdx)}
                  onChange={(e) => handleInputChange(cloze.id, e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'ArrowRight') {
                      e.preventDefault();
                      if (globalIdx < sanitizedClozeItems.length - 1) {
                        jumpToBlank(globalIdx + 1);
                      }
                    } else if (e.key === 'ArrowLeft') {
                      e.preventDefault();
                      if (globalIdx > 0) {
                        jumpToBlank(globalIdx - 1);
                      }
                    } else if (e.key === 'Enter') {
                      e.preventDefault();
                      // Verify single item
                      verifySingleItem(cloze);
                      // Advance to next blank or submit
                      if (globalIdx < sanitizedClozeItems.length - 1) {
                        jumpToBlank(globalIdx + 1);
                      } else {
                        handleSubmitAll();
                      }
                    }
                  }}
                  placeholder={`[空 ${globalIdx + 1}]`}
                  className={`px-3 py-1 text-sm font-sans font-bold rounded outline-none transition-all border-2 min-w-[120px] text-center ${
                    isChecked
                      ? isCorrect
                        ? 'bg-emerald-950/80 text-emerald-300 border-emerald-500'
                        : 'bg-rose-950/80 text-rose-300 border-rose-500 ring-2 ring-rose-400/50'
                      : isActive
                      ? 'bg-[#1C2822] border-[#D9A066] text-[#F2F2E2] ring-2 ring-[#D9A066]/50 shadow-md'
                      : 'bg-[rgba(0,0,0,0.25)] border-[rgba(242,242,226,0.15)] text-[#F2F2E2] hover:border-[#D9A066]'
                  }`}
                />

                {/* Single Item Instant Verify Button */}
                <button
                  type="button"
                  onClick={() => verifySingleItem(cloze)}
                  title="核验该处填空 (按 Enter)"
                  className="px-2 py-1 text-xs font-mono-code font-bold rounded bg-[#D9A066] hover:bg-[#e2b07d] text-[#1C2822] transition-all flex items-center space-x-0.5 cursor-pointer"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">核验</span>
                </button>

                {/* Hint Button */}
                <button
                  type="button"
                  onClick={() => toggleHint(cloze.id)}
                  title="点击查看语法/变位提示"
                  className="text-[#D9A066] hover:text-[#F2F2E2] p-0.5 cursor-pointer"
                >
                  <HelpCircle className="w-4 h-4 inline" />
                </button>

                {/* Verification Feedback Badge */}
                {isChecked && isCorrect && (
                  <span className="px-2 py-0.5 rounded bg-emerald-600 text-white text-xs font-mono-code font-bold flex items-center space-x-1 shadow-2xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>正确</span>
                  </span>
                )}

                {isChecked && isWrong && (
                  <div className="inline-flex items-center space-x-1">
                    <span className="px-2 py-0.5 rounded bg-rose-600 text-white font-mono-code font-bold text-xs flex items-center space-x-1 shadow-2xs">
                      <AlertCircle className="w-3.5 h-3.5" />
                      <span>正确: {cloze.targetAnswer}</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => openWordDetail(cloze)}
                      title="点击调出词汇深度解析"
                      className="px-2 py-0.5 rounded bg-[#141D19] hover:bg-[#1C2822] text-[#D9A066] border border-[#D9A066] text-xs font-mono-code font-bold transition-all flex items-center space-x-1 cursor-pointer"
                    >
                      <BookOpen className="w-3 h-3" />
                      <span>解析</span>
                    </button>
                  </div>
                )}

                {/* Hint Popup line */}
                {isHintVisible && (
                  <span className="block w-full text-[11px] font-sans font-normal text-[#F2F2E2] bg-[rgba(217,160,102,0.15)] px-2.5 py-1 rounded border border-[#D9A066] mt-1">
                    💡 提示: {cloze.hint} (原词: {cloze.originalWord})
                  </span>
                )}
              </span>
            );
          }
          return <span key={idx}>{seg.text}</span>;
        })}
      </div>
    );
  };

  return (
    <div className="card-pine overflow-hidden space-y-6 p-6 sm:p-8 shadow-xl">
      {/* Top Banner */}
      <div className="bg-[#141D19] border border-[rgba(242,242,226,0.12)] p-6 rounded shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="badge-hazelnut">
              DELE {article.deleLevel} 变位自测
            </span>
            <span className="px-2.5 py-0.5 rounded bg-[rgba(255,255,255,0.06)] text-[#F2F2E2] text-xs font-mono-code border border-[rgba(242,242,226,0.1)]">
              共 {sanitizedClozeItems.length} 处填空
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-display text-[#D9A066] pt-1">
            范文：《{article.titleSpanish}》
          </h2>
          <p className="text-xs text-[#C5BC8E] font-sans opacity-80">
            独立修改各空互不干涉，答错可随时调出词汇解析，提交后错词自动收集入专属生词本！
          </p>
        </div>

        <button
          type="button"
          onClick={onExitPractice}
          className="px-4 py-2 rounded bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F2F2E2] border border-[rgba(242,242,226,0.15)] text-xs font-mono-code font-bold transition-all flex items-center space-x-1.5 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>退出自测 (返回原文)</span>
        </button>
      </div>

      {/* Keyboard Shortcuts & Question Navigator Bar */}
      <div className="p-4 rounded-2xl bg-[#E3E0CB]/40 dark:bg-[#242529] border border-[#0F304F]/10 dark:border-zinc-800 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center space-x-2 text-[#0F304F] dark:text-[#E2E0D8] font-bold">
            <Keyboard className="w-4 h-4 text-[#3B6EA5]" />
            <span>键盘快捷操作指南：</span>
            <span className="text-[#3B6EA5] font-mono font-medium">
              [←] [→] 左右键切换题目 | [Enter] 回车核验单空 / 提交批改
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-xs text-[#0F304F]/70 dark:text-[#7CA3C4] font-semibold">
              当前: 第 <strong className="text-[#94A02F] font-black">{activeInputIndex + 1}</strong> / {sanitizedClozeItems.length} 空
            </span>
            <button
              type="button"
              onClick={() => jumpToBlank(activeInputIndex - 1)}
              disabled={activeInputIndex === 0}
              className="px-2.5 py-1 text-xs rounded-xl bg-[#3B6EA5] hover:bg-[#2e5988] disabled:opacity-40 text-white font-bold transition-all flex items-center space-x-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>上一题</span>
            </button>
            <button
              type="button"
              onClick={() => jumpToBlank(activeInputIndex + 1)}
              disabled={activeInputIndex === sanitizedClozeItems.length - 1}
              className="px-2.5 py-1 text-xs rounded-xl bg-[#3B6EA5] hover:bg-[#2e5988] disabled:opacity-40 text-white font-bold transition-all flex items-center space-x-1"
            >
              <span>下一题</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Quick Jump Pills for each blank */}
        <div className="flex flex-wrap gap-1.5 pt-1">
          {sanitizedClozeItems.map((item, idx) => {
            const hasVal = Boolean(userInputs[item.id]?.trim());
            const checkState = checkedItems[item.id];
            const isChecked = checkState?.isChecked;
            const isCorrect = checkState?.isCorrect;
            const isActive = activeInputIndex === idx;

            let badgeClass = 'bg-white dark:bg-[#121316] text-[#0F304F] dark:text-[#E2E0D8] border-slate-200 dark:border-zinc-700';
            if (isChecked) {
              badgeClass = isCorrect
                ? 'bg-emerald-500 text-white font-bold border-emerald-600'
                : 'bg-rose-500 text-white font-bold border-rose-600';
            } else if (hasVal) {
              badgeClass = 'bg-[#3B6EA5] text-white font-bold border-[#2e5988]';
            }

            return (
              <button
                key={item.id}
                type="button"
                onClick={() => jumpToBlank(idx)}
                className={`px-2.5 py-1 text-xs rounded-xl border font-mono transition-all flex items-center space-x-1 ${badgeClass} ${
                  isActive ? 'ring-2 ring-[#94A02F] scale-105 shadow-sm' : 'hover:scale-102'
                }`}
              >
                <span>空 {idx + 1}</span>
                {isChecked && (isCorrect ? <Check className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Paragraphs with Ivory Cream #E3E0CB Background */}
      <div className="space-y-6">
        {article.paragraphs.map((p, idx) => (
          <div
            key={p.id || idx}
            className="p-6 rounded-3xl bg-[#E3E0CB] dark:bg-[#242529] border border-[#0F304F]/10 dark:border-zinc-800 space-y-3 transition-colors shadow-2xs"
          >
            <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-[#3B6EA5] dark:text-[#7CA3C4]">
              PÁRRAFO {idx + 1} - 填空自测 (支持左右键导航 & Enter 提交)
            </div>
            {renderParagraphWithInputs(idx, p.spanish)}
            <p className="text-xs text-[#0F304F]/70 dark:text-[#7CA3C4] pt-2 border-t border-[#0F304F]/10 dark:border-zinc-800 font-sans">
              译文参考：{p.chinese}
            </p>
          </div>
        ))}
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="pt-4 border-t border-slate-200 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-4">
        <div className="text-xs text-[#3B6EA5] dark:text-[#7CA3C4] font-semibold flex items-center space-x-2">
          <Sparkles className="w-4 h-4 text-[#94A02F]" />
          <span>
            已填写 {Object.keys(userInputs).filter((k) => userInputs[k]?.trim()).length} / {sanitizedClozeItems.length} 项
          </span>
        </div>

        <div className="flex space-x-3">
          <button
            type="button"
            onClick={() => {
              setUserInputs({});
              setCheckedItems({});
            }}
            className="px-4 py-2 text-xs font-bold rounded-2xl bg-[#3B6EA5] hover:bg-[#2e5988] text-white transition-colors flex items-center space-x-1"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>重置全篇</span>
          </button>

          <button
            id="btn-submit-cloze-batch"
            type="button"
            onClick={handleSubmitAll}
            className="px-6 py-2.5 rounded-2xl bg-[#94A02F] hover:bg-[#838e28] text-[#0F304F] font-black text-sm shadow-md transition-all flex items-center space-x-2"
          >
            <CheckCircle2 className="w-4.5 h-4.5 text-[#0F304F]" />
            <span>一键提交统一批改 & 错词归集</span>
          </button>
        </div>
      </div>
    </div>
  );
};
