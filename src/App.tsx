import React, { useState, useEffect } from 'react';
import { Sparkles, Loader2, Award, History, ArrowRight, AlertCircle, BookOpen } from 'lucide-react';
import { Header } from './components/Header';
import { VocabularyInput } from './components/VocabularyInput';
import { LevelSelector } from './components/LevelSelector';
import { ArticleView } from './components/ArticleView';
import { ClozePracticeMode } from './components/ClozePracticeMode';
import { ClozeSummaryModal } from './components/ClozeSummaryModal';
import { AnalysisView } from './components/AnalysisView';
import { VocabularyNotebook } from './components/VocabularyNotebook';
import { DELEGuideModal } from './components/DELEGuideModal';
import { NewWordsPopupModal } from './components/NewWordsPopupModal';
import { WordDetailModal } from './components/WordDetailModal';

import {
  DELELevel,
  ArticleStyle,
  DELETopicKey,
  VocabularyInputItem,
  DELEArticleResult,
  TargetWordUsage,
  VocabularyNotebookItem,
  ClozeItem,
} from './types';

import {
  getVocabularyNotebook,
  addWordToNotebook,
  batchAddWordsToNotebook,
  deleteWordFromNotebook,
  saveVocabularyNotebook,
  getArticleHistory,
  saveArticleToHistory,
} from './utils/storage';

interface PracticeResult {
  clozeItem: ClozeItem;
  userInput: string;
  isCorrect: boolean;
  isAccentErrorOnly: boolean;
}

export default function App() {
  const [activeTab, setActiveTab] = useState<'create' | 'practice' | 'notebook' | 'history'>('create');
  const [selectedLevel, setSelectedLevel] = useState<DELELevel>('B2');
  const [style, setStyle] = useState<ArticleStyle>('formal');
  const [topicKey, setTopicKey] = useState<DELETopicKey>('auto');
  const [customPrompt, setCustomPrompt] = useState('');

  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    return localStorage.getItem('dele_theme') === 'dark';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('dele_theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('dele_theme', 'light');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => setIsDarkMode((prev) => !prev);

  // Vocabulary Inputs State
  const [words, setWords] = useState<VocabularyInputItem[]>([
    { id: 'w1', word: 'sostenibilidad', isCore: true },
    { id: 'w2', word: 'fomentar', isCore: true },
    { id: 'w3', word: 'desafío', isCore: false },
    { id: 'w4', word: 'en consecuencia', isCore: true },
    { id: 'w5', word: 'sin embargo', isCore: false },
  ]);

  // Article Generation & Result State
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [currentArticle, setCurrentArticle] = useState<DELEArticleResult | null>(null);

  // History & Notebook Persistence
  const [articleHistory, setArticleHistory] = useState<DELEArticleResult[]>([]);
  const [notebookItems, setNotebookItems] = useState<VocabularyNotebookItem[]>([]);

  // Modals State
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showClozeSummaryModal, setShowClozeSummaryModal] = useState(false);
  const [practiceResults, setPracticeResults] = useState<PracticeResult[]>([]);

  const [showNewWordsModal, setShowNewWordsModal] = useState(false);
  const [newWordsForModal, setNewWordsForModal] = useState<TargetWordUsage[]>([]);

  // Word Analysis Modal State
  const [selectedModalWord, setSelectedModalWord] = useState<TargetWordUsage | null>(null);
  const [isWordModalOpen, setIsWordModalOpen] = useState(false);

  // Load history and notebook on mount
  useEffect(() => {
    setNotebookItems(getVocabularyNotebook());
    setArticleHistory(getArticleHistory());
  }, []);

  // Handler: Generate DELE Article
  const handleGenerateArticle = async () => {
    if (words.length === 0) {
      setErrorMessage('请至少输入或选择 1 个备考词汇或短语。');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    const coreWords = words.filter((w) => w.isCore).map((w) => w.word);

    try {
      const res = await fetch('/api/generate-article', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          words: words.map((w) => w.word),
          deleLevel: selectedLevel,
          style,
          topicKey,
          customPrompt,
          coreWordList: coreWords,
        }),
      });

      const data = await res.json();

      if (!res.ok || data.error) {
        throw new Error(data.error || '无法生成文章，请检查服务端连接或 API 密钥。');
      }

      const result = data as DELEArticleResult;
      setCurrentArticle(result);
      saveArticleToHistory(result);
      setArticleHistory(getArticleHistory());
      setActiveTab('create');

      // Scroll smoothly to article view
      window.scrollTo({ top: 400, behavior: 'smooth' });
    } catch (err: any) {
      console.error('Error generating article:', err);
      setErrorMessage(err?.message || '生成文章时失败，请重试。');
    } finally {
      setLoading(false);
    }
  };

  // Handler: Open Word Detail Modal
  const handleOpenWordModal = (word: TargetWordUsage) => {
    setSelectedModalWord(word);
    setIsWordModalOpen(true);
  };

  // Handler: Add Target Words to Notebook & Trigger Popup Modal
  const handleSaveWordsToNotebook = (targetWords: TargetWordUsage[]) => {
    if (!targetWords || targetWords.length === 0) return;

    const formattedList = targetWords.map((w) => ({
      spanish: w.formInArticle || w.original,
      chinese: `${w.chineseMeaning} (原词: ${w.original})`,
      level: selectedLevel,
      partOfSpeech: w.partOfSpeech,
      exampleSentence: w.contextSentence,
      sourceArticleTitle: currentArticle?.titleSpanish || 'DELE 范文',
    }));

    batchAddWordsToNotebook(formattedList);
    setNotebookItems(getVocabularyNotebook());

    // Show pop-up modal summary of newly collected words
    setNewWordsForModal(targetWords);
    setShowNewWordsModal(true);
  };

  // Handler: Single word add to notebook
  const handleSingleAddNotebook = (word: {
    spanish: string;
    chinese: string;
    level?: DELELevel | 'General';
    partOfSpeech?: string;
    exampleSentence?: string;
  }) => {
    addWordToNotebook({
      ...word,
      sourceArticleTitle: currentArticle?.titleSpanish || '手动添加',
    });
    setNotebookItems(getVocabularyNotebook());
  };

  const handleDeleteNotebookWord = (id: string) => {
    deleteWordFromNotebook(id);
    setNotebookItems(getVocabularyNotebook());
  };

  const handleImportNotebookItems = (items: VocabularyNotebookItem[]) => {
    saveVocabularyNotebook(items);
    setNotebookItems(items);
  };

  // Practice Submission Finish: Auto-collect ONLY incorrect words to vocabulary notebook
  const handleFinishPractice = (results: PracticeResult[]) => {
    setPracticeResults(results);

    const wrongResults = results.filter((r) => !r.isCorrect);
    if (wrongResults.length > 0) {
      const wrongItems = wrongResults.map((r) => ({
        spanish: r.clozeItem.targetAnswer,
        chinese: `${r.clozeItem.hint} (原词: ${r.clozeItem.originalWord})`,
        level: selectedLevel,
        exampleSentence: r.clozeItem.sentenceContextSpanish || '',
        sourceArticleTitle: currentArticle?.titleSpanish || '填空自测错题',
      }));

      batchAddWordsToNotebook(wrongItems);
      setNotebookItems(getVocabularyNotebook());
    }

    setShowClozeSummaryModal(true);
  };

  return (
    <div className="min-h-screen bg-[#1C2822] text-[#F2F2E2] flex flex-col font-sans transition-colors duration-300 selection:bg-[#D9A066] selection:text-[#1C2822]">
      {/* Shell Grid Layout */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[80px_300px_1fr] min-h-screen">
        {/* LEFT RAIL: Navigation Icons */}
        <aside className="bg-[#141D19] border-r border-[rgba(242,242,226,0.12)] flex lg:flex-col items-center justify-between lg:justify-start p-3 lg:py-6 gap-3 lg:gap-6 z-20 sticky top-0 h-auto lg:h-screen">
          <div className="flex lg:flex-col items-center gap-3 lg:gap-6 w-full justify-center">
            {/* Logo / Brand Icon */}
            <div
              onClick={() => setActiveTab('create')}
              className="w-11 h-11 rounded-xl bg-[#D9A066] text-[#1C2822] flex items-center justify-center font-display font-bold text-lg shadow-lg cursor-pointer hover:scale-105 transition-transform"
              title="DELE MASTER"
            >
              ✍️
            </div>

            <div className="w-8 h-px bg-[rgba(242,242,226,0.12)] hidden lg:block my-1"></div>

            {/* Nav Icon 1: Create / Composition */}
            <button
              id="tab-btn-create"
              onClick={() => setActiveTab('create')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                activeTab === 'create'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold shadow-md'
                  : 'bg-[#2D4034] text-[#C5BC8E] hover:text-[#F2F2E2] hover:bg-[#344a3c]'
              }`}
              title="作文组文 (Composer)"
            >
              ✍️
            </button>

            {/* Nav Icon 2: Cloze Practice */}
            <button
              id="tab-btn-practice"
              disabled={!currentArticle}
              onClick={() => setActiveTab('practice')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all relative ${
                !currentArticle
                  ? 'opacity-40 cursor-not-allowed bg-[#2D4034] text-[#C5BC8E]'
                  : activeTab === 'practice'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold shadow-md cursor-pointer'
                  : 'bg-[#2D4034] text-[#C5BC8E] hover:text-[#F2F2E2] hover:bg-[#344a3c] cursor-pointer'
              }`}
              title={!currentArticle ? '请先生成文章' : '填空自测 (Practice)'}
            >
              📖
              {currentArticle && (
                <span className="absolute top-1 right-1 w-2.5 h-2.5 rounded-full bg-[#D9A066] animate-pulse"></span>
              )}
            </button>

            {/* Nav Icon 3: Vocabulary Notebook */}
            <button
              id="tab-btn-notebook"
              onClick={() => setActiveTab('notebook')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all relative cursor-pointer ${
                activeTab === 'notebook'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold shadow-md'
                  : 'bg-[#2D4034] text-[#C5BC8E] hover:text-[#F2F2E2] hover:bg-[#344a3c]'
              }`}
              title="专属生词本 (Notebook)"
            >
              🔖
              {notebookItems.length > 0 && (
                <span className="absolute -top-1 -right-1 font-mono-code text-[10px] font-bold px-1.5 py-0.2 rounded-full bg-rose-500 text-white">
                  {notebookItems.length}
                </span>
              )}
            </button>

            {/* Nav Icon 4: History */}
            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('history')}
              className={`w-11 h-11 rounded-xl flex items-center justify-center text-lg transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#D9A066] text-[#1C2822] font-bold shadow-md'
                  : 'bg-[#2D4034] text-[#C5BC8E] hover:text-[#F2F2E2] hover:bg-[#344a3c]'
              }`}
              title="历史范文 (History)"
            >
              📊
            </button>
          </div>

          {/* Bottom Controls in Side Rail */}
          <div className="flex lg:flex-col items-center gap-3 lg:mt-auto">
            {/* DELE Guide Modal Trigger */}
            <button
              id="btn-dele-guide"
              onClick={() => setShowGuideModal(true)}
              className="w-11 h-11 rounded-xl bg-[#2D4034] text-[#C5BC8E] hover:text-[#D9A066] hover:bg-[#344a3c] flex items-center justify-center text-lg transition-all cursor-pointer"
              title="DELE考官评分指南"
            >
              🏆
            </button>

            {/* Theme Toggle */}
            <button
              id="btn-toggle-theme"
              onClick={toggleDarkMode}
              className="w-11 h-11 rounded-xl bg-[#2D4034] text-[#C5BC8E] hover:text-[#F2F2E2] hover:bg-[#344a3c] flex items-center justify-center text-lg transition-all cursor-pointer"
              title={isDarkMode ? '切换至亮色' : '切换至暗黑'}
            >
              ⚙️
            </button>
          </div>
        </aside>

        {/* MIDDLE PANEL: Config & Quick Parameters */}
        <div className="bg-[#1C2822] border-r border-[rgba(242,242,226,0.12)] p-6 overflow-y-auto hidden lg:block">
          {/* Main Title */}
          <div className="mb-6">
            <h1 className="font-display text-2xl text-[#D9A066] leading-none uppercase tracking-wider">
              DELE MASTER<br />{selectedLevel}
            </h1>
            <p className="text-xs text-[#C5BC8E] opacity-80 mt-2 font-mono-code">
              AI 智能编织备考范文生成器
            </p>
          </div>

          {/* Section: Configuración */}
          <div className="space-y-4 mb-8">
            <span className="font-mono-code text-[11px] text-[#C5BC8E] uppercase tracking-wider block">
              Configuración / 目标等级
            </span>
            <div className="flex flex-col gap-2">
              <button
                onClick={() => setSelectedLevel('A1')}
                className={`w-full p-2.5 text-left text-xs font-mono-code rounded border transition-all cursor-pointer ${
                  selectedLevel === 'A1' || selectedLevel === 'A2'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.1)]'
                    : 'border-[rgba(242,242,226,0.12)] text-[#F2F2E2] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                DELE A1-A2 (初级基础)
              </button>
              <button
                onClick={() => setSelectedLevel('B1')}
                className={`w-full p-2.5 text-left text-xs font-mono-code rounded border transition-all cursor-pointer ${
                  selectedLevel === 'B1'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.1)] font-bold'
                    : 'border-[rgba(242,242,226,0.12)] text-[#F2F2E2] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                DELE B1 (中级独立)
              </button>
              <button
                onClick={() => setSelectedLevel('B2')}
                className={`w-full p-2.5 text-left text-xs font-mono-code rounded border transition-all cursor-pointer ${
                  selectedLevel === 'B2'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.12)] font-bold'
                    : 'border-[rgba(242,242,226,0.12)] text-[#F2F2E2] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                DELE B2 (CURRENT OFFICIAL)
              </button>
              <button
                onClick={() => setSelectedLevel('C1')}
                className={`w-full p-2.5 text-left text-xs font-mono-code rounded border transition-all cursor-pointer ${
                  selectedLevel === 'C1' || selectedLevel === 'C2'
                    ? 'border-[#D9A066] text-[#D9A066] bg-[rgba(217,160,102,0.1)] font-bold'
                    : 'border-[rgba(242,242,226,0.12)] text-[#F2F2E2] hover:bg-[rgba(255,255,255,0.05)]'
                }`}
              >
                DELE C1-C2 (高级精通)
              </button>
            </div>
          </div>

          {/* Section: System Info */}
          <div className="pt-6 border-t border-[rgba(242,242,226,0.12)] space-y-2">
            <span className="font-mono-code text-[11px] text-[#C5BC8E] uppercase tracking-wider block">
              System Info
            </span>
            <div className="font-mono-code text-[11px] text-[#F2F2E2] opacity-75 space-y-1.5 bg-[#2D4034] p-3 rounded border border-[rgba(242,242,226,0.08)]">
              <div>Mode: Official Exam Standard</div>
              <div>Word Target: 220-290 words</div>
              <div>Vocab Loaded: {words.length} items</div>
              <div>Status: Ready to Weave</div>
            </div>
          </div>
        </div>

        {/* WORKSPACE AREA */}
        <main className="p-4 sm:p-6 lg:p-8 overflow-y-auto relative flex flex-col justify-between">
          <div className="space-y-6">
            {/* Error Alert */}
            {errorMessage && (
              <div className="p-4 rounded-lg bg-rose-950/80 border border-rose-700 text-xs sm:text-sm text-rose-200 flex items-start space-x-3">
                <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                <div className="flex-1">
                  <span className="font-bold">生成提示：</span>
                  <p className="mt-0.5">{errorMessage}</p>
                </div>
                <button
                  onClick={() => setErrorMessage(null)}
                  className="text-rose-400 hover:text-white font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* TAB 1: CREATE / COMPOSITION */}
            {activeTab === 'create' && (
              <div className="space-y-6">
                {/* Masonry / Grid for Inputs */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Vocabulary Cards */}
                  <div>
                    <VocabularyInput
                      words={words}
                      setWords={setWords}
                      selectedLevel={selectedLevel}
                      onSelectLevel={setSelectedLevel}
                    />
                  </div>

                  {/* Level & Requisitos Cards */}
                  <div>
                    <LevelSelector
                      selectedLevel={selectedLevel}
                      onSelectLevel={setSelectedLevel}
                      style={style}
                      setStyle={setStyle}
                      topicKey={topicKey}
                      setTopicKey={setTopicKey}
                      customPrompt={customPrompt}
                      setCustomPrompt={setCustomPrompt}
                    />
                  </div>
                </div>

                {/* Main Floating / Highlighted Action Button */}
                <div className="pt-4 flex justify-center sticky bottom-6 z-20">
                  <button
                    id="btn-generate-article-main"
                    type="button"
                    onClick={handleGenerateArticle}
                    disabled={loading || words.length === 0}
                    className="w-full sm:w-auto px-8 sm:px-12 py-4 bg-[#D9A066] hover:bg-[#e2b07d] text-[#1C2822] font-display text-lg tracking-wider font-bold uppercase rounded border-none shadow-2xl hover:scale-102 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-3"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin text-[#1C2822]" />
                        <span>WEAVING DELE {selectedLevel} ARTICLE...</span>
                      </>
                    ) : (
                      <>
                        <span>Generate DELE {selectedLevel} Weave ➔</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Article Display & Analysis */}
                {currentArticle && (
                  <div className="space-y-8 mt-8 pt-8 border-t border-[rgba(242,242,226,0.12)]">
                    <ArticleView
                      article={currentArticle}
                      onStartPractice={() => setActiveTab('practice')}
                      onSaveNewWordsToNotebook={handleSaveWordsToNotebook}
                      onWordClick={handleOpenWordModal}
                    />

                    <AnalysisView
                      article={currentArticle}
                      onAddWordToNotebook={handleSingleAddNotebook}
                    />
                  </div>
                )}
              </div>
            )}

            {/* TAB 2: CLOZE PRACTICE MODE */}
            {activeTab === 'practice' && currentArticle && (
              <ClozePracticeMode
                article={currentArticle}
                onFinishPractice={handleFinishPractice}
                onExitPractice={() => setActiveTab('create')}
                onWordClick={handleOpenWordModal}
              />
            )}

            {/* TAB 3: VOCABULARY NOTEBOOK */}
            {activeTab === 'notebook' && (
              <VocabularyNotebook
                notebookItems={notebookItems}
                onAddWord={handleSingleAddNotebook}
                onDeleteWord={handleDeleteNotebookWord}
                onImportItems={handleImportNotebookItems}
              />
            )}

            {/* TAB 4: HISTORY ARTICLES */}
            {activeTab === 'history' && (
              <div className="card-pine p-6 sm:p-8 space-y-6">
                <div className="flex items-center justify-between border-b border-[rgba(242,242,226,0.12)] pb-4">
                  <div>
                    <h2 className="font-display text-lg text-[#F2F2E2] flex items-center space-x-2">
                      <History className="w-5 h-5 text-[#D9A066]" />
                      <span>DELE HISTORIAL DE ENSAYOS ({articleHistory.length})</span>
                    </h2>
                    <p className="text-xs text-[#C5BC8E] mt-1 font-mono-code">
                      点击重新载入历史备考范文与互动测试
                    </p>
                  </div>
                </div>

                {articleHistory.length === 0 ? (
                  <div className="py-12 text-center text-[#C5BC8E] opacity-60 font-mono-code text-xs space-y-2">
                    <BookOpen className="w-10 h-10 mx-auto opacity-40" />
                    <p>暂无生成的历史范文</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {articleHistory.map((item) => (
                      <div
                        key={item.id}
                        onClick={() => {
                          setCurrentArticle(item);
                          setSelectedLevel(item.deleLevel);
                          setActiveTab('create');
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }}
                        className="p-4 rounded border border-[rgba(242,242,226,0.12)] hover:border-[#D9A066] bg-[rgba(0,0,0,0.2)] hover:bg-[rgba(217,160,102,0.1)] transition-all cursor-pointer space-y-3 flex flex-col justify-between group"
                      >
                        <div>
                          <div className="flex items-center justify-between">
                            <span className="badge-hazelnut">
                              DELE {item.deleLevel}
                            </span>
                            <span className="font-mono-code text-[10px] text-[#C5BC8E]">
                              {new Date(item.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <h4 className="font-display text-sm text-[#F2F2E2] mt-2 group-hover:text-[#D9A066] transition-colors">
                            {item.titleSpanish}
                          </h4>
                          <p className="text-xs text-[#C5BC8E] mt-1 font-sans">{item.titleChinese}</p>
                        </div>

                        <div className="pt-2 border-t border-[rgba(242,242,226,0.08)] flex items-center justify-between font-mono-code text-xs text-[#D9A066]">
                          <span>{item.targetWordsUsed?.length || 0} WORDS USED</span>
                          <span>LOAD ➔</span>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer */}
          <footer className="mt-12 pt-6 border-t border-[rgba(242,242,226,0.12)] text-center text-xs text-[#C5BC8E] opacity-75 font-mono-code space-y-1">
            <p>DELE MASTER · AI INTELLIGENT ESSAY WEAVER</p>
            <p>Instituto Cervantes Standards · Real-time Grammar Alignment</p>
          </footer>
        </main>
      </div>

      {/* DELE Grading Guide Modal */}
      <DELEGuideModal isOpen={showGuideModal} onClose={() => setShowGuideModal(false)} />

      {/* Cloze Practice Summary Modal */}
      {showClozeSummaryModal && currentArticle && (
        <ClozeSummaryModal
          results={practiceResults}
          deleLevel={selectedLevel}
          onClose={() => setShowClozeSummaryModal(false)}
          onRetake={() => {
            setShowClozeSummaryModal(false);
            setActiveTab('practice');
          }}
          onBatchAddToNotebook={(items) => {
            batchAddWordsToNotebook(
              items.map((i) => ({ ...i, sourceArticleTitle: currentArticle.titleSpanish }))
            );
            setNotebookItems(getVocabularyNotebook());
          }}
        />
      )}

      {/* New Words Collected Auto Popup Modal */}
      {currentArticle && (
        <NewWordsPopupModal
          isOpen={showNewWordsModal}
          onClose={() => setShowNewWordsModal(false)}
          words={newWordsForModal}
          deleLevel={selectedLevel}
          articleTitle={currentArticle.titleSpanish}
        />
      )}

      {/* Word Detail Centered Modal */}
      <WordDetailModal
        word={selectedModalWord}
        isOpen={isWordModalOpen}
        onClose={() => setIsWordModalOpen(false)}
        onAddToNotebook={(w) => {
          handleSingleAddNotebook({
            spanish: w.formInArticle || w.original,
            chinese: `${w.chineseMeaning} (原词: ${w.original})`,
            level: selectedLevel,
            partOfSpeech: w.partOfSpeech,
            exampleSentence: w.contextSentence,
          });
        }}
        isAlreadyInNotebook={
          selectedModalWord
            ? notebookItems.some(
                (n) => n.spanish.toLowerCase() === (selectedModalWord.formInArticle || selectedModalWord.original).toLowerCase()
              )
            : false
        }
      />
    </div>
  );
}
