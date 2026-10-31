import React, { useState, useRef, useEffect } from 'react';
import { 
  User,
  Smile, 
  Utensils, 
  Brain, 
  MessageSquare, 
  Sparkles,
  Clock,
  Star,
  Users,
  GraduationCap,
  PlusCircle,
  Camera,
  Send,
  AlertTriangle,
  Volume2,
  Eye,
  Hand,
  Activity,
  Calendar,
  PenTool,
  CheckCircle2,
  Loader2
} from 'lucide-react';
import { FormSection } from './FormSection';
import { StudentProfile, TripDetails } from '../types';
import { saveRegistration } from '../services/firebase';

interface StudentFormProps {
  tripDetails: TripDetails;
  whatsappPhone: string;
}

export const StudentForm: React.FC<StudentFormProps> = ({ tripDetails, whatsappPhone }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [stepAttempted, setStepAttempted] = useState(false);

  const steps = [
    { id: 1, title: 'Identificação', icon: <User size={14} /> },
    { id: 2, title: 'Contexto Clínico', icon: <Activity size={14} /> },
    { id: 3, title: 'Comunicação & Fala', icon: <MessageSquare size={14} /> },
    { id: 4, title: 'Proc. Sensorial', icon: <Sparkles size={14} /> },
    { id: 5, title: 'Comportamento & Crises', icon: <Brain size={14} /> },
    { id: 6, title: 'Rotina & Sono', icon: <Clock size={14} /> },
    { id: 7, title: 'Interesses', icon: <Star size={14} /> },
    { id: 8, title: 'Interação Social', icon: <Users size={14} /> },
    { id: 9, title: 'Vida Escolar', icon: <GraduationCap size={14} /> },
    { id: 10, title: 'Informações Adicionais', icon: <PlusCircle size={14} /> },
  ];

  const isStepValid = (stepNum: number) => {
    switch (stepNum) {
      case 1:
        return !!(profile.name && profile.birthday && profile.age && profile.guardianNameRelation && profile.phone);
      case 2:
        return !!profile.diagnosis;
      case 3:
        if (profile.communicationMethod === 'Outra forma — descrever abaixo') {
          return !!(profile.communicationMethod && profile.communicationOtherDesc && profile.comprehension);
        }
        return !!(profile.communicationMethod && profile.comprehension);
      case 4:
        return true;
      case 5:
        return !!(profile.emotionalReaction && profile.emotionalTriggers && profile.emotionalCalming && profile.emotionalWhatToAvoid);
      case 6:
        return !!(profile.routineChanges && profile.foodRestrictions && profile.sleepDifficulties);
      case 7:
        return !!(profile.favoriteSubjects && profile.favoriteToys && profile.biggestDifficulties);
      case 8:
        return !!(profile.peerRelationship && profile.authorityRelationship);
      case 9:
        return true;
      case 10:
        return !!(profile.fillDate && profile.guardianSignature && profile.guardianSignatureDraw);
      default:
        return true;
    }
  };

  const isFieldInvalid = (fieldName: keyof StudentProfile) => {
    if (!stepAttempted) return false;
    
    if (fieldName === 'name') return !profile.name;
    if (fieldName === 'birthday') return !profile.birthday;
    if (fieldName === 'age') return !profile.age;
    if (fieldName === 'guardianNameRelation') return !profile.guardianNameRelation;
    if (fieldName === 'phone') return !profile.phone;
    if (fieldName === 'diagnosis') return !profile.diagnosis;
    if (fieldName === 'communicationMethod') return !profile.communicationMethod;
    if (fieldName === 'communicationOtherDesc') {
      return profile.communicationMethod === 'Outra forma — descrever abaixo' && !profile.communicationOtherDesc;
    }
    if (fieldName === 'comprehension') return !profile.comprehension;
    if (fieldName === 'emotionalReaction') return !profile.emotionalReaction;
    if (fieldName === 'emotionalTriggers') return !profile.emotionalTriggers;
    if (fieldName === 'emotionalCalming') return !profile.emotionalCalming;
    if (fieldName === 'emotionalWhatToAvoid') return !profile.emotionalWhatToAvoid;
    if (fieldName === 'routineType') return false;
    if (fieldName === 'routineChanges') return !profile.routineChanges;
    if (fieldName === 'foodRestrictions') return !profile.foodRestrictions;
    if (fieldName === 'sleepDifficulties') return !profile.sleepDifficulties;
    if (fieldName === 'favoriteSubjects') return !profile.favoriteSubjects;
    if (fieldName === 'favoriteToys') return !profile.favoriteToys;
    if (fieldName === 'biggestDifficulties') return !profile.biggestDifficulties;
    if (fieldName === 'peerRelationship') return !profile.peerRelationship;
    if (fieldName === 'authorityRelationship') return !profile.authorityRelationship;
    if (fieldName === 'schoolAdaptations') return false;
    if (fieldName === 'schoolChallenges') return false;
    if (fieldName === 'fillDate') return !profile.fillDate;
    if (fieldName === 'guardianSignature') return !profile.guardianSignature;
    if (fieldName === 'guardianSignatureDraw') return !profile.guardianSignatureDraw;

    return false;
  };

  const handleNext = () => {
    if (isStepValid(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 10));
      setStepAttempted(false);
      const formEl = document.getElementById('mapa-form-root');
      if (formEl) {
        formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } else {
      setStepAttempted(true);
      setTimeout(() => {
        const firstInvalid = document.querySelector('.border-red-400');
        if (firstInvalid) {
          firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 50);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
    setStepAttempted(false);
    const formEl = document.getElementById('mapa-form-root');
    if (formEl) {
      formEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleStepClick = (stepNum: number) => {
    if (stepNum < currentStep) {
      setCurrentStep(stepNum);
      setStepAttempted(false);
    } else if (stepNum > currentStep) {
      let canJump = true;
      for (let s = currentStep; s < stepNum; s++) {
        if (!isStepValid(s)) {
          canJump = false;
          break;
        }
      }
      if (canJump) {
        setCurrentStep(stepNum);
        setStepAttempted(false);
      } else {
        setStepAttempted(true);
      }
    }
  };

  const [profile, setProfile] = useState<StudentProfile>({
    // 1. Identificação
    name: '',
    nickname: '',
    birthday: '',
    age: '',
    school: '',
    grade: '',
    guardianNameRelation: '',
    phone: '',
    photo: null,

    // 2. Contexto
    diagnosis: '',
    professionals: '',
    medications: '',

    // 3. Comunicação
    communicationMethod: '',
    communicationOtherDesc: '',
    comprehension: '',

    // 4. Processamento Sensorial
    sensorialSounds: [],
    sensorialLights: [],
    sensorialTouch: [],
    sensorialMovement: [],
    sensorialNotes: '',

    // 5. Comportamento e Regulação Emocional
    emotionalReaction: '',
    emotionalTriggers: '',
    emotionalCalming: '',
    emotionalWhatToAvoid: '',

    // 6. Rotina, Alimentação e Sono
    routineType: '',
    routineChanges: '',
    foodRestrictions: '',
    sleepDifficulties: '',

    // 7. Interesses e Habilidades
    favoriteSubjects: '',
    favoriteToys: '',
    biggestDifficulties: '',

    // 8. Interação Social
    peerRelationship: '',
    authorityRelationship: '',

    // 9. Vida Escolar
    schoolAdaptations: '',
    schoolChallenges: '',

    // 10. Informações Adicionais
    additionalInfo: '',
    fillDate: new Date().toLocaleDateString('pt-BR'),
    guardianSignature: '',
    guardianSignatureDraw: ''
  });

  const handleTextChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    let finalValue = value;

    // Máscara de data para aniversário e data de preenchimento
    if (name === 'birthday' || name === 'fillDate') {
      let v = value.replace(/\D/g, ''); // Remove não dígitos
      if (v.length > 8) v = v.slice(0, 8); // Limita a 8 dígitos
      
      if (v.length >= 5) {
        finalValue = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
      } else if (v.length >= 3) {
        finalValue = `${v.slice(0, 2)}/${v.slice(2)}`;
      } else {
        finalValue = v;
      }
    }

    setProfile(prev => ({ ...prev, [name]: finalValue }));
  };

  const handleCheckboxChange = (category: 'sensorialSounds' | 'sensorialLights' | 'sensorialTouch' | 'sensorialMovement', value: string) => {
    setProfile(prev => {
      const list = prev[category];
      if (list.includes(value)) {
        return { ...prev, [category]: list.filter(item => item !== value) };
      } else {
        return { ...prev, [category]: [...list, value] };
      }
    });
  };

  const handleCommunicationChange = (method: string) => {
    setProfile(prev => ({
      ...prev,
      communicationMethod: method,
      // Reseta descrição adicional se não for "Outra forma"
      communicationOtherDesc: method === 'Outra forma — descrever abaixo' ? prev.communicationOtherDesc : ''
    }));
  };

  const generateWhatsAppMessage = () => {
    const text = `📋 *M.A.P.A. - FICHA NEUROPEDAGÓGICA DO ALUNO* 📋
_Metodologia: Fabrine Fernandes Psicopedagoga_

🎒 *DETALHES DA VIAGEM:*
*Escola/Origem:* ${tripDetails.schoolName}
*Destino:* ${tripDetails.destination}
*Data:* ${tripDetails.date || '-'}
*Série:* ${tripDetails.grade || '-'}

---------------------------------------

*1. IDENTIFICAÇÃO*
• *Nome Completo:* ${profile.name}
• *Como gosta de ser chamado(a):* ${profile.nickname || '-'}
• *Data de Nascimento:* ${profile.birthday}
• *Idade:* ${profile.age} anos
• *Escola Atual:* ${profile.school || '-'}
• *Ano / Série:* ${profile.grade || '-'}
• *Responsável:* ${profile.guardianNameRelation}
• *Telefone:* ${profile.phone}

*2. CONTEXTO*
• *Possui diagnóstico?* ${profile.diagnosis || '-'}
• *Acompanhamento profissional:* ${profile.professionals || '-'}
• *Uso de medicações:* ${profile.medications || '-'}

*3. COMUNICAÇÃO*
• *Forma de comunicação:* ${profile.communicationMethod || '-'} ${profile.communicationOtherDesc ? `(${profile.communicationOtherDesc})` : ''}
• *Compreensão verbal:* ${profile.comprehension || '-'}

*4. PROCESSAMENTO SENSORIAL*
• *Sons:* ${profile.sensorialSounds.join(', ') || 'Sem observações'}
• *Luz e Visual:* ${profile.sensorialLights.join(', ') || 'Sem observações'}
• *Toque e Textura:* ${profile.sensorialTouch.join(', ') || 'Sem observações'}
• *Movimento e Corpo:* ${profile.sensorialMovement.join(', ') || 'Sem observações'}
• *Outras observações sensoriais:* ${profile.sensorialNotes || '-'}

*5. COMPORTAMENTO E REGULAÇÃO EMOCIONAL*
• *Reação a frustração/crise:* ${profile.emotionalReaction || '-'}
• *Sinais de alerta de crise:* ${profile.emotionalTriggers || '-'}
• *O que ajuda a acalmar:* ${profile.emotionalCalming || '-'}
• *O que evitar/piora:* ${profile.emotionalWhatToAvoid || '-'}

*6. ROTINA, ALIMENTAÇÃO E SONO*
• *Rotina diária:* ${profile.routineType || '-'}
• *Mudanças de rotina:* ${profile.routineChanges || '-'}
• *Restrições/Seletividade alimentar:* ${profile.foodRestrictions || '-'}
• *Dificuldades de sono:* ${profile.sleepDifficulties || '-'}

*7. INTERESSES E HABILIDADES*
• *Assuntos/Atividades favoritas:* ${profile.favoriteSubjects || '-'}
• *Brinquedos favoritos:* ${profile.favoriteToys || '-'}
• *Maiores dificuldades:* ${profile.biggestDifficulties || '-'}

*8. INTERAÇÃO SOCIAL*
• *Relação com colegas (mesma idade):* ${profile.peerRelationship || '-'}
• *Relação com adultos/autoridades:* ${profile.authorityRelationship || '-'}

*9. VIDA ESCOLAR (SE APLICÁVEL)*
• *Adaptações, apoio ou PEI:* ${profile.schoolAdaptations || '-'}
• *Situações desafiadoras na escola:* ${profile.schoolChallenges || '-'}

*10. INFORMAÇÕES ADICIONAIS*
• *Outras informações importantes:* ${profile.additionalInfo || '-'}
• *Data de preenchimento:* ${profile.fillDate}
• *Assinatura do responsável:* ${profile.guardianSignature}

---------------------------------------
⚠️ *ANEXOS:*
(Estou enviando a Foto do Aluno em anexo na sequência)`.trim();

    return encodeURIComponent(text);
  };

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Verificar se o tamanho do arquivo é maior que 295 KB (295 * 1024 bytes)
    const MAX_FILE_SIZE = 295 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      alert("A imagem selecionada é muito grande! Por segurança e compatibilidade, o limite máximo para envio é de 295 KB (tamanho de um print de tela). Escolha um arquivo menor ou tire um print reduzido da foto.");
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_SIZE = 150;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_SIZE) {
            height *= MAX_SIZE / width;
            width = MAX_SIZE;
          }
        } else {
          if (height > MAX_SIZE) {
            width *= MAX_SIZE / height;
            height = MAX_SIZE;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
          setProfile(prev => ({ ...prev, photo: compressedBase64 }));
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Final sanity check for all steps
    let firstInvalidStep = 0;
    for (let s = 1; s <= 10; s++) {
      if (!isStepValid(s)) {
        firstInvalidStep = s;
        break;
      }
    }
    
    if (firstInvalidStep !== 0) {
      setCurrentStep(firstInvalidStep);
      setStepAttempted(true);
      alert("Por favor, preencha todos os campos obrigatórios marcados em vermelho antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    try {
      const configId = new URLSearchParams(window.location.search).get('c') || 'default';
      await saveRegistration({
        ...profile,
        configId
      });
      setSubmitSuccess(true);
    } catch (err) {
      console.error(err);
      alert("Houve um erro ao salvar sua ficha no banco de dados. Por favor, tente novamente.");
      setIsSubmitting(false);
    }
  };

  const commOptions = [
    "Fala verbal fluente",
    "Fala verbal com dificuldades (poucas palavras, frases curtas, ecolalia)",
    "Comunicação não verbal (gestos, apontar, expressões)",
    "Uso de figuras, pranchas ou tecnologia assistiva (CAA)",
    "Outra forma — descrever abaixo"
  ];

  return (
    <form onSubmit={handleSubmit} id="mapa-form-root" className="relative mt-6 scroll-mt-24">
      
      {/* Loading & Success Portal Overlay */}
      {isSubmitting && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white p-8 rounded-3xl shadow-2xl max-w-md w-full text-center space-y-4 border border-green-50 animate-in fade-in zoom-in duration-300">
            {submitSuccess ? (
              <>
                <div className="mx-auto w-16 h-16 bg-green-50 text-brand-green rounded-full flex items-center justify-center animate-bounce">
                  <CheckCircle2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Ficha Enviada com Sucesso!</h3>
                <p className="text-sm text-gray-500">Seu cadastro foi salvo com segurança no banco de dados.</p>
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setIsSubmitting(false);
                      setSubmitSuccess(false);
                      window.location.reload();
                    }}
                    className="w-full py-3 bg-brand-green hover:bg-opacity-90 text-white font-bold rounded-xl transition-colors text-sm shadow-md cursor-pointer"
                  >
                    Entendido, Voltar ao Início
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="mx-auto w-16 h-16 bg-brand-light text-brand-green rounded-full flex items-center justify-center animate-spin">
                  <Loader2 size={36} />
                </div>
                <h3 className="text-xl font-bold text-gray-800">Salvando Ficha</h3>
                <p className="text-sm text-gray-500">Aguarde enquanto salvamos seus dados...</p>
              </>
            )}
          </div>
        </div>
      )}

      {/* Mobile progress indicator */}
      <div className="md:hidden bg-white p-4 rounded-2xl border border-green-100 shadow-sm mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Passo {currentStep} de 10</span>
          <span className="text-xs font-bold text-brand-green bg-brand-light px-2.5 py-1 rounded-full text-[10px]">
            {Math.round((currentStep - 1) * 10)}% Concluído
          </span>
        </div>
        <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden mb-1">
          <div 
            className="bg-brand-green h-full transition-all duration-300" 
            style={{ width: `${(currentStep - 1) * 10}%` }}
          ></div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        
        {/* Left Column: Photo, Step Tracker & Sticky Helper (4 cols) */}
        <div className="md:col-span-4 space-y-6">
          <div className="sticky top-6 space-y-6">
            
            {/* Desktop Step list */}
            <div className="hidden md:block bg-white p-5 rounded-2xl border border-green-100 shadow-sm space-y-2">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-green-50">
                <span className="text-xs font-bold text-gray-500 uppercase tracking-wider">Etapas da Ficha</span>
                <span className="text-xs font-bold text-brand-green bg-brand-light px-2.5 py-1 rounded-full text-[10px]">
                  {Math.round((currentStep - 1) * 10)}% Concluído
                </span>
              </div>
              <div className="space-y-1 max-h-[380px] overflow-y-auto pr-1 scrollbar-thin">
                {steps.map(step => {
                  const isActive = step.id === currentStep;
                  const isCompleted = step.id < currentStep && isStepValid(step.id);
                  
                  return (
                    <button
                      key={step.id}
                      type="button"
                      onClick={() => handleStepClick(step.id)}
                      className={`w-full flex items-center gap-2.5 p-2 rounded-xl text-left transition-all ${
                        isActive
                          ? 'bg-brand-green text-white font-bold shadow-md shadow-brand-green/20'
                          : isCompleted
                          ? 'bg-green-50/50 hover:bg-green-50 text-gray-700 font-semibold border border-green-100/50'
                          : 'bg-transparent hover:bg-gray-50 text-gray-400 font-medium'
                      }`}
                    >
                      <div className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
                        isActive
                          ? 'bg-white text-brand-green font-extrabold'
                          : isCompleted
                          ? 'bg-brand-green text-white'
                          : 'bg-gray-100 text-gray-400'
                      }`}>
                        {isCompleted ? <CheckCircle2 size={10} className="stroke-[3px]" /> : step.id}
                      </div>
                      <span className="text-[11px] leading-none truncate">{step.title}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Photo Placeholder (Persistent on desktop) */}
            <div className="hidden md:flex bg-white p-6 rounded-2xl shadow-sm border border-green-100 flex-col items-center text-center relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1.5 bg-brand-green"></div>
              
              <input 
                type="file" 
                accept="image/*" 
                onChange={handlePhotoUpload} 
                className="hidden" 
                id="photo-upload-desktop" 
              />
              
              <label htmlFor="photo-upload-desktop" className="cursor-pointer group block w-full">
                <div className="w-40 h-40 bg-brand-light rounded-xl border-2 border-dashed border-brand-green/30 flex flex-col items-center justify-center mb-4 text-brand-green/60 overflow-hidden relative transition-all mx-auto group-hover:border-brand-green/60">
                  {profile.photo ? (
                    <img src={profile.photo} alt="Foto do Aluno" className="w-full h-full object-cover" />
                  ) : (
                    <>
                      <Smile size={40} className="mb-2 transition-transform group-hover:scale-110 animate-pulse text-brand-green/40" />
                      <span className="text-xs font-bold uppercase">FOTO DO ALUNO</span>
                      <span className="text-[9px] text-gray-400 mt-1 font-medium">Imagem quadrada (1080 x 1080)</span>
                      <span className="text-[9px] text-red-500 font-bold mt-1 uppercase">Tamanho máximo: 295 KB</span>
                      <span className="text-[8px] text-gray-400 leading-tight px-3 mt-1">Dica: Se a imagem for muito pesada, tire um print de tela da foto e envie o print!</span>
                    </>
                  )}
                </div>
              </label>

              {profile.photo && (
                <button 
                  type="button"
                  onClick={() => setProfile(prev => ({ ...prev, photo: null }))}
                  className="text-red-500 hover:text-red-700 text-xs font-semibold mb-2"
                >
                  Remover Foto
                </button>
              )}

              <div className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-3 py-1.5 rounded-full flex flex-col items-center gap-0.5 shadow-sm">
                <span className="flex items-center gap-1.5">
                  <Camera size={12} />
                  {profile.photo ? 'Foto Adicionada' : 'Fazer upload de imagem 1080 x 1080'}
                </span>
                <span className="text-[8px] text-brand-green/70 font-medium">(Máximo permitido: 295 KB)</span>
              </div>
            </div>

            {/* Pedagogy Informational Card */}
            <div className="bg-brand-green/5 p-5 rounded-2xl border border-brand-green/10 space-y-3">
              <h4 className="font-bold text-sm text-brand-green flex items-center gap-1.5">
                <Sparkles size={16} /> Ficha de Apoio (M.A.P.A.)
              </h4>
              <p className="text-xs text-gray-500 leading-relaxed">
                Este formulário foi cuidadosamente desenhado para apoiar organizadores e educadores. Ao preenchê-lo passo a passo, você nos ajuda a criar uma jornada segura, previsível e altamente acolhedora para o seu filho.
              </p>
              <div className="bg-white/80 border border-green-50 rounded-xl p-3 text-[11px] text-gray-500 leading-normal">
                💡 <strong className="text-gray-700">Dica:</strong> Após finalizar, seu cadastro será transmitido diretamente para o sistema com total segurança.
              </div>
            </div>

          </div>
        </div>

        {/* Right Column: Step-by-step Form Sections (8 cols) */}
        <div className="md:col-span-8 space-y-6">
          
          {/* Section 1 */}
          {currentStep === 1 && (
            <FormSection title="1. Identificação" icon={<User size={20} />}>
              
              {/* Photo upload ONLY for mobile layout here */}
              <div className="md:hidden bg-brand-light/30 p-5 rounded-2xl border border-dashed border-brand-green/30 flex flex-col items-center text-center relative overflow-hidden mb-6">
                <input 
                  type="file" 
                  accept="image/*" 
                  onChange={handlePhotoUpload} 
                  className="hidden" 
                  id="photo-upload-mobile" 
                />
                
                <label htmlFor="photo-upload-mobile" className="cursor-pointer group block w-full">
                  <div className="w-36 h-36 bg-white rounded-xl border border-brand-green/20 flex flex-col items-center justify-center mb-3 text-brand-green/60 overflow-hidden relative transition-all mx-auto shadow-sm">
                    {profile.photo ? (
                      <img src={profile.photo} alt="Foto do Aluno" className="w-full h-full object-cover" />
                    ) : (
                      <>
                        <Smile size={36} className="mb-2 text-brand-green/40" />
                        <span className="text-[11px] font-bold">FOTO DO ALUNO</span>
                        <span className="text-[9px] text-gray-400 mt-1 font-medium">Imagem quadrada (1080 x 1080)</span>
                        <span className="text-[9px] text-red-500 font-bold mt-1 uppercase">Tamanho máximo: 295 KB</span>
                        <span className="text-[8px] text-gray-400 leading-tight px-3 mt-1">Dica: Se a imagem for muito pesada, tire um print de tela da foto e envie o print!</span>
                      </>
                    )}
                  </div>
                </label>

                {profile.photo && (
                  <button 
                    type="button"
                    onClick={() => setProfile(prev => ({ ...prev, photo: null }))}
                    className="text-red-500 hover:text-red-700 text-xs font-semibold mb-2"
                  >
                    Remover Foto
                  </button>
                )}

                <div className="bg-brand-green/10 text-brand-green text-[10px] font-bold px-3 py-1.5 rounded-full flex flex-col items-center gap-0.5 shadow-sm">
                  <span className="flex items-center gap-1">
                    <Camera size={12} />
                    {profile.photo ? 'Foto Carregada' : 'Upload de imagem 1080 x 1080'}
                  </span>
                  <span className="text-[8px] text-brand-green/70 font-medium">(Máximo permitido: 295 KB)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome Completo <span className="text-red-500">*</span></label>
                  <input 
                    required
                    name="name"
                    value={profile.name}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm ${
                      isFieldInvalid('name') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Nome do aluno"
                  />
                  {isFieldInvalid('name') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Nome do aluno é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Como gosta de ser chamado(a)</label>
                  <input 
                    name="nickname"
                    value={profile.nickname}
                    onChange={handleTextChange}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm"
                    placeholder="Apelido / Preferência"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Data de Nasc. <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="birthday"
                      value={profile.birthday}
                      onChange={handleTextChange}
                      maxLength={10}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm text-center ${
                        isFieldInvalid('birthday') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="DD/MM/AAAA"
                    />
                    {isFieldInvalid('birthday') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Obrigatório</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Idade <span className="text-red-500">*</span></label>
                    <input 
                      required
                      type="number"
                      name="age"
                      value={profile.age}
                      onChange={handleTextChange}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm text-center ${
                        isFieldInvalid('age') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="Anos"
                    />
                    {isFieldInvalid('age') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Obrigatório</span>}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Escola Atual (se houver)</label>
                  <input 
                    name="school"
                    value={profile.school}
                    onChange={handleTextChange}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm"
                    placeholder="Escola de origem"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Ano / Série</label>
                  <input 
                    name="grade"
                    value={profile.grade}
                    onChange={handleTextChange}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm"
                    placeholder="Série atual"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Nome do Responsável (que preenche) e Grau de Parentesco <span className="text-red-500">*</span></label>
                  <input 
                    required
                    name="guardianNameRelation"
                    value={profile.guardianNameRelation}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm ${
                      isFieldInvalid('guardianNameRelation') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Maria (Mãe), João (Pai), Pedro (Tio)..."
                  />
                  {isFieldInvalid('guardianNameRelation') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Responsável e parentesco são obrigatórios</span>}
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Telefone de Contato (WhatsApp) <span className="text-red-500">*</span></label>
                  <input 
                    required
                    name="phone"
                    value={profile.phone}
                    onChange={handleTextChange}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm font-mono ${
                      isFieldInvalid('phone') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="(XX) 99999-9999"
                  />
                  {isFieldInvalid('phone') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Telefone de contato é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 2 */}
          {currentStep === 2 && (
            <FormSection title="2. Contexto" icon={<Activity size={20} />} color="text-emerald-600">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Possui diagnóstico? Qual(is)? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="diagnosis"
                    value={profile.diagnosis}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('diagnosis') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: TEA (Autismo), TDAH, TOD, etc. Se não possuir diagnóstico fechado, escreva 'Não possui' ou 'Em avaliação'."
                  />
                  {isFieldInvalid('diagnosis') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Está em acompanhamento com outros profissionais atualmente?</label>
                  <textarea 
                    name="professionals"
                    value={profile.professionals}
                    onChange={handleTextChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Ex: Terapeuta Ocupacional, Fonoaudiólogo, Psicopedagoga, Neurologista, etc."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Faz uso de alguma medicação? Qual, dose e horário?</label>
                  <textarea 
                    name="medications"
                    value={profile.medications}
                    onChange={handleTextChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Ex: Ritalina 10mg após o almoço. Se não usar, escreva 'Não faz uso'."
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 3 */}
          {currentStep === 3 && (
            <FormSection title="3. Comunicação" icon={<MessageSquare size={20} />} color="text-teal-600">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Como a criança/adolescente costuma se comunicar? <span className="text-red-500">*</span></label>
                  <div className={`grid grid-cols-1 gap-2.5 p-1 rounded-xl ${isFieldInvalid('communicationMethod') ? 'border border-red-400 bg-red-50/10' : ''}`}>
                    {commOptions.map((opt, idx) => (
                      <label key={idx} className={`flex items-start gap-3 p-3 rounded-xl border transition-all cursor-pointer ${profile.communicationMethod === opt ? 'bg-brand-green/5 border-brand-green/30 text-brand-green' : 'bg-gray-50 border-gray-100 hover:bg-gray-100 text-gray-700'}`}>
                        <input 
                          type="radio"
                          name="communicationMethod"
                          checked={profile.communicationMethod === opt}
                          onChange={() => handleCommunicationChange(opt)}
                          className="mt-1 text-brand-green focus:ring-brand-green"
                        />
                        <span className="text-xs font-medium">{opt}</span>
                      </label>
                    ))}
                  </div>
                  {isFieldInvalid('communicationMethod') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Por favor, escolha uma opção</span>}
                </div>

                {profile.communicationMethod === 'Outra forma — descrever abaixo' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Descreva a outra forma de comunicação <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      name="communicationOtherDesc"
                      value={profile.communicationOtherDesc}
                      onChange={handleTextChange}
                      rows={2}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                        isFieldInvalid('communicationOtherDesc') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="Descreva detalhadamente..."
                    />
                    {isFieldInvalid('communicationOtherDesc') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Compreende bem instruções verbais simples? E instruções com mais de um passo? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="comprehension"
                    value={profile.comprehension}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('comprehension') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Compreende instruções diretas de um passo (ex: 'guarde o sapato'), mas tem dificuldade se forem múltiplos passos ao mesmo tempo."
                  />
                  {isFieldInvalid('comprehension') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 4 */}
          {currentStep === 4 && (
            <FormSection title="4. Processamento Sensorial" icon={<Sparkles size={20} />} color="text-indigo-600">
              <p className="text-[11px] text-gray-400 font-medium -mt-2 leading-relaxed uppercase tracking-wider">Marque o que se aplica. Isso ajuda a preparar o ambiente antes do primeiro encontro.</p>
              <div className="space-y-6">
                
                {/* Sounds */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Volume2 size={14} className="text-indigo-500" /> Sensibilidade a sons
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Incomoda-se com barulhos altos ou inesperados",
                      "Busca sons repetitivos ou ruído de fundo",
                      "Não apresenta sensibilidade perceptível"
                    ].map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-all">
                        <input 
                          type="checkbox"
                          checked={profile.sensorialSounds.includes(opt)}
                          onChange={() => handleCheckboxChange('sensorialSounds', opt)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Lights */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Eye size={14} className="text-indigo-500" /> Sensibilidade a luz e visual
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Incomoda-se com light forte ou ambientes muito estimulantes visualmente",
                      "Gosta de observar objetos que giram, luzes ou reflexos",
                      "Não apresenta sensibilidade perceptível"
                    ].map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-all">
                        <input 
                          type="checkbox"
                          checked={profile.sensorialLights.includes(opt)}
                          onChange={() => handleCheckboxChange('sensorialLights', opt)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Touch */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Hand size={14} className="text-indigo-500" /> Toque e textura
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Evita certos tecidos, etiquetas ou texturas de roupa",
                      "Evita ser tocado(a) sem aviso",
                      "Busca contato físico, apertos firmes ou abraços fortes",
                      "Leva objetos à boca ou busca mastigar"
                    ].map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-all">
                        <input 
                          type="checkbox"
                          checked={profile.sensorialTouch.includes(opt)}
                          onChange={() => handleCheckboxChange('sensorialTouch', opt)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Movement */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5 border-b border-gray-100 pb-1.5">
                    <Activity size={14} className="text-indigo-500" /> Movimento e corpo
                  </h4>
                  <div className="space-y-2">
                    {[
                      "Precisa se movimentar com frequência (balançar, pular, andar)",
                      "Evita atividades com movimento, altura ou desequilíbrio",
                      "Apresenta estereotipias (balançar mãos, corpo, repetir movimentos)"
                    ].map((opt, idx) => (
                      <label key={idx} className="flex items-center gap-3 text-xs text-gray-600 cursor-pointer hover:text-gray-900 transition-all">
                        <input 
                          type="checkbox"
                          checked={profile.sensorialMovement.includes(opt)}
                          onChange={() => handleCheckboxChange('sensorialMovement', opt)}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Sensor Notes */}
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Outras observações sensoriais importantes:</label>
                  <textarea 
                    name="sensorialNotes"
                    value={profile.sensorialNotes}
                    onChange={handleTextChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Ex: Não suporta texturas molhadas ou pastosas nas mãos..."
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 5 */}
          {currentStep === 5 && (
            <FormSection title="5. Comportamento e Regulação Emocional" icon={<Brain size={20} />} color="text-purple-600">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Como costuma reagir quando está frustrado(a), ansioso(a) ou sobrecarregado(a)? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="emotionalReaction"
                    value={profile.emotionalReaction}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('emotionalReaction') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Choro, gritos, isolamento, agressividade, imobilidade, fuga, estereotipias intensas..."
                  />
                  {isFieldInvalid('emotionalReaction') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Existem sinais de alerta que indicam que uma crise está próxima? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="emotionalTriggers"
                    value={profile.emotionalTriggers}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('emotionalTriggers') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Começa a tampar os ouvidos, fica muito inquieto, respiração acelera..."
                  />
                  {isFieldInvalid('emotionalTriggers') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">O que costuma ajudar a acalmar nesses momentos? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="emotionalCalming"
                    value={profile.emotionalCalming}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('emotionalCalming') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Ficar num local isolado, ouvir música calma, uso de mordedor, abraço de pressão..."
                  />
                  {isFieldInvalid('emotionalCalming') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">O que NÃO deve ser feito nesses momentos? (o que piora a situação) <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="emotionalWhatToAvoid"
                    value={profile.emotionalWhatToAvoid}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('emotionalWhatToAvoid') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Falar alto, tocá-la sem permissão, pressionar para que responda rapidamente..."
                  />
                  {isFieldInvalid('emotionalWhatToAvoid') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 6 */}
          {currentStep === 6 && (
            <FormSection title="6. Rotina, Alimentação e Sono" icon={<Clock size={20} />} color="text-cyan-600">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Lida bem com mudanças de rotina ou imprevistos? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="routineChanges"
                    value={profile.routineChanges}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('routineChanges') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Precisa de aviso prévio e uso de rotina visual para aceitar mudanças sem estresse."
                  />
                  {isFieldInvalid('routineChanges') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Possui restrições ou seletividade alimentar: <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      name="foodRestrictions"
                      value={profile.foodRestrictions}
                      onChange={handleTextChange}
                      rows={3}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                        isFieldInvalid('foodRestrictions') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="Ex: Seletividade a texturas moles; intolerância a glúten. Se não houver, escreva 'Não possui'."
                    />
                    {isFieldInvalid('foodRestrictions') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Possui dificuldades relacionadas ao sono: <span className="text-red-500">*</span></label>
                    <textarea 
                      required
                      name="sleepDifficulties"
                      value={profile.sleepDifficulties}
                      onChange={handleTextChange}
                      rows={3}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                        isFieldInvalid('sleepDifficulties') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="Ex: Acorda no meio da noite assustado; necessita de ruído branco para adormecer."
                    />
                    {isFieldInvalid('sleepDifficulties') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                  </div>
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 7 */}
          {currentStep === 7 && (
            <FormSection title="7. Interesses e Habilidades" icon={<Star size={20} />} color="text-amber-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quais são os assuntos ou atividades favoritas? (temas de hiperfoco) <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="favoriteSubjects"
                    value={profile.favoriteSubjects}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('favoriteSubjects') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Dinossauros, planetas, ler sobre aviação civil..."
                  />
                  {isFieldInvalid('favoriteSubjects') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quais os brinquedos favoritos? (ou objetos de apego) <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="favoriteToys"
                    value={profile.favoriteToys}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('favoriteToys') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Carrinhos de metal pequenos, bicho de pelúcia específico que leva para todo canto..."
                  />
                  {isFieldInvalid('favoriteToys') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Em quais situações costuma apresentar mais dificuldade? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="biggestDifficulties"
                    value={profile.biggestDifficulties}
                    onChange={handleTextChange}
                    rows={2}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('biggestDifficulties') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Transições rápidas, lidar com frustração em jogos, compartilhar brinquedos..."
                  />
                  {isFieldInvalid('biggestDifficulties') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 8 */}
          {currentStep === 8 && (
            <FormSection title="8. Interação Social" icon={<Users size={20} />} color="text-sky-600">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Como se relaciona com outras crianças/adolescentes da mesma idade? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="peerRelationship"
                    value={profile.peerRelationship}
                    onChange={handleTextChange}
                    rows={4}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('peerRelationship') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Prefere brincar sozinho, mas aceita companhia passivamente; ou busca interagir de forma impulsiva."
                  />
                  {isFieldInvalid('peerRelationship') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Como se relaciona com adultos e figuras de autoridade? <span className="text-red-500">*</span></label>
                  <textarea 
                    required
                    name="authorityRelationship"
                    value={profile.authorityRelationship}
                    onChange={handleTextChange}
                    rows={4}
                    className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none ${
                      isFieldInvalid('authorityRelationship') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                    }`}
                    placeholder="Ex: Respeita comandos de forma imediata se estabelecido vínculo de afeto; opõe-se de forma ativa se for cobrado de forma brusca."
                  />
                  {isFieldInvalid('authorityRelationship') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Este campo é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 9 */}
          {currentStep === 9 && (
            <FormSection title="9. Vida Escolar (se aplicável)" icon={<GraduationCap size={20} />} color="text-orange-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Já possui adaptações, apoio de mediador/AEE ou plano educacional individualizado?</label>
                  <textarea 
                    name="schoolAdaptations"
                    value={profile.schoolAdaptations}
                    onChange={handleTextChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Ex: Conta com mediador exclusivo na escola e adaptação curricular de pequeno porte."
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Quais situações escolares costumam ser mais desafiadoras?</label>
                  <textarea 
                    name="schoolChallenges"
                    value={profile.schoolChallenges}
                    onChange={handleTextChange}
                    rows={2}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Ex: Hora do recreio devido ao barulho excessivo, provas escritas longas..."
                  />
                </div>
              </div>
            </FormSection>
          )}

          {/* Section 10 */}
          {currentStep === 10 && (
            <FormSection title="10. Informações Adicionais" icon={<PlusCircle size={20} />} color="text-rose-500">
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Há alguma informação adicional que considere importante compartilhar?</label>
                  <textarea 
                    name="additionalInfo"
                    value={profile.additionalInfo}
                    onChange={handleTextChange}
                    rows={3}
                    className="w-full p-3 bg-gray-50 rounded-xl border border-gray-100 focus:border-brand-green focus:bg-white focus:ring-0 transition-all outline-none text-sm resize-none"
                    placeholder="Escreva aqui qualquer detalhe de saúde, segurança ou preferência que não tenha sido abordado acima."
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><Calendar size={13} /> Data do Preenchimento <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="fillDate"
                      value={profile.fillDate}
                      onChange={handleTextChange}
                      maxLength={10}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm text-center ${
                        isFieldInvalid('fillDate') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="DD/MM/AAAA"
                    />
                    {isFieldInvalid('fillDate') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Data é obrigatória</span>}
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5"><PenTool size={13} /> Assinatura do Responsável <span className="text-red-500">*</span></label>
                    <input 
                      required
                      name="guardianSignature"
                      value={profile.guardianSignature}
                      onChange={handleTextChange}
                      className={`w-full p-3 bg-gray-50 rounded-xl border focus:bg-white focus:ring-0 transition-all outline-none text-sm ${
                        isFieldInvalid('guardianSignature') ? 'border-red-400 bg-red-50/20 focus:border-red-500' : 'border-gray-100 focus:border-brand-green'
                      }`}
                      placeholder="Escreva seu nome completo"
                    />
                    {isFieldInvalid('guardianSignature') && <span className="text-red-500 text-[10px] font-bold mt-1 block">Assinatura é obrigatória</span>}
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <PenTool size={13} /> Assinatura com o Dedo ou Mouse <span className="text-red-500">*</span>
                  </label>
                  <SignaturePad 
                    onChange={(dataUrl) => setProfile(prev => ({ ...prev, guardianSignatureDraw: dataUrl }))}
                    value={profile.guardianSignatureDraw}
                    isInvalid={isFieldInvalid('guardianSignatureDraw')}
                  />
                  {isFieldInvalid('guardianSignatureDraw') && <span className="text-red-500 text-[10px] font-bold mt-1 block">O desenho da assinatura é obrigatório</span>}
                </div>
              </div>
            </FormSection>
          )}

          {/* Step Navigation Controls */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-4 border-t border-gray-100">
            {currentStep > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-6 py-3 bg-white border border-gray-200 text-gray-600 font-bold rounded-xl shadow-sm hover:bg-gray-50 hover:text-gray-800 transition-all flex items-center justify-center gap-2 text-sm cursor-pointer"
              >
                Passo Anterior
              </button>
            ) : (
              <div className="hidden sm:block"></div>
            )}

            {currentStep < 10 ? (
              <button
                type="button"
                onClick={handleNext}
                className="w-full sm:w-auto px-8 py-3 bg-brand-green text-white font-bold rounded-xl shadow-md shadow-brand-green/10 hover:bg-brand-green/90 hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ml-auto"
              >
                Próximo Passo
              </button>
            ) : (
              <button 
                type="submit" 
                className="w-full sm:w-auto px-8 py-3.5 bg-brand-green text-white font-bold rounded-xl shadow-lg shadow-brand-green/10 hover:bg-[#4cb354] hover:scale-[1.01] active:scale-[0.99] transition-all flex items-center justify-center gap-2 text-sm cursor-pointer ml-auto"
              >
                <CheckCircle2 size={16} />
                FINALIZAR E ENVIAR FICHA
              </button>
            )}
          </div>
          
          <p className="text-center text-[11px] text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">
            {currentStep < 10 
              ? "Seus dados estão sendo salvos localmente conforme você avança. Preencha todos os campos obrigatórios para prosseguir."
              : "Ao clicar, sua ficha de 10 passos será enviada e salva com total segurança no banco de dados do sistema."}
          </p>

        </div>
      </div>
    </form>
  );
};

interface SignaturePadProps {
  onChange: (dataUrl: string) => void;
  value?: string;
  isInvalid?: boolean;
}

const SignaturePad: React.FC<SignaturePadProps> = ({ onChange, value, isInvalid }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.strokeStyle = '#56C45F'; // Verde Fabrine
      ctx.lineWidth = 4;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    if (value) {
      const img = new Image();
      img.onload = () => {
        ctx?.clearRect(0, 0, canvas.width, canvas.height);
        ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
      };
      img.src = value;
    }
  }, [value]);

  const getCoordinates = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };

    const rect = canvas.getBoundingClientRect();
    let clientX = 0;
    let clientY = 0;

    if ('touches' in e) {
      if (e.touches.length === 0) return { x: 0, y: 0 };
      const touch = e.touches[0];
      clientX = touch.clientX;
      clientY = touch.clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }

    const x = ((clientX - rect.left) / rect.width) * canvas.width;
    const y = ((clientY - rect.top) / rect.height) * canvas.height;
    return { x, y };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const { x, y } = getCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);

    const canvas = canvasRef.current;
    if (canvas) {
      const dataUrl = canvas.toDataURL('image/png');
      onChange(dataUrl);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    onChange('');
  };

  return (
    <div className="space-y-1.5">
      <div className={`relative bg-gray-50 border rounded-xl overflow-hidden ${isInvalid ? 'border-red-400 bg-red-50/10' : 'border-gray-200 focus-within:border-brand-green'}`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={180}
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
          className="w-full h-36 block cursor-crosshair touch-none"
        />
        <button
          type="button"
          onClick={clearCanvas}
          className="absolute bottom-2 right-2 bg-white/95 hover:bg-white text-gray-500 hover:text-red-500 font-bold text-[10px] px-2.5 py-1 rounded-md border border-gray-100 shadow-sm transition-colors cursor-pointer"
        >
          Limpar Assinatura
        </button>
      </div>
      <p className="text-[10px] text-gray-400">Desenhe diretamente dentro do retângulo acima.</p>
    </div>
  );
};
