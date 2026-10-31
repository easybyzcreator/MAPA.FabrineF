import React from 'react';
import { 
  X, 
  Printer, 
  CheckSquare, 
  ShieldAlert
} from 'lucide-react';

interface ProtocoloAnticriseModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProtocoloAnticriseModal: React.FC<ProtocoloAnticriseModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    const printContent = document.getElementById('printable-protocolo-content');
    if (!printContent) {
      window.print();
      return;
    }

    try {
      // Use dedicated hidden iframe for clean, instant, popup-blocker-proof printing
      let iframe = document.getElementById('protocolo-print-iframe') as HTMLIFrameElement;
      if (!iframe) {
        iframe = document.createElement('iframe');
        iframe.id = 'protocolo-print-iframe';
        iframe.style.position = 'fixed';
        iframe.style.right = '0';
        iframe.style.bottom = '0';
        iframe.style.width = '0';
        iframe.style.height = '0';
        iframe.style.border = '0';
        iframe.style.visibility = 'hidden';
        document.body.appendChild(iframe);
      }

      const doc = iframe.contentWindow?.document || iframe.contentDocument;
      if (doc) {
        doc.open();
        doc.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Protocolo de Segurança Anticrise - M.A.P.A FabrineF.</title>
              <meta charset="utf-8" />
              <meta name="viewport" content="width=device-width, initial-scale=1.0" />
              <script src="https://cdn.tailwindcss.com"></script>
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet">
              <style>
                body {
                  font-family: 'Inter', sans-serif;
                  background: white;
                  color: #1e293b;
                  padding: 20px;
                  margin: 0;
                  -webkit-print-color-adjust: exact !important;
                  print-color-adjust: exact !important;
                }
                .no-print { display: none !important; }
                @page { margin: 10mm; size: auto; }
                .anticrise-single-line {
                  white-space: nowrap !important;
                  font-size: 10px !important;
                  letter-spacing: -0.2px !important;
                  word-break: keep-all !important;
                  overflow: visible !important;
                }
                .anticrise-callout-box {
                  overflow: visible !important;
                  width: 100% !important;
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
              <script>
                document.querySelectorAll('.no-print').forEach(el => el.remove());
                setTimeout(() => {
                  window.focus();
                  window.print();
                }, 400);
              </script>
            </body>
          </html>
        `);
        doc.close();
      } else {
        window.print();
      }
    } catch (e) {
      console.warn("Iframe print fallback to window.print():", e);
      window.print();
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 transition-all duration-300 modal-backdrop-print">
      
      {/* Modal Container */}
      <div 
        id="printable-protocolo"
        className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl border border-green-100 overflow-hidden flex flex-col max-h-[92vh] my-auto"
      >
        {/* Top Floating Close Button (Hidden on Print) */}
        <div className="no-print absolute top-4 right-4 z-20">
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-gray-500 hover:text-gray-800 shadow-md border border-gray-200 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 cursor-pointer"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Scrollable Printable Content */}
        <div 
          id="printable-protocolo-content"
          className="overflow-y-auto p-4 sm:p-8 md:p-10 space-y-8 text-slate-800"
        >
          
          {/* Card Top Header (Brand Palette: bg-brand-light #F5F9F5 & text-brand-green #56C45F) */}
          <div className="bg-[#F5F9F5] border border-[#56C45F]/30 rounded-2xl p-6 sm:p-8 space-y-4 relative overflow-hidden">
            <div className="space-y-2">
              <span className="text-[11px] sm:text-xs font-black uppercase tracking-wider text-[#56C45F] block">
                FABRINE FERNANDES · NEUROPSICOPEDAGOGA
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-[#56C45F] tracking-tight">
                Protocolo de Segurança Anticrise
              </h2>
              <p className="text-xs sm:text-sm text-slate-700 leading-relaxed max-w-3xl">
                Baseado na prática de atendimento e na metodologia de Fabrine Fernandes. O objetivo é perceber os sinais antes da crise se instalar, aplicar estratégias validadas e evitar condutas que aumentam o estresse.
              </p>
            </div>

            {/* Warning Callout Box - FORMATADO EM UMA ÚNICA LINHA SEM QUEBRA */}
            <div className="anticrise-callout-box bg-white border-l-4 border-[#56C45F] py-2 px-3 sm:py-2.5 sm:px-4 rounded-r-xl shadow-xs flex items-center gap-2">
              <span className="text-sm select-none shrink-0 text-amber-500 leading-none">⚠️</span>
              <p className="anticrise-single-line text-[10px] sm:text-[11px] md:text-[12px] font-semibold text-slate-800 tracking-tight whitespace-nowrap overflow-visible">
                Este protocolo não garante que crises não ocorram — ele reúne estratégias para ajudar a evitá-las.
              </p>
            </div>

            {/* Print Button */}
            <div className="no-print pt-1">
              <button
                type="button"
                onClick={handlePrint}
                className="bg-[#56C45F] hover:bg-[#48b551] text-white font-bold text-xs px-4 py-2.5 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
              >
                <Printer size={15} />
                Imprimir / salvar PDF
              </button>
            </div>
          </div>

          {/* Section 1: Sinais sutis de alerta */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#56C45F] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                1
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Sinais sutis de alerta
              </h3>
            </div>
            <p className="text-xs sm:text-sm text-slate-600 pl-11">
              Indicam sobrecarga do sistema nervoso (luta ou fuga). Agir aqui pode evitar a crise.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              {/* Card 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <span className="text-[#56C45F] font-serif text-lg leading-none">❝</span>
                  <span className="text-slate-900 font-bold">Motores / Estereotipias</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Agitar as mãos (flapping), balançar o corpo, andar em círculos de forma excessiva.
                </p>
              </div>

              {/* Card 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <span className="text-[#56C45F] font-serif text-lg leading-none">❝</span>
                  <span className="text-slate-900 font-bold">Sensoriais</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cobrir os ouvidos, fechar os olhos com força, recusar toques ou irritar-se de forma brusca com luz ou barulho.
                </p>
              </div>

              {/* Card 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <span className="text-[#56C45F] font-serif text-lg leading-none">❝</span>
                  <span className="text-slate-900 font-bold">Fisiológicos</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Respiração curta e rápida, pupilas dilatadas, mãos suadas ou vermelhidão.
                </p>
              </div>

              {/* Card 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 font-bold text-sm mb-2">
                  <span className="text-[#56C45F] font-serif text-lg leading-none">❝</span>
                  <span className="text-slate-900 font-bold">Gatilhos ambientais comuns</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sinal sonoro de início/fim de aula, troca de ambiente (sala → quadra), refeitório barulhento, murais com excesso de estímulos visuais.
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Estratégias de autorregulação */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#56C45F] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                2
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                Estratégias de autorregulação
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {/* Item 1 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 text-[#56C45F] font-bold text-sm sm:text-base mb-1.5">
                  <CheckSquare size={18} className="text-[#56C45F] shrink-0" />
                  <span className="text-slate-900 font-bold">Pressão profunda</span>
                </div>
                <div className="space-y-1 pl-6 text-xs sm:text-sm leading-relaxed">
                  <p><strong className="text-slate-900">Como fazer:</strong> <span className="text-slate-600">Coletes de peso, abraços firmes (se permitidos) ou técnica do casulo com cobertor pesado.</span></p>
                  <p><strong className="text-slate-900">Por que funciona:</strong> <span className="text-slate-600">Estimula receptores proprioceptivos, reduz o cortisol e aumenta a serotonina.</span></p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 text-[#56C45F] font-bold text-sm sm:text-base mb-1.5">
                  <CheckSquare size={18} className="text-[#56C45F] shrink-0" />
                  <span className="text-slate-900 font-bold">Ancoramento 5-4-3-2-1</span>
                </div>
                <div className="space-y-1 pl-6 text-xs sm:text-sm leading-relaxed">
                  <p><strong className="text-slate-900">Como fazer:</strong> <span className="text-slate-600">Guiar a pessoa a identificar: 5 coisas que vê, 4 que pode tocar, 3 que ouve, 2 que cheira e 1 que prova.</span></p>
                  <p><strong className="text-slate-900">Por que funciona:</strong> <span className="text-slate-600">Desvia o foco do estressor e reativa o córtex pré-frontal pela atenção plena.</span></p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 text-[#56C45F] font-bold text-sm sm:text-base mb-1.5">
                  <CheckSquare size={18} className="text-[#56C45F] shrink-0" />
                  <span className="text-slate-900 font-bold">Redução do estímulo sensorial</span>
                </div>
                <div className="space-y-1 pl-6 text-xs sm:text-sm leading-relaxed">
                  <p><strong className="text-slate-900">Como fazer:</strong> <span className="text-slate-600">Levar a um lugar calmo ou oferecer abafadores de ruído e óculos escuros.</span></p>
                  <p><strong className="text-slate-900">Por que funciona:</strong> <span className="text-slate-600">Interrompe o bombardeio sensorial.</span></p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs hover:border-[#56C45F]/50 transition-colors">
                <div className="flex items-center gap-2 text-[#56C45F] font-bold text-sm sm:text-base mb-1.5">
                  <CheckSquare size={18} className="text-[#56C45F] shrink-0" />
                  <span className="text-slate-900 font-bold">Co-regulação</span>
                </div>
                <div className="space-y-1 pl-6 text-xs sm:text-sm leading-relaxed">
                  <p><strong className="text-slate-900">Como fazer:</strong> <span className="text-slate-600">Voz baixa, gestos lentos e respiração tranquila ao lado da pessoa.</span></p>
                  <p><strong className="text-slate-900">Por que funciona:</strong> <span className="text-slate-600">Pelos neurônios-espelho, a calma do adulto ajuda a estabilizar a pessoa.</span></p>
                </div>
              </div>
            </div>
          </div>

          {/* Sub-section: Estratégias extras na escola */}
          <div className="space-y-3 pt-2">
            <h4 className="text-base sm:text-lg font-bold text-slate-900">
              Estratégias extras na escola
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Extra 1 */}
              <div className="bg-[#F5F9F5] border border-[#56C45F]/20 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                  <span className="text-amber-500 text-base">💡</span>
                  Cartão de pausa visual
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Cartão ou símbolo discreto na mesa que a pessoa levanta para avisar que precisa sair e se regular, sem precisar falar.
                </p>
              </div>

              {/* Extra 2 */}
              <div className="bg-[#F5F9F5] border border-[#56C45F]/20 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                  <span className="text-amber-500 text-base">💡</span>
                  Cantinho calmo
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Local neutro e com poucos estímulos mapeado antes (biblioteca, sala de AEE ou canto reservado da sala).
                </p>
              </div>

              {/* Extra 3 */}
              <div className="bg-[#F5F9F5] border border-[#56C45F]/20 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                  <span className="text-amber-500 text-base">💡</span>
                  Reduzir demandas
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Diminuir tarefas e cobranças assim que os sinais sutis aparecerem.
                </p>
              </div>

              {/* Extra 4 */}
              <div className="bg-[#F5F9F5] border border-[#56C45F]/20 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mb-1.5">
                  <span className="text-amber-500 text-base">💡</span>
                  Transição antecipada
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Sair para o intervalo ou trocar de sala 5 minutos antes da turma, evitando corredores cheios e barulho.
                </p>
              </div>
            </div>
          </div>

          {/* Section 3: O que evitar (Usando o destaque da marca #FA4E74) */}
          <div className="space-y-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#FA4E74] text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                3
              </span>
              <h3 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                O que evitar
              </h3>
            </div>

            <div className="space-y-3 pt-2">
              {/* Avoid 1 */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#FA4E74] font-bold text-sm sm:text-base mb-1.5">
                  <span className="text-rose-500 font-black text-base select-none">❌</span>
                  Contenção física rígida
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  Segurar à força eleva a adrenalina e o risco de trauma (salvo risco iminente de vida).
                </p>
              </div>

              {/* Avoid 2 */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#FA4E74] font-bold text-sm sm:text-base mb-1.5">
                  <span className="text-rose-500 font-black text-base select-none">❌</span>
                  Ordens complexas ou gritos
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  Em crise, o cérebro perde a capacidade de processar linguagem verbal complexa.
                </p>
              </div>

              {/* Avoid 3 */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#FA4E74] font-bold text-sm sm:text-base mb-1.5">
                  <span className="text-rose-500 font-black text-base select-none">❌</span>
                  Invalidar ou punir
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  Frases como “pare com isso” ou “é frescura” aumentam a ansiedade e o isolamento.
                </p>
              </div>

              {/* Avoid 4 */}
              <div className="bg-rose-50/50 border border-rose-200 rounded-2xl p-4 sm:p-5 shadow-xs">
                <div className="flex items-center gap-2 text-[#FA4E74] font-bold text-sm sm:text-base mb-1.5">
                  <span className="text-rose-500 font-black text-base select-none">❌</span>
                  Exposição forçada ao estímulo
                </div>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed pl-6">
                  Obrigar a aguentar barulho ou toque piora a sobrecarga sensorial.
                </p>
              </div>
            </div>
          </div>

          {/* Footer note in modal */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
            <span className="font-semibold text-[#56C45F]">M.A.P.A FabrineF. · Protocolo de Apoio & Inclusão</span>
            <div className="no-print">
              <button
                type="button"
                onClick={onClose}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-4 py-2 rounded-xl transition-all cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
