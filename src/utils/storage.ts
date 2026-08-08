import { VocabularyNotebookItem, DELEArticleResult, DELELevel } from '../types';

const NOTEBOOK_STORAGE_KEY = 'dele_assistant_vocabulary_notebook_v1';
const HISTORY_STORAGE_KEY = 'dele_assistant_article_history_v1';

// Initial default vocabulary if notebook is empty
const DEFAULT_INITIAL_WORDS: Omit<VocabularyNotebookItem, 'id' | 'addedAt'>[] = [
  {
    spanish: 'sin embargo',
    chinese: '然而，不过',
    level: 'B1',
    partOfSpeech: 'locución conjuntiva',
    exampleSentence: 'El proyecto es difícil; sin embargo, saldrá adelante.',
    sourceArticleTitle: 'DELE 官方必备逻辑连接词'
  },
  {
    spanish: 'en consecuencia',
    chinese: '因此，结果是',
    level: 'B2',
    partOfSpeech: 'locución adverbial',
    exampleSentence: 'No estudió lo suficiente y, en consecuencia, suspendió el examen.',
    sourceArticleTitle: 'DELE 官方必备逻辑连接词'
  },
  {
    spanish: 'sostenibilidad',
    chinese: '可持续性',
    level: 'B2',
    partOfSpeech: 'sustantivo femenino',
    exampleSentence: 'Debemos fomentar la sostenibilidad medioambiental.',
    sourceArticleTitle: 'DELE 备考核心词'
  }
];

export function getVocabularyNotebook(): VocabularyNotebookItem[] {
  try {
    const raw = localStorage.getItem(NOTEBOOK_STORAGE_KEY);
    if (!raw) {
      const initial = DEFAULT_INITIAL_WORDS.map((w, idx) => ({
        ...w,
        id: `word_init_${idx}_${Date.now()}`,
        addedAt: new Date().toISOString(),
      }));
      localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error loading vocabulary notebook:', e);
    return [];
  }
}

export function saveVocabularyNotebook(items: VocabularyNotebookItem[]): void {
  try {
    localStorage.setItem(NOTEBOOK_STORAGE_KEY, JSON.stringify(items));
  } catch (e) {
    console.error('Error saving vocabulary notebook:', e);
  }
}

export function addWordToNotebook(
  word: {
    spanish: string;
    chinese: string;
    level?: DELELevel | 'General';
    partOfSpeech?: string;
    exampleSentence?: string;
    sourceArticleTitle?: string;
  }
): { added: boolean; item?: VocabularyNotebookItem } {
  const current = getVocabularyNotebook();
  const exists = current.some(
    (item) => item.spanish.trim().toLowerCase() === word.spanish.trim().toLowerCase()
  );

  if (exists) {
    return { added: false };
  }

  const newItem: VocabularyNotebookItem = {
    id: 'word_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    spanish: word.spanish.trim(),
    chinese: word.chinese.trim(),
    level: word.level || 'General',
    partOfSpeech: word.partOfSpeech || '',
    exampleSentence: word.exampleSentence || '',
    sourceArticleTitle: word.sourceArticleTitle || '直接录入',
    addedAt: new Date().toISOString(),
  };

  const updated = [newItem, ...current];
  saveVocabularyNotebook(updated);
  return { added: true, item: newItem };
}

export function batchAddWordsToNotebook(
  words: {
    spanish: string;
    chinese: string;
    level?: DELELevel | 'General';
    partOfSpeech?: string;
    exampleSentence?: string;
    sourceArticleTitle?: string;
  }[]
): { addedCount: number; newItems: VocabularyNotebookItem[] } {
  const current = getVocabularyNotebook();
  const existingSet = new Set(current.map((i) => i.spanish.trim().toLowerCase()));

  const newItems: VocabularyNotebookItem[] = [];
  words.forEach((word) => {
    const key = word.spanish.trim().toLowerCase();
    if (key && !existingSet.has(key)) {
      existingSet.add(key);
      newItems.push({
        id: 'word_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        spanish: word.spanish.trim(),
        chinese: word.chinese.trim(),
        level: word.level || 'General',
        partOfSpeech: word.partOfSpeech || '',
        exampleSentence: word.exampleSentence || '',
        sourceArticleTitle: word.sourceArticleTitle || '批量收录',
        addedAt: new Date().toISOString(),
      });
    }
  });

  if (newItems.length > 0) {
    saveVocabularyNotebook([...newItems, ...current]);
  }

  return { addedCount: newItems.length, newItems };
}

export function deleteWordFromNotebook(id: string): void {
  const current = getVocabularyNotebook();
  const updated = current.filter((item) => item.id !== id);
  saveVocabularyNotebook(updated);
}

export function getArticleHistory(): DELEArticleResult[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    console.error('Error loading article history:', e);
    return [];
  }
}

export function saveArticleToHistory(article: DELEArticleResult): void {
  try {
    const current = getArticleHistory();
    const updated = [article, ...current.filter((a) => a.id !== article.id)].slice(0, 20);
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.error('Error saving article history:', e);
  }
}
