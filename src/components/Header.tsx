import React from 'react';
import { BookOpen, Sparkles, Award, FileText, BookmarkCheck, Sun, Moon } from 'lucide-react';
import { DELELevel } from '../types';

interface HeaderProps {
  activeTab: 'create' | 'practice' | 'notebook' | 'history';
  setActiveTab: (tab: 'create' | 'practice' | 'notebook' | 'history') => void;
  selectedLevel: DELELevel;
  notebookCount: number;
  hasArticle: boolean;
  onOpenGuide: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  selectedLevel,
  notebookCount,
  hasArticle,
  onOpenGuide,
  isDarkMode,
  onToggleDarkMode,
}) => {
  return (
    <header className="bg-white/95 dark:bg-[#121316]/95 border-b border-slate-200/80 dark:border-zinc-800 text-slate-800 dark:text-white sticky top-0 z-30 backdrop-blur-md transition-colors duration-300 shadow-2xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / App Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setActiveTab('create')}>
            <div className="w-10 h-10 rounded-2xl bg-[#94A02F] dark:bg-[#A8B832] flex items-center justify-center text-slate-950 font-bold shadow-md shadow-[#94A02F]/20">
              <Sparkles className="w-5 h-5 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h1 className="text-base sm:text-lg font-black tracking-tight text-[#0F304F] dark:text-[#E2E0D8]">
                  DELE 西班牙语备考助手
                </h1>
                <span className="px-2 py-0.5 text-xs font-bold rounded-full bg-[#94A02F]/15 text-[#94A02F] dark:bg-[#A8B832]/20 dark:text-[#A8B832] border border-[#94A02F]/30 dark:border-[#A8B832]/30">
                  DELE {selectedLevel}
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-[#7CA3C4] hidden sm:block">
                AI 逻辑编织备考词汇 · 对标 A1-C2 官方评分标准 · 互动填空自测与生词本
              </p>
            </div>
          </div>

          {/* Navigation Tabs & Theme Toggle */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <button
              id="tab-btn-create"
              onClick={() => setActiveTab('create')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'create'
                  ? 'bg-[#94A02F] dark:bg-[#A8B832] text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>作文组文</span>
            </button>

            <button
              id="tab-btn-practice"
              disabled={!hasArticle}
              onClick={() => setActiveTab('practice')}
              title={!hasArticle ? '请先生成一篇文章' : '进入填空自测模式'}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                !hasArticle
                  ? 'opacity-40 cursor-not-allowed text-slate-400 dark:text-zinc-600'
                  : activeTab === 'practice'
                  ? 'bg-[#94A02F] dark:bg-[#A8B832] text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <FileText className="w-4 h-4" />
              <span>填空自测</span>
              {hasArticle && (
                <span className="w-2 h-2 rounded-full bg-[#94A02F] dark:bg-[#A8B832] animate-pulse hidden sm:inline-block"></span>
              )}
            </button>

            <button
              id="tab-btn-notebook"
              onClick={() => setActiveTab('notebook')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all relative ${
                activeTab === 'notebook'
                  ? 'bg-[#94A02F] dark:bg-[#A8B832] text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BookmarkCheck className="w-4 h-4" />
              <span>生词本</span>
              {notebookCount > 0 && (
                <span className="px-1.5 py-0.2 text-[10px] font-extrabold rounded-full bg-red-500 text-white">
                  {notebookCount}
                </span>
              )}
            </button>

            <button
              id="tab-btn-history"
              onClick={() => setActiveTab('history')}
              className={`flex items-center space-x-1.5 px-3 py-2 rounded-2xl text-xs sm:text-sm font-bold transition-all ${
                activeTab === 'history'
                  ? 'bg-[#94A02F] dark:bg-[#A8B832] text-slate-950 shadow-xs'
                  : 'text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-100 dark:hover:bg-zinc-800'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span className="hidden md:inline">历史范文</span>
            </button>

            <div className="h-5 w-px bg-slate-200 dark:bg-zinc-800 mx-1 hidden sm:block"></div>

            <button
              id="btn-dele-guide"
              onClick={onOpenGuide}
              className="flex items-center space-x-1 px-2.5 py-2 rounded-2xl text-xs font-bold text-[#94A02F] dark:text-[#A8B832] hover:bg-[#94A02F]/10 transition-colors"
            >
              <Award className="w-4 h-4" />
              <span className="hidden lg:inline">DELE指南</span>
            </button>

            {/* Dark Mode Toggle Switch */}
            <button
              id="btn-toggle-theme"
              type="button"
              onClick={onToggleDarkMode}
              title={isDarkMode ? '切换至亮色模式' : '切换至暗黑模式'}
              className="p-2 rounded-2xl text-slate-600 dark:text-[#E2E0D8] hover:bg-slate-100 dark:hover:bg-zinc-800 border border-slate-200 dark:border-zinc-800 transition-all ml-1"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-300" />
              ) : (
                <Moon className="w-4 h-4 text-[#0F304F]" />
              )}
            </button>
          </nav>
        </div>
      </div>
    </header>
  );
};

