export type DELELevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';

export type ArticleStyle = 'formal' | 'casual';

export type DELETopicKey = 
  | 'auto'
  | 'daily'
  | 'campus'
  | 'society'
  | 'work'
  | 'travel'
  | 'environment'
  | 'feelings';

export interface VocabularyInputItem {
  id: string;
  word: string;
  isCore: boolean;
  notes?: string;
}

export interface TargetWordUsage {
  original: string;
  formInArticle: string;
  partOfSpeech: string;
  level: string;
  contextSentence: string;
  chineseMeaning: string;
  usageTip: string;
  phonetic?: string;
  multiPosDefinitions?: { pos: string; meaning: string }[];
  deleCollocations?: string[];
  examExamples?: { sentenceEs: string; sentenceCn: string }[];
  confusedWords?: string;
}

export interface Paragraph {
  id: string;
  spanish: string;
  chinese: string;
}

export interface ClozeItem {
  id: string;
  paragraphIndex: number;
  originalWord: string; // The base word provided by user
  targetAnswer: string; // The exact conjugated or formatted word in article
  hint: string; // Grammar hint for fill-in-the-blank
  options?: string[]; // Multiple choice options if needed
  sentenceContextSpanish: string;
  sentenceContextChinese: string;
}

export interface GrammarBreakdown {
  spanishPattern: string;
  chineseMeaning: string;
  explanation: string;
  deleScoreHighlight: string;
}

export interface DELEScoreHighlights {
  taskFulfillment: string;
  coherenceCohesion: string;
  lexicalRichness: string;
  grammaticalAccuracy: string;
}

export interface RecommendedWord {
  spanish: string;
  chinese: string;
  level: string;
  example: string;
}

export interface DELEArticleResult {
  id: string;
  createdAt: string;
  titleSpanish: string;
  titleChinese: string;
  deleLevel: DELELevel;
  style: ArticleStyle;
  topicName: string;
  paragraphs: Paragraph[];
  targetWordsUsed: TargetWordUsage[];
  clozeItems: ClozeItem[];
  grammarBreakdowns: GrammarBreakdown[];
  deleScoreHighlights: DELEScoreHighlights;
  pitfallsAndTips: string[];
  recommendedVocabulary: RecommendedWord[];
}

export interface VocabularyNotebookItem {
  id: string;
  spanish: string;
  chinese: string;
  level: DELELevel | 'General';
  partOfSpeech?: string;
  exampleSentence?: string;
  addedAt: string;
  sourceArticleTitle?: string;
}

export interface PresetWordPack {
  level: DELELevel;
  topic: string;
  title: string;
  words: string[];
}
