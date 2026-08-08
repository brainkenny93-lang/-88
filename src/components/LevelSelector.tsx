import React from 'react';
import { Award, Compass, Sparkles, Sliders, CheckCircle2 } from 'lucide-react';
import { DELELevel, ArticleStyle, DELETopicKey } from '../types';
import { LEVEL_DESCRIPTIONS, DELE_TOPICS } from '../data/presetPacks';

interface LevelSelectorProps {
  selectedLevel: DELELevel;
  onSelectLevel: (level: DELELevel) => void;
  style: ArticleStyle;
  setStyle: (style: ArticleStyle) => void;
  topicKey: DELETopicKey;
  setTopicKey: (key: DELETopicKey) => void;
  customPrompt: string;
  setCustomPrompt: (prompt: string) => void;
}

export const LevelSelector: React.FC<LevelSelectorProps> = ({
  selectedLevel,
  onSelectLevel,
  style,
  setStyle,
  topicKey,
  setTopicKey,
  customPrompt,
  setCustomPrompt,
}) => {
  const levels: DELELevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="space-y-6">
      {/* CARD 3: 考试指南 / GUÍA & LEVEL SELECTOR */}
      <div className="card-pine p-6 shadow-lg">
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[rgba(242,242,226,0.12)]">
            <h2 className="font-display text-base tracking-wider text-[#F2F2E2]">
              DELE LEVEL CONFIGURACIÓN
            </h2>
            <span className="font-mono-code text-xs text-[#D9A066] font-bold">
              CURRENT: DELE {selectedLevel}
            </span>
          </div>

          {/* Level Buttons Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
            {levels.map((lvl) => {
              const isSelected = selectedLevel === lvl;
              return (
                <button
                  key={lvl}
                  type="button"
                  id={`btn-level-${lvl}`}
                  onClick={() => onSelectLevel(lvl)}
                  className={`p-2.5 rounded text-left transition-all cursor-pointer font-mono-code border ${
                    isSelected
                      ? 'bg-[#D9A066] text-[#1C2822] border-[#D9A066] font-bold shadow-md'
                      : 'bg-[rgba(0,0,0,0.2)] text-[#F2F2E2] border-[rgba(242,242,226,0.12)] hover:border-[#D9A066]'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-display text-sm">DELE {lvl}</span>
                    {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#1C2822]" />}
                  </div>
                  <p className={`text-[10px] mt-1 line-clamp-1 ${isSelected ? 'text-[#1C2822]' : 'text-[#C5BC8E] opacity-75'}`}>
                    {LEVEL_DESCRIPTIONS[lvl].length}
                  </p>
                </button>
              );
            })}
          </div>

          {/* Level Tip Box */}
          <div className="p-3.5 bg-[rgba(0,0,0,0.2)] border border-[rgba(217,160,102,0.25)] rounded text-xs text-[#F2F2E2] space-y-1">
            <div className="font-display text-sm text-[#D9A066] flex items-center space-x-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#D9A066]" />
              <span>{LEVEL_DESCRIPTIONS[selectedLevel].title} 要求与标准：</span>
            </div>
            <p className="text-xs text-[#F2F2E2] font-sans">
              <strong>核心语法：</strong> {LEVEL_DESCRIPTIONS[selectedLevel].grammarFocus}
            </p>
            <p className="text-xs text-[#C5BC8E] font-sans">
              <strong>考官侧重：</strong> {LEVEL_DESCRIPTIONS[selectedLevel].styleTip}
            </p>
          </div>
        </div>

        {/* Style & Topic Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5 pt-4 border-t border-[rgba(242,242,226,0.12)]">
          {/* Style Selection */}
          <div className="space-y-2">
            <span className="font-mono-code text-xs text-[#C5BC8E] uppercase block">
              Escenario / 风格控制
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                id="btn-style-formal"
                onClick={() => setStyle('formal')}
                className={`p-2.5 rounded text-xs text-left transition-all cursor-pointer border ${
                  style === 'formal'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.12)] font-bold'
                    : 'bg-[rgba(0,0,0,0.2)] border-[rgba(242,242,226,0.1)] text-[#F2F2E2] hover:border-[rgba(217,160,102,0.5)]'
                }`}
              >
                <div className="font-display text-xs">🏛️ EXAM FORMAL</div>
                <div className="text-[10px] text-[#C5BC8E] opacity-75 font-sans mt-0.5">
                  DELE 答题卷标准格式
                </div>
              </button>

              <button
                type="button"
                id="btn-style-casual"
                onClick={() => setStyle('casual')}
                className={`p-2.5 rounded text-xs text-left transition-all cursor-pointer border ${
                  style === 'casual'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.12)] font-bold'
                    : 'bg-[rgba(0,0,0,0.2)] border-[rgba(242,242,226,0.1)] text-[#F2F2E2] hover:border-[rgba(217,160,102,0.5)]'
                }`}
              >
                <div className="font-display text-xs">💬 NATIVE CASUAL</div>
                <div className="text-[10px] text-[#C5BC8E] opacity-75 font-sans mt-0.5">
                  西语地道日常表达
                </div>
              </button>
            </div>
          </div>

          {/* Topic Selection */}
          <div className="space-y-2">
            <span className="font-mono-code text-xs text-[#C5BC8E] uppercase block">
              Escenario / 主题场景
            </span>
            <select
              id="select-dele-topic"
              value={topicKey}
              onChange={(e) => setTopicKey(e.target.value as DELETopicKey)}
              className="w-full p-2.5 bg-[rgba(0,0,0,0.25)] border border-[rgba(242,242,226,0.15)] text-[#F2F2E2] text-xs font-sans rounded focus:border-[#D9A066] outline-none"
            >
              {DELE_TOPICS.map((t) => (
                <option key={t.key} value={t.key} className="bg-[#1C2822] text-[#F2F2E2]">
                  {t.nameZh} ({t.nameEs})
                </option>
              ))}
            </select>
            <p className="text-[10px] text-[#C5BC8E] opacity-75 font-sans">
              {DELE_TOPICS.find((t) => t.key === topicKey)?.desc}
            </p>
          </div>
        </div>

        {/* CARD 4: 额外约束 REQUISITOS */}
        <div className="mt-5 pt-4 border-t border-[rgba(242,242,226,0.12)] space-y-2">
          <span className="font-mono-code text-xs text-[#C5BC8E] uppercase block">
            Requisitos / 额外约束
          </span>
          <input
            id="input-custom-prompt"
            type="text"
            value={customPrompt}
            onChange={(e) => setCustomPrompt(e.target.value)}
            placeholder="例如：Include specific data / 包含特定信函首尾格式 (carta formal)..."
            className="w-full p-2.5 bg-[rgba(0,0,0,0.25)] border border-[rgba(242,242,226,0.15)] text-[#F2F2E2] placeholder-[rgba(242,242,226,0.35)] text-xs font-sans rounded focus:border-[#D9A066] outline-none"
          />
        </div>
      </div>
    </div>
  );
};
