import React, { useState } from 'react';
import { Plus, Trash2, Star, Sparkles, BookOpen, Layers } from 'lucide-react';
import { VocabularyInputItem, DELELevel, PresetWordPack } from '../types';
import { PRESET_WORD_PACKS } from '../data/presetPacks';

interface VocabularyInputProps {
  words: VocabularyInputItem[];
  setWords: React.Dispatch<React.SetStateAction<VocabularyInputItem[]>>;
  selectedLevel: DELELevel;
  onSelectLevel: (level: DELELevel) => void;
}

export const VocabularyInput: React.FC<VocabularyInputProps> = ({
  words,
  setWords,
  selectedLevel,
  onSelectLevel,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [batchText, setBatchText] = useState('');
  const [activeInputMode, setActiveInputMode] = useState<'single' | 'batch' | 'preset'>('batch');

  // Add single word
  const handleAddSingle = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;

    if (words.some((w) => w.word.toLowerCase() === trimmed.toLowerCase())) {
      setInputValue('');
      return;
    }

    setWords((prev) => [
      ...prev,
      {
        id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
        word: trimmed,
        isCore: false,
      },
    ]);
    setInputValue('');
  };

  // Add batch words from textarea
  const handleAddBatch = () => {
    if (!batchText.trim()) return;

    const parsed = batchText
      .split(/[,;\n，；]+/)
      .map((w) => w.trim())
      .filter((w) => w.length > 0);

    const existingSet = new Set(words.map((w) => w.word.toLowerCase()));
    const newItems: VocabularyInputItem[] = [];

    parsed.forEach((w) => {
      if (!existingSet.has(w.toLowerCase())) {
        existingSet.add(w.toLowerCase());
        newItems.push({
          id: 'w_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
          word: w,
          isCore: false,
        });
      }
    });

    if (newItems.length > 0) {
      setWords((prev) => [...prev, ...newItems]);
      setBatchText('');
    }
  };

  // Import a Preset Pack
  const handleImportPresetPack = (pack: PresetWordPack) => {
    onSelectLevel(pack.level);
    const existingSet = new Set(words.map((w) => w.word.toLowerCase()));
    const newItems: VocabularyInputItem[] = [];

    pack.words.forEach((w, idx) => {
      if (!existingSet.has(w.toLowerCase())) {
        existingSet.add(w.toLowerCase());
        newItems.push({
          id: 'w_' + Date.now() + '_' + idx,
          word: w,
          isCore: idx < 3, // mark first 3 as core by default
        });
      }
    });

    setWords((prev) => [...prev, ...newItems]);
  };

  const toggleCore = (id: string) => {
    setWords((prev) =>
      prev.map((w) => (w.id === id ? { ...w, isCore: !w.isCore } : w))
    );
  };

  const removeWord = (id: string) => {
    setWords((prev) => prev.filter((w) => w.id !== id));
  };

  const clearAll = () => {
    setWords([]);
  };

  return (
    <div className="space-y-6">
      {/* CARD 1: 备考词汇导入 / VOCABULARIO */}
      <div className="card-pine p-6 shadow-lg">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-4 mb-4 border-b border-[rgba(242,242,226,0.12)]">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="font-display text-lg tracking-wider text-[#F2F2E2]">
                备考词汇导入 / VOCABULARIO
              </h2>
              <span className="badge-hazelnut">
                {words.length} WORDS LOADED
              </span>
            </div>
            <p className="text-xs text-[#C5BC8E] opacity-80 mt-1 font-sans">
              输入单词、成语或短语，AI 逻辑编织天然整合进 DELE 高分作文
            </p>
          </div>

          {/* Mode Selector */}
          <div className="inline-flex p-1 rounded-lg bg-[#141D19] border border-[rgba(242,242,226,0.12)] text-xs font-mono">
            <button
              type="button"
              onClick={() => setActiveInputMode('batch')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeInputMode === 'batch'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#C5BC8E] hover:text-[#F2F2E2]'
              }`}
            >
              批量导入
            </button>
            <button
              type="button"
              onClick={() => setActiveInputMode('single')}
              className={`px-3 py-1.5 rounded transition-all cursor-pointer ${
                activeInputMode === 'single'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#C5BC8E] hover:text-[#F2F2E2]'
              }`}
            >
              逐词添加
            </button>
            <button
              type="button"
              onClick={() => setActiveInputMode('preset')}
              className={`px-3 py-1.5 rounded transition-all flex items-center space-x-1 cursor-pointer ${
                activeInputMode === 'preset'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold'
                  : 'text-[#D9A066] hover:bg-[#D9A066]/10'
              }`}
            >
              <Sparkles className="w-3 h-3" />
              <span>词包预设</span>
            </button>
          </div>
        </div>

        {/* Mode 1: Batch Textarea */}
        {activeInputMode === 'batch' && (
          <div className="space-y-3">
            <textarea
              id="input-batch-textarea"
              rows={3}
              value={batchText}
              onChange={(e) => setBatchText(e.target.value)}
              placeholder="输入或粘贴词汇列表，支持用逗号、分号或换行分隔：sostenibilidad, fomentar, desafío, en consecuencia, sin embargo..."
              className="w-full p-3 bg-[rgba(0,0,0,0.25)] border border-[rgba(242,242,226,0.15)] rounded-md text-[#F2F2E2] placeholder-[rgba(242,242,226,0.35)] text-sm focus:border-[#D9A066] outline-none font-sans transition-all"
            />
            <div className="flex justify-end">
              <button
                id="btn-add-batch"
                type="button"
                onClick={handleAddBatch}
                disabled={!batchText.trim()}
                className="px-5 py-2.5 font-display text-sm tracking-wider bg-[#D9A066] hover:bg-[#e0ab73] text-[#1C2822] font-bold rounded border-none cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4 text-[#1C2822]" />
                <span>ADD TO WEAVE ➔</span>
              </button>
            </div>
          </div>
        )}

        {/* Mode 2: Single Add */}
        {activeInputMode === 'single' && (
          <div className="flex space-x-2">
            <input
              id="input-single-word"
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddSingle()}
              placeholder="输入备考词汇或短语，如: impresionar, a pesar de..."
              className="flex-1 p-3 bg-[rgba(0,0,0,0.25)] border border-[rgba(242,242,226,0.15)] rounded-md text-[#F2F2E2] placeholder-[rgba(242,242,226,0.35)] text-sm focus:border-[#D9A066] outline-none font-sans"
            />
            <button
              id="btn-add-single"
              type="button"
              onClick={handleAddSingle}
              disabled={!inputValue.trim()}
              className="px-5 py-2.5 font-display text-sm tracking-wider bg-[#D9A066] hover:bg-[#e0ab73] text-[#1C2822] font-bold rounded cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed transition-all flex items-center space-x-1"
            >
              <Plus className="w-4 h-4" />
              <span>ADD</span>
            </button>
          </div>
        )}

        {/* Mode 3: Preset Word Packs */}
        {activeInputMode === 'preset' && (
          <div className="space-y-3">
            <span className="font-mono-code text-xs text-[#D9A066] uppercase tracking-wider block">
              Seleccionar Pack DELE Oficial
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {PRESET_WORD_PACKS.map((pack, idx) => (
                <div
                  key={idx}
                  onClick={() => handleImportPresetPack(pack)}
                  className="p-3.5 bg-[rgba(0,0,0,0.2)] border border-[rgba(242,242,226,0.1)] hover:border-[#D9A066] rounded cursor-pointer transition-all flex flex-col justify-between space-y-2 group"
                >
                  <div>
                    <div className="flex items-center justify-between">
                      <span className="badge-hazelnut">
                        DELE {pack.level}
                      </span>
                      <span className="font-mono-code text-[10px] text-[#C5BC8E]">
                        {pack.words.length} 词
                      </span>
                    </div>
                    <h4 className="font-display text-sm text-[#F2F2E2] mt-2 group-hover:text-[#D9A066] transition-colors">
                      {pack.title}
                    </h4>
                    <p className="text-xs text-[#C5BC8E] opacity-75 mt-0.5 line-clamp-1">
                      {pack.topic}
                    </p>
                  </div>
                  <div className="text-[11px] font-mono-code text-[#C5BC8E] bg-[rgba(0,0,0,0.3)] p-1.5 rounded border border-[rgba(242,242,226,0.08)] line-clamp-1">
                    {pack.words.slice(0, 4).join(', ')}...
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* CARD 2: 已加载词汇 LISTADO */}
      <div className="card-pine p-6 shadow-lg">
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-[rgba(242,242,226,0.12)]">
          <h2 className="font-display text-base tracking-wider text-[#F2F2E2] flex items-center space-x-2">
            <span>已加载词汇 / LISTADO</span>
            <span className="font-mono-code text-xs text-[#C5BC8E] opacity-75 font-normal">
              ({words.length} Items)
            </span>
          </h2>
          {words.length > 0 && (
            <button
              id="btn-clear-all-words"
              type="button"
              onClick={clearAll}
              className="text-xs font-mono-code text-[rgba(242,242,226,0.5)] hover:text-rose-400 transition-colors flex items-center space-x-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>CLEAR ALL</span>
            </button>
          )}
        </div>

        {words.length === 0 ? (
          <div className="py-8 text-center text-[#C5BC8E] opacity-60 font-mono-code text-xs space-y-2">
            <BookOpen className="w-8 h-8 mx-auto opacity-40" />
            <p>暂无词汇，请在上方输入框添加或导入预设词包</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 pt-1 max-h-56 overflow-y-auto">
            {words.map((item) => (
              <div
                key={item.id}
                className={`tag-hazelnut ${
                  item.isCore ? 'border-2 font-bold bg-[#D9A066]/20' : ''
                }`}
              >
                <button
                  type="button"
                  onClick={() => toggleCore(item.id)}
                  title={item.isCore ? '取消核心标志' : '标记为高优先运用核心词'}
                  className="mr-1.5 hover:scale-110 transition-transform cursor-pointer"
                >
                  <Star
                    className={`w-3.5 h-3.5 ${
                      item.isCore ? 'text-[#D9A066] fill-[#D9A066]' : 'text-[#C5BC8E] opacity-50'
                    }`}
                  />
                </button>
                <span>{item.word}</span>
                <button
                  type="button"
                  onClick={() => removeWord(item.id)}
                  className="ml-2 text-[rgba(242,242,226,0.4)] hover:text-rose-300 font-bold cursor-pointer"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

