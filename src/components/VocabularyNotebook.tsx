import React, { useState } from 'react';
import { BookmarkCheck, Search, Trash2, Download, Upload, Copy, Check, Plus, Volume2, BookOpen, FileCheck } from 'lucide-react';
import { VocabularyNotebookItem, DELELevel } from '../types';

interface VocabularyNotebookProps {
  notebookItems: VocabularyNotebookItem[];
  onAddWord: (word: { spanish: string; chinese: string; level?: DELELevel | 'General'; partOfSpeech?: string; exampleSentence?: string }) => void;
  onDeleteWord: (id: string) => void;
  onImportItems: (items: VocabularyNotebookItem[]) => void;
}

export const VocabularyNotebook: React.FC<VocabularyNotebookProps> = ({
  notebookItems,
  onAddWord,
  onDeleteWord,
  onImportItems,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLevelFilter, setSelectedLevelFilter] = useState<string>('all');
  const [copied, setCopied] = useState(false);

  // New word form state
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpanish, setNewSpanish] = useState('');
  const [newChinese, setNewChinese] = useState('');
  const [newLevel, setNewLevel] = useState<DELELevel>('B1');
  const [newPOS, setNewPOS] = useState('');
  const [newExample, setNewExample] = useState('');

  // Practice/Study Mode (Dictation & Flip Card Review)
  const [studyMode, setStudyMode] = useState<'none' | 'flip' | 'dictation'>('none');
  const [cardIndex, setCardIndex] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [dictationInput, setDictationInput] = useState('');
  const [dictationChecked, setDictationChecked] = useState(false);

  // Filter items
  const filteredItems = notebookItems.filter((item) => {
    const matchesSearch =
      item.spanish.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.chinese.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesLevel =
      selectedLevelFilter === 'all' || item.level === selectedLevelFilter;

    return matchesSearch && matchesLevel;
  });

  const handleCreateNewWord = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSpanish.trim() || !newChinese.trim()) return;

    onAddWord({
      spanish: newSpanish.trim(),
      chinese: newChinese.trim(),
      level: newLevel,
      partOfSpeech: newPOS.trim(),
      exampleSentence: newExample.trim(),
    });

    setNewSpanish('');
    setNewChinese('');
    setNewPOS('');
    setNewExample('');
    setShowAddModal(false);
  };

  // 1-Click Copy All Words
  const handleCopyAllWords = () => {
    if (filteredItems.length === 0) return;

    const formatted = filteredItems
      .map((item) => `${item.spanish}\t${item.chinese}\t[${item.level}]\t${item.exampleSentence || ''}`)
      .join('\n');

    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Export JSON
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(notebookItems, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `DELE_Vocabulary_Notebook_${Date.now()}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  // Import JSON
  const handleImportJSON = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportItems(parsed);
          alert(`成功导入 ${parsed.length} 个生词！`);
        }
      } catch (err) {
        alert('文件格式错误，请导入标准的生词本 JSON 文件。');
      }
    };
    reader.readAsText(file);
  };

  const handlePlayAudio = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = 'es-ES';
    utterance.rate = 0.9;
    window.speechSynthesis.speak(utterance);
  };

  return (
    <div className="card-pine p-6 sm:p-8 space-y-6 shadow-xl">
      {/* Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[rgba(242,242,226,0.12)] pb-5">
        <div>
          <h2 className="font-display text-xl text-[#F2F2E2] flex items-center space-x-2">
            <BookmarkCheck className="w-6 h-6 text-[#D9A066]" />
            <span>DELE CUADERNO DE VOCABULARIO ({notebookItems.length})</span>
          </h2>
          <p className="text-xs text-[#C5BC8E] opacity-80 mt-1 font-mono-code">
            积累范文与自主添加的 DELE 高频考点词汇，支持听写复习、一键复制与 JSON 导入导出
          </p>
        </div>

        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-2 font-mono-code">
          <button
            type="button"
            onClick={() => {
              setStudyMode(studyMode === 'flip' ? 'none' : 'flip');
              setCardIndex(0);
              setShowAnswer(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              studyMode === 'flip'
                ? 'bg-[#D9A066] text-[#1C2822]'
                : 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F2F2E2] border border-[rgba(242,242,226,0.12)]'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>{studyMode === 'flip' ? 'EXIT FLIP' : '🎴 卡片翻面复习'}</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setStudyMode(studyMode === 'dictation' ? 'none' : 'dictation');
              setCardIndex(0);
              setDictationInput('');
              setDictationChecked(false);
            }}
            className={`px-3 py-1.5 rounded text-xs font-bold transition-all cursor-pointer flex items-center space-x-1.5 ${
              studyMode === 'dictation'
                ? 'bg-[#D9A066] text-[#1C2822]'
                : 'bg-[rgba(255,255,255,0.06)] hover:bg-[rgba(255,255,255,0.12)] text-[#F2F2E2] border border-[rgba(242,242,226,0.12)]'
            }`}
          >
            <FileCheck className="w-4 h-4" />
            <span>{studyMode === 'dictation' ? 'EXIT DICTATION' : '✍️ 拼写听写自测'}</span>
          </button>

          <button
            type="button"
            onClick={handleCopyAllWords}
            disabled={filteredItems.length === 0}
            className="px-3 py-1.5 rounded bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(217,160,102,0.12)] text-[#D9A066] border border-[#D9A066] text-xs font-bold transition-all flex items-center space-x-1.5 cursor-pointer disabled:opacity-40"
          >
            {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'COPIED' : '复制词表'}</span>
          </button>

          <button
            type="button"
            onClick={handleExportJSON}
            className="px-3 py-1.5 rounded border border-[rgba(242,242,226,0.15)] hover:bg-[rgba(255,255,255,0.06)] text-xs transition-all flex items-center space-x-1 cursor-pointer"
          >
            <Download className="w-4 h-4" />
            <span>导出</span>
          </button>

          <label className="px-3 py-1.5 rounded border border-[rgba(242,242,226,0.15)] hover:bg-[rgba(255,255,255,0.06)] text-xs transition-all cursor-pointer flex items-center space-x-1">
            <Upload className="w-4 h-4" />
            <span>导入</span>
            <input type="file" accept=".json" onChange={handleImportJSON} className="hidden" />
          </label>

          <button
            type="button"
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 rounded bg-[#D9A066] hover:bg-[#e2b07d] text-[#1C2822] font-bold text-xs transition-all flex items-center space-x-1 shadow-md cursor-pointer uppercase"
          >
            <Plus className="w-4 h-4" />
            <span>新建生词</span>
          </button>
        </div>
      </div>

      {/* Study Mode Component: Flip Cards or Dictation */}
      {studyMode !== 'none' && filteredItems.length > 0 && (
        <div className="bg-[#0F304F] dark:bg-[#121316] text-white rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-xl relative overflow-hidden">
          <div className="flex items-center justify-between text-xs text-slate-300 dark:text-[#7CA3C4]">
            <span>
              {studyMode === 'flip' ? '卡片复习' : '听写测验'}：{cardIndex + 1} / {filteredItems.length}
            </span>
            <span className="px-2.5 py-0.5 rounded-full bg-[#94A02F]/20 text-[#94A02F] dark:bg-[#A8B832]/20 dark:text-[#A8B832] font-mono font-bold">
              DELE {filteredItems[cardIndex]?.level}
            </span>
          </div>

          {studyMode === 'flip' ? (
            <div className="py-6 space-y-4">
              <div className="flex items-center justify-center space-x-3">
                <h3 className="text-3xl font-black text-[#94A02F] dark:text-[#A8B832] font-serif tracking-wide">
                  {filteredItems[cardIndex]?.spanish}
                </h3>
                <button
                  type="button"
                  onClick={() => handlePlayAudio(filteredItems[cardIndex]?.spanish || '')}
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-[#94A02F]"
                >
                  <Volume2 className="w-5 h-5" />
                </button>
              </div>

              {showAnswer ? (
                <div className="p-4 rounded-2xl bg-slate-800/90 text-amber-100 space-y-2 animate-in fade-in max-w-md mx-auto border border-slate-700">
                  <p className="text-base font-bold text-white">
                    {filteredItems[cardIndex]?.chinese}
                  </p>
                  {filteredItems[cardIndex]?.exampleSentence && (
                    <p className="text-xs text-slate-300 font-serif italic">
                      "{filteredItems[cardIndex]?.exampleSentence}"
                    </p>
                  )}
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowAnswer(true)}
                  className="px-6 py-2.5 rounded-2xl bg-[#94A02F] hover:bg-[#838e28] text-slate-950 text-xs font-bold transition-all shadow-md"
                >
                  点击翻面查看中文释义
                </button>
              )}
            </div>
          ) : (
            <div className="py-6 space-y-4 max-w-md mx-auto">
              <div className="space-y-1">
                <p className="text-xs text-slate-400">请根据中文释义写出对应的西班牙语单词：</p>
                <h3 className="text-xl font-bold text-white font-sans">
                  {filteredItems[cardIndex]?.chinese}
                </h3>
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={dictationInput}
                  onChange={(e) => {
                    setDictationInput(e.target.value);
                    setDictationChecked(false);
                  }}
                  placeholder="在此输入西班牙语拼写..."
                  className="flex-1 px-4 py-2.5 rounded-2xl bg-slate-800 border border-slate-700 text-white text-sm outline-none focus:border-[#94A02F]"
                />
                <button
                  type="button"
                  onClick={() => setDictationChecked(true)}
                  className="px-4 py-2.5 rounded-2xl bg-[#94A02F] text-slate-950 font-bold text-xs"
                >
                  核对
                </button>
              </div>

              {dictationChecked && (
                <div className="p-3 rounded-2xl bg-slate-800/90 border border-slate-700 text-xs space-y-1 animate-in fade-in">
                  {dictationInput.trim().toLowerCase() === filteredItems[cardIndex]?.spanish.trim().toLowerCase() ? (
                    <p className="text-emerald-400 font-bold flex items-center justify-center space-x-1">
                      <Check className="w-4 h-4" />
                      <span>拼写完全正确！</span>
                    </p>
                  ) : (
                    <p className="text-rose-400 font-bold">
                      标准拼写：<span className="text-amber-300 font-serif">{filteredItems[cardIndex]?.spanish}</span>
                    </p>
                  )}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-center space-x-4 pt-4 border-t border-slate-800">
            <button
              type="button"
              onClick={() => {
                setShowAnswer(false);
                setDictationChecked(false);
                setDictationInput('');
                setCardIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
              }}
              className="px-4 py-2 rounded-2xl bg-slate-800 hover:bg-slate-700 text-xs font-bold transition-colors"
            >
              ← 上一个词
            </button>

            <button
              type="button"
              onClick={() => {
                setShowAnswer(false);
                setDictationChecked(false);
                setDictationInput('');
                setCardIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
              }}
              className="px-5 py-2 rounded-2xl bg-[#94A02F] hover:bg-[#838e28] text-slate-950 text-xs font-black transition-colors"
            >
              下一个词 →
            </button>
          </div>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="搜索西班牙语单词或中文释义..."
            className="w-full pl-10 pr-4 py-2.5 text-xs rounded-2xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] focus:border-[#94A02F] outline-none transition-colors"
          />
        </div>

        {/* Level Filters */}
        <div className="flex items-center space-x-1 text-xs font-medium overflow-x-auto pb-1">
          {['all', 'A1', 'A2', 'B1', 'B2', 'C1', 'C2', 'General'].map((lvl) => (
            <button
              key={lvl}
              type="button"
              onClick={() => setSelectedLevelFilter(lvl)}
              className={`px-3 py-1.5 rounded-xl transition-all ${
                selectedLevelFilter === lvl
                  ? 'bg-[#0F304F] dark:bg-zinc-800 text-[#94A02F] dark:text-[#A8B832] font-bold'
                  : 'bg-slate-100 dark:bg-zinc-800/60 text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-200'
              }`}
            >
              {lvl === 'all' ? '全部等级' : lvl}
            </button>
          ))}
        </div>
      </div>

      {/* Vocabulary List Bento Grid */}
      {filteredItems.length === 0 ? (
        <div className="py-12 text-center text-slate-400 space-y-2">
          <BookmarkCheck className="w-10 h-10 mx-auto text-slate-300 dark:text-zinc-700" />
          <p className="text-xs font-medium">生词本为空或未搜索到匹配项</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="p-5 rounded-3xl border border-slate-200/80 dark:border-zinc-800 bg-slate-50/50 dark:bg-[#242529]/60 hover:border-[#94A02F]/50 transition-all space-y-3 text-xs relative shadow-2xs flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-base text-[#0F304F] dark:text-[#E2E0D8] font-serif">{item.spanish}</span>
                    <button
                      type="button"
                      onClick={() => handlePlayAudio(item.spanish)}
                      className="text-slate-400 hover:text-[#94A02F]"
                    >
                      <Volume2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center space-x-1">
                    <span className="px-2.5 py-0.5 rounded-full bg-[#94A02F]/15 dark:bg-[#A8B832]/20 text-[#94A02F] dark:text-[#A8B832] text-[10px] font-mono font-bold">
                      {item.level}
                    </span>
                    <button
                      type="button"
                      onClick={() => onDeleteWord(item.id)}
                      className="text-slate-300 hover:text-red-500 p-1 transition-colors"
                      title="删除此单词"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-slate-800 dark:text-[#E2E0D8] font-medium leading-relaxed">{item.chinese}</p>

                {item.exampleSentence && (
                  <p className="text-slate-500 dark:text-[#7CA3C4] font-serif italic text-[11px] mt-1.5 line-clamp-2">
                    "{item.exampleSentence}"
                  </p>
                )}
              </div>

              <div className="text-[10px] text-slate-400 dark:text-zinc-500 pt-2 border-t border-slate-200/60 dark:border-zinc-800 flex items-center justify-between">
                <span>来源: {item.sourceArticleTitle || '手动记录'}</span>
                <span>{new Date(item.addedAt).toLocaleDateString()}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Word Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 dark:bg-black/75 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#1A1B1F] text-[#0F304F] dark:text-[#E2E0D8] rounded-3xl p-6 sm:p-8 max-w-md w-full space-y-4 border border-slate-200 dark:border-zinc-800 shadow-2xl">
            <h3 className="text-base font-bold">新建自定义西班牙语生词</h3>
            <form onSubmit={handleCreateNewWord} className="space-y-3 text-xs">
              <div>
                <label className="font-bold block mb-1">西班牙语 (Español)</label>
                <input
                  type="text"
                  required
                  value={newSpanish}
                  onChange={(e) => setNewSpanish(e.target.value)}
                  placeholder="例如: desarrollo sostenible"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] outline-none"
                />
              </div>

              <div>
                <label className="font-bold block mb-1">中文释义</label>
                <input
                  type="text"
                  required
                  value={newChinese}
                  onChange={(e) => setNewChinese(e.target.value)}
                  placeholder="例如: 可持续发展"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="font-bold block mb-1">DELE 等级</label>
                  <select
                    value={newLevel}
                    onChange={(e) => setNewLevel(e.target.value as DELELevel)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] outline-none"
                  >
                    {['A1', 'A2', 'B1', 'B2', 'C1', 'C2'].map((l) => (
                      <option key={l} value={l}>
                        DELE {l}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-bold block mb-1">词性</label>
                  <input
                    type="text"
                    value={newPOS}
                    onChange={(e) => setNewPOS(e.target.value)}
                    placeholder="如 sustantivo, verbo"
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold block mb-1">包含该词的例句</label>
                <textarea
                  rows={2}
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="可选填包含该词的西班牙语句子"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-[#242529] outline-none"
                />
              </div>

              <div className="flex justify-end space-x-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-zinc-700 hover:bg-slate-100 dark:hover:bg-zinc-800 font-semibold"
                >
                  取消
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#94A02F] dark:bg-[#A8B832] text-slate-950 font-bold"
                >
                  确认保存
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
