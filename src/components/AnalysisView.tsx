import React, { useState } from 'react';
import { Sparkles, Plus, Check } from 'lucide-react';
import { DELEArticleResult, RecommendedWord } from '../types';

interface AnalysisViewProps {
  article: DELEArticleResult;
  onAddWordToNotebook: (word: { spanish: string; chinese: string; level?: any; exampleSentence?: string }) => void;
}

export const AnalysisView: React.FC<AnalysisViewProps> = ({ article, onAddWordToNotebook }) => {
  const [addedSet, setAddedSet] = useState<Set<string>>(new Set());

  const handleAddRecommend = (rec: RecommendedWord) => {
    onAddWordToNotebook({
      spanish: rec.spanish,
      chinese: rec.chinese,
      level: rec.level,
      exampleSentence: rec.example,
    });
    setAddedSet((prev) => new Set(prev).add(rec.spanish));
  };

  const recommendList = article.recommendedVocabulary || [];

  return (
    <div className="card-pine p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,242,226,0.12)] pb-4">
        <div>
          <h3 className="font-display text-base text-[#F2F2E2] flex items-center space-x-2">
            <Sparkles className="w-5 h-5 text-[#D9A066]" />
            <span>DELE 官方备考延伸推荐词汇</span>
            <span className="badge-hazelnut">
              DELE {article.deleLevel}
            </span>
          </h3>
          <p className="text-xs text-[#C5BC8E] opacity-80 mt-1 font-mono-code">
            考官倾情推荐的主题延伸高频备考词汇，强化关联表达与真题词汇量
          </p>
        </div>
      </div>

      {/* Recommended Vocabulary Bento Grid */}
      {recommendList.length === 0 ? (
        <p className="text-xs text-[#C5BC8E] py-4 text-center font-mono-code opacity-60">暂无推荐词汇</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {recommendList.map((rec, idx) => {
            const isAdded = addedSet.has(rec.spanish);
            return (
              <div
                key={idx}
                className="p-4 rounded border border-[rgba(242,242,226,0.12)] bg-[rgba(0,0,0,0.2)] hover:border-[#D9A066] transition-all space-y-2 text-xs flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm text-[#F2F2E2] tracking-wide">{rec.spanish}</span>
                    <span className="badge-hazelnut text-[10px]">
                      DELE {rec.level || article.deleLevel}
                    </span>
                  </div>
                  <p className="text-[#C5BC8E] font-sans mt-1">{rec.chinese}</p>
                  {rec.example && (
                    <p className="text-[#F2F2E2] italic mt-1 font-sans opacity-80">"{rec.example}"</p>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleAddRecommend(rec)}
                  disabled={isAdded}
                  className={`mt-3 w-full py-2 rounded text-xs font-mono-code font-bold flex items-center justify-center space-x-1 transition-all cursor-pointer ${
                    isAdded
                      ? 'bg-[rgba(16,185,129,0.2)] text-emerald-400 border border-emerald-500/30'
                      : 'bg-[#D9A066] hover:bg-[#e2b07d] text-[#1C2822]'
                  }`}
                >
                  {isAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>已存入专属生词本</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>收录进专属生词本</span>
                    </>
                  )}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

