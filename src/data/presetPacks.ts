import { PresetWordPack, DELELevel, DELETopicKey } from '../types';

export const DELE_TOPICS: { key: DELETopicKey; nameZh: string; nameEs: string; desc: string }[] = [
  {
    key: 'auto',
    nameZh: '🤖 智能自动匹配',
    nameEs: 'Recomendación Automática',
    desc: '根据词汇特征自动匹配最适合的 DELE 高频考题场景'
  },
  {
    key: 'daily',
    nameZh: '🏠 日常生活与休闲',
    nameEs: 'Vida Cotidiana y Ocio',
    desc: '家庭生活、兴趣爱好、购物消费、社交聚会等高频口语与书面场景'
  },
  {
    key: 'campus',
    nameZh: '🎓 校园学习与学术',
    nameEs: 'Estudios y Vida Académica',
    desc: '大学申请、留学交流、课程讨论、学术研究与图书馆探讨'
  },
  {
    key: 'society',
    nameZh: '🌐 社会热点与科技',
    nameEs: 'Sociedad y Tecnología',
    desc: '数字技术、社交媒体、社会发展、人际交往与现代生活变化'
  },
  {
    key: 'work',
    nameZh: '💼 职场生活与事业',
    nameEs: 'Mundo Laboral y Carrera',
    desc: '求职面试、团队合作、远程办公、职业规划与商业沟通'
  },
  {
    key: 'travel',
    nameZh: '✈️ 旅行文化与美食',
    nameEs: 'Cultura, Viajes y Gastronomía',
    desc: '旅游规划、名胜古迹、西班牙与西语国家风土人情与传统节日'
  },
  {
    key: 'environment',
    nameZh: '🌱 生态环保与可持续',
    nameEs: 'Medio Ambiente y Ecología',
    desc: '气候变化、垃圾分类、可再生能源、绿色出行与环境保护'
  },
  {
    key: 'feelings',
    nameZh: '💡 个人感悟与成长',
    nameEs: 'Experiencias y Reflexiones',
    desc: '人生经历、困难挑战、目标规划、情感表达与自我提升'
  }
];

export const PRESET_WORD_PACKS: PresetWordPack[] = [
  {
    level: 'A1',
    topic: '日常与自我介绍',
    title: 'A1 基础核心词汇包',
    words: ['estudiante', 'presentar', 'familia', 'ciudad', 'gustar', 'estudiar', 'amigo', 'español', 'mañana', 'feliz']
  },
  {
    level: 'A2',
    topic: '旅行与过去经历',
    title: 'A2 叙事与交通日常词包',
    words: ['viajar', 'vacaciones', 'estación', 'comprar', 'billete', 'experiencia', 'restaurante', 'inolvidable', 'preferir', 'pasado']
  },
  {
    level: 'B1',
    topic: '校园与社会社交',
    title: 'B1 表达观点与建议词包',
    words: ['recomendar', 'opinión', 'desarrollar', 'oportunidad', 'costumbre', 'actividad', 'solución', 'ambiente', 'participar', 'ventaja']
  },
  {
    level: 'B2',
    topic: '职场与环境保护',
    title: 'B2 议论文与逻辑衔接高频词包',
    words: ['sostenibilidad', 'en consecuencia', 'desafío', 'fomentar', 'impacto', 'sin embargo', 'competencia', 'imprescindible', 'concienciar', 'rendimiento']
  },
  {
    level: 'C1',
    topic: '科技社会与高端议题',
    title: 'C1 高级论证与深度词句词包',
    words: ['transcendental', 'a tenor de', 'digitalización', 'discrepancia', 'implicación', 'mitigar', 'paradigma', 'inexorablemente', 'homogeneización', 'controversia']
  },
  {
    level: 'C2',
    topic: '文学哲学与学术精美表达',
    title: 'C2 典雅地道修辞词库',
    words: ['idiosincrasia', 'efímero', 'subyacer', 'elocuencia', 'yuxtaposición', 'enajenación', 'irrefutable', 'arquetipo', 'resiliencia', 'cohesión']
  }
];

export const LEVEL_DESCRIPTIONS: Record<DELELevel, { title: string; length: string; grammarFocus: string; styleTip: string }> = {
  A1: {
    title: 'A1 入门级 (Acceso)',
    length: '80 - 120 词',
    grammarFocus: '陈述式现在时 (Presente de indicativo), gustar 句型, 基础冠词与介词',
    styleTip: '结构明晰、通俗易懂，用词规范直接，适合基础薄弱或初学者。'
  },
  A2: {
    title: 'A2 平台级 (Plataforma)',
    length: '110 - 160 词',
    grammarFocus: '简单过去时与过去未完成时 (Indefinido vs Imperfecto), ir a + inf',
    styleTip: '能够叙述过去经历与日常计划，句式连接自然流畅。'
  },
  B1: {
    title: 'B1 进阶级 (Umbral)',
    length: '160 - 220 词',
    grammarFocus: '现在虚拟式 (Presente de subjuntivo), 条件式, 常见逻辑连词 (por eso, además)',
    styleTip: '能够阐述个人观点、提出建议与描述事件原因，具备初步议论文框架。'
  },
  B2: {
    title: 'B2 中高级 (Avanzado)',
    length: '220 - 290 词',
    grammarFocus: '虚拟式过去时 (Imperfecto de subjuntivo), 复合句, 高级连词 (por consiguiente, no obstante)',
    styleTip: '结构严谨的正式议论文或报告，行文条理分明，用词丰富准确，全面贴合官方B2写作标准。'
  },
  C1: {
    title: 'C1 精通级 (Dominio Operativo)',
    length: '290 - 380 词',
    grammarFocus: '倒装句、被动句、复杂名词化结构、各种虚拟式组合句型',
    styleTip: '富有深度与逻辑张力的学术论述或报刊风格，地道地表达抽象概念与微妙语意。'
  },
  C2: {
    title: 'C2 专精级 (Maestría)',
    length: '350 - 450+ 词',
    grammarFocus: '极高熟练度的复杂复合句、典雅成语与固定搭配、精确修辞',
    styleTip: '母语者级别的文学与专业学术行文，逻辑缜密严谨，文采斐然，展现最高西语表达艺术。'
  }
};
