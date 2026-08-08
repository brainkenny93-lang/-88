import React from 'react';
import { Award, BookOpen, CheckCircle, X } from 'lucide-react';

interface DELEGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DELEGuideModal: React.FC<DELEGuideModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xl max-w-3xl w-full overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-lg">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-black text-white">DELE 官方写作考试评分标准剖析 (A1 - C2)</h3>
              <p className="text-xs text-slate-400 mt-1">
                根据塞万提斯学院 (Instituto Cervantes) 官方写作评分表 (Analítica y Holística) 编制
              </p>
            </div>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs text-slate-700">
          {/* 4 Core Dimensions */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              一、DELE 写作 4 维官方打分要点
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 text-xs">1. 任务完成度 (Cumplimiento de la Tarea)</span>
                <p className="text-amber-900 leading-relaxed">
                  是否覆盖试题给出的全部要点、字数是否在区间内、文本格式（信件、论坛评论、报告等）是否得体。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 text-xs">2. 连贯与衔接 (Coherencia y Cohesión)</span>
                <p className="text-amber-900 leading-relaxed">
                  段落划分是否合理，逻辑连接词 (conectores: sin embargo, por lo tanto, en cambio) 使用是否自然。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 text-xs">3. 词汇丰富度 (Riqueza Léxica)</span>
                <p className="text-amber-900 leading-relaxed">
                  是否重复使用简单的低阶词，能否在对应等级准确运用地道近义词、固定搭配与高阶术语。
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200 space-y-1">
                <span className="font-bold text-amber-950 text-xs">4. 语法准确性 (Corrección Gramatical)</span>
                <p className="text-amber-900 leading-relaxed">
                  性数一致、动词变位、时态呼应（如虚拟式与陈述式）、重音符号 (tilde) 及标点符号的准确率。
                </p>
              </div>
            </div>
          </div>

          {/* Level Breakdown */}
          <div className="space-y-3">
            <h4 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2">
              二、DELE 各等级写作期望水平
            </h4>

            <div className="space-y-2">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">DELE A1 - A2 (初级)</span>
                <p className="text-slate-600">
                  重点考察个人信息描述、日常经历叙述（过去时态 Presente / Indefinido / Imperfecto）、简单的连接词 (y, pero, porque)。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">DELE B1 - B2 (中级/中高级)</span>
                <p className="text-slate-600">
                  重点考察观点阐述、建议表达、正式/非正式信件格式、虚拟式现在时/过去时 (Subjuntivo)、逻辑关系拓展 (por consiguiente, no obstante, a pesar de que)。
                </p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-1">
                <span className="font-bold text-slate-900 font-mono">DELE C1 - C2 (高级/精通)</span>
                <p className="text-slate-600">
                  重点考察复杂学术论证、报刊社论、抽象社会议题分析、严谨的倒装与被动结构、极其丰富地道的形容词与副词搭配。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 p-4 border-t border-slate-200 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-6 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800 transition-colors"
          >
            我已了解评分标准
          </button>
        </div>
      </div>
    </div>
  );
};
