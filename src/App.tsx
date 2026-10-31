import React, { useState, useEffect } from 'react';
import { StudentForm } from './components/StudentForm';
import { TripDetails } from './types';
import { 
  Link as LinkIcon, 
  Check, 
  Settings, 
  MessageCircle, 
  Sliders, 
  ChevronDown, 
  ChevronUp, 
  Lock, 
  Trash2, 
  Eye, 
  LogOut, 
  Key, 
  Loader2, 
  LayoutDashboard, 
  FileText, 
  User, 
  CheckCircle2, 
  Smile, 
  Calendar, 
  Phone,
  AlertTriangle,
  HeartPulse,
  Printer,
  Search,
  Save,
  ShieldAlert,
  ClipboardCheck
} from 'lucide-react';
import { ProtocoloAnticriseModal } from './components/ProtocoloAnticriseModal';
import { 
  getBrandConfig, 
  saveBrandConfig, 
  getRegistrations, 
  deleteRegistration, 
  getAdminPassword, 
  saveAdminPassword,
  getRegistrationById,
  updateRegistration
} from './services/firebase';

// Custom UN Accessibility Logo Component
const UNAccessibilityIcon = ({ className }: { className?: string }) => (
  <svg 
    viewBox="0 0 100 100" 
    className={className}
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="50" cy="50" r="45" fill="none" stroke="currentColor" strokeWidth="6" />
    <circle cx="50" cy="22" r="7" fill="currentColor" />
    <path 
      d="M50 29 V 55 M22 40 H 78 M50 55 L 28 78 M50 55 L 72 78" 
      stroke="currentColor" 
      strokeWidth="6" 
      strokeLinecap="round" 
      strokeLinejoin="round"
      fill="none"
    />
    <circle cx="22" cy="40" r="5.5" fill="currentColor" />
    <circle cx="78" cy="40" r="5.5" fill="currentColor" />
    <circle cx="28" cy="78" r="5.5" fill="currentColor" />
    <circle cx="72" cy="78" r="5.5" fill="currentColor" />
  </svg>
);

const getWhatsAppUrl = (phone: string): string => {
  if (!phone) return '';
  const cleaned = phone.replace(/\D/g, '');
  const hasCountryCode = cleaned.startsWith('55') && cleaned.length >= 12;
  const formatted = hasCountryCode ? cleaned : `55${cleaned}`;
  return `https://wa.me/${formatted}`;
};

interface WhiteLabelSettings {
  brandName: string;
  brandTagline: string;
  brandLogo: string;
  brandColor: string;
  brandColorSec: string;
  whatsapp: string;
  doubtMsg: string;
}

const App: React.FC = () => {
  // State for Trip Details (kept in state to avoid breaking StudentForm, but hidden from UI)
  const [tripDetails] = useState<TripDetails>({
    schoolName: '',
    grade: '',
    date: '',
    destination: ''
  });

  const [brandSettings, setBrandSettings] = useState<WhiteLabelSettings>({
    brandName: '',
    brandTagline: '',
    brandLogo: '',
    brandColor: '#56C45F', // Verde Fabrine
    brandColorSec: '#F9DC3F', // Amarelo Fabrine
    whatsapp: '',
    doubtMsg: ''
  });

  // Admin authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [passwordInput, setPasswordInput] = useState('');
  const [loginError, setLoginError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  // General App views
  const [isParentMode, setIsParentMode] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(true);
  const [activeAdminTab, setActiveAdminTab] = useState<'branding' | 'registrations' | 'security'>('branding');
  const [registrations, setRegistrations] = useState<any[]>([]);
  const [selectedReg, setSelectedReg] = useState<any | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Passwords configuration
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordStatus, setPasswordStatus] = useState({ success: false, error: '' });
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  // Status Loaders
  const [isPrintMode, setIsPrintMode] = useState(false);
  const [printFichaData, setPrintFichaData] = useState<any | null>(null);
  const [printBrandSettings, setPrintBrandSettings] = useState<WhiteLabelSettings | null>(null);
  const [isLoadingPage, setIsLoadingPage] = useState(true);
  const [isLoadingRegistrations, setIsLoadingRegistrations] = useState(false);
  const [isSavingBrand, setIsSavingBrand] = useState(false);
  const [brandSaveSuccess, setBrandSaveSuccess] = useState(false);
  const [isAnticriseModalOpen, setIsAnticriseModalOpen] = useState(false);
  const [shortLink, setShortLink] = useState('');
  const [isSavingIntervention, setIsSavingIntervention] = useState(false);
  const [interventionSaveSuccess, setInterventionSaveSuccess] = useState(false);

  // Toggle protocol checklist items for the selected student
  const handleToggleProtocolItem = (category: 'sinaisAlerta' | 'autorregulacao' | 'extrasEscola', item: string) => {
    if (!selectedReg) return;
    const currentIntervention = selectedReg.protocoloIntervention || {};
    const currentList: string[] = currentIntervention[category] || [];
    const nextList = currentList.includes(item)
      ? currentList.filter((i: string) => i !== item)
      : [...currentList, item];
    
    setSelectedReg({
      ...selectedReg,
      protocoloIntervention: {
        ...currentIntervention,
        [category]: nextList
      }
    });
  };

  // Update observation text for a protocol category
  const handleUpdateProtocolObs = (field: 'sinaisAlertaObs' | 'autorregulacaoObs' | 'extrasEscolaObs', value: string) => {
    if (!selectedReg) return;
    const currentIntervention = selectedReg.protocoloIntervention || {};
    setSelectedReg({
      ...selectedReg,
      protocoloIntervention: {
        ...currentIntervention,
        [field]: value
      }
    });
  };

  // Save the professional intervention checklist & observations to Firestore
  const handleSaveIntervention = async () => {
    if (!selectedReg?.id) return;
    setIsSavingIntervention(true);
    try {
      const timestamp = new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      const interventionData = {
        ...(selectedReg.protocoloIntervention || {}),
        lastUpdated: timestamp
      };

      await updateRegistration(selectedReg.id, {
        protocoloIntervention: interventionData
      });

      // Synchronize in local registrations list and selectedReg
      setRegistrations(prev => prev.map(reg => reg.id === selectedReg.id ? { ...reg, protocoloIntervention: interventionData } : reg));
      setSelectedReg((prev: any) => ({ ...prev, protocoloIntervention: interventionData }));

      setInterventionSaveSuccess(true);
      setTimeout(() => setInterventionSaveSuccess(false), 3000);
    } catch (err) {
      console.error("Erro ao salvar acompanhamento:", err);
      alert("Erro ao salvar acompanhamento no banco de dados. Tente novamente.");
    } finally {
      setIsSavingIntervention(false);
    }
  };

  // Apply colors to CSS custom variables dynamically
  useEffect(() => {
    document.documentElement.style.setProperty('--brand-green', brandSettings.brandColor);
    document.documentElement.style.setProperty('--brand-yellow', brandSettings.brandColorSec);
  }, [brandSettings.brandColor, brandSettings.brandColorSec]);

  // Load params from URL and authenticate on mount
  useEffect(() => {
    const initApp = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        
        // 1. Check if we are in PRINT MODE
        const printParam = params.get('print');
        if (printParam) {
          setIsPrintMode(true);
          
          let loadedFicha = null;
          let loadedBrand = null;
          
          // Try loading from localStorage first (for immediate, zero-latency rendering)
          const storedFicha = localStorage.getItem('print_ficha_data');
          const storedBrand = localStorage.getItem('print_brand_settings');
          
          if (storedFicha) {
            try {
              loadedFicha = JSON.parse(storedFicha);
            } catch (e) {
              console.error(e);
            }
          }
          
          if (storedBrand) {
            try {
              loadedBrand = JSON.parse(storedBrand);
            } catch (e) {
              console.error(e);
            }
          }
          
          // If we couldn't load from localStorage or if we need a specific ID that is different
          if ((!loadedFicha || loadedFicha.id !== printParam) && printParam !== 'true') {
            const fetchedFicha = await getRegistrationById(printParam);
            if (fetchedFicha) {
              loadedFicha = fetchedFicha;
              
              if (fetchedFicha.configId) {
                const fetchedBrand = await getBrandConfig(fetchedFicha.configId);
                if (fetchedBrand) {
                  loadedBrand = {
                    brandName: fetchedBrand.brandName || '',
                    brandTagline: fetchedBrand.brandTagline || '',
                    brandLogo: fetchedBrand.brandLogo || '',
                    brandColor: fetchedBrand.brandColor || '#56C45F',
                    brandColorSec: fetchedBrand.brandColorSec || '#F9DC3F',
                    whatsapp: fetchedBrand.whatsapp || '',
                    doubtMsg: fetchedBrand.doubtMsg || ''
                  };
                }
              }
            }
          }
          
          if (loadedFicha) {
            setPrintFichaData(loadedFicha);
          }
          if (loadedBrand) {
            setPrintBrandSettings(loadedBrand);
            document.documentElement.style.setProperty('--brand-green', loadedBrand.brandColor);
            document.documentElement.style.setProperty('--brand-yellow', loadedBrand.brandColorSec);
          } else {
            // Fallback default colors
            document.documentElement.style.setProperty('--brand-green', '#56C45F');
            document.documentElement.style.setProperty('--brand-yellow', '#F9DC3F');
          }
          
          setIsLoadingPage(false);
          return;
        }

        const configId = params.get('c') || params.get('configId');
        let loadedConfig = null;

        if (configId) {
          // PARENT/CLIENT MODE: Load specific brand configuration from Firebase
          setIsParentMode(true);
          loadedConfig = await getBrandConfig(configId);
        } else {
          // ADMIN/AGENCY MODE: Check session storage login state, and load global default brand configuration
          setIsParentMode(false);
          loadedConfig = await getBrandConfig("default");
          const sessionLoggedIn = sessionStorage.getItem('isAdminLoggedIn') === 'true';
          if (sessionLoggedIn) {
            setIsLoggedIn(true);
            await fetchRegistrationsList();
          }
        }

        if (loadedConfig) {
          setBrandSettings({
            brandName: loadedConfig.brandName || '',
            brandTagline: loadedConfig.brandTagline || '',
            brandLogo: loadedConfig.brandLogo || '',
            brandColor: loadedConfig.brandColor || '#56C45F',
            brandColorSec: loadedConfig.brandColorSec || '#F9DC3F',
            whatsapp: loadedConfig.whatsapp || '',
            doubtMsg: loadedConfig.doubtMsg || ''
          });
        }
      } catch (err) {
        console.error("Initialization error:", err);
      } finally {
        setIsLoadingPage(false);
      }
    };

    initApp();
  }, []);

  // Trigger automatic printing on mount if in print mode and data is available
  useEffect(() => {
    if (isPrintMode && printFichaData) {
      const timer = setTimeout(() => {
        try {
          window.focus();
          window.print();
        } catch (e) {
          console.error("Automatic print failed:", e);
        }
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [isPrintMode, printFichaData]);

  // Fetch registrations from database
  const fetchRegistrationsList = async () => {
    setIsLoadingRegistrations(true);
    try {
      const data = await getRegistrations();
      setRegistrations(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingRegistrations(false);
    }
  };

  // Handle Admin Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoggingIn(true);
    setLoginError('');
    try {
      const realPassword = await getAdminPassword();
      if (passwordInput === realPassword) {
        setIsLoggedIn(true);
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        await fetchRegistrationsList();
      } else {
        setLoginError('Senha administrativa incorreta. Tente novamente.');
      }
    } catch (err) {
      console.error(err);
      setLoginError('Falha ao autenticar. Verifique sua conexão.');
    } finally {
      setIsLoggingIn(false);
    }
  };

  // Handle Logout
  const handleLogout = () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    setIsLoggedIn(false);
    setPasswordInput('');
    setRegistrations([]);
  };

  // Handle Admin Password Change
  const handleChangePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordStatus({ success: false, error: '' });
    if (!newPassword) {
      setPasswordStatus({ success: false, error: 'A nova senha não pode estar em branco.' });
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordStatus({ success: false, error: 'As senhas não coincidem.' });
      return;
    }

    setIsChangingPassword(true);
    try {
      await saveAdminPassword(newPassword);
      setPasswordStatus({ success: true, error: '' });
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error(err);
      setPasswordStatus({ success: false, error: 'Erro ao salvar a senha no banco de dados.' });
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Save default brand settings in Firestore
  const handleSaveBrandSettings = async () => {
    setIsSavingBrand(true);
    setBrandSaveSuccess(false);
    try {
      await saveBrandConfig(brandSettings, "default");
      setBrandSaveSuccess(true);
      setTimeout(() => setBrandSaveSuccess(false), 5000);
    } catch (err) {
      console.error("Error saving default brand settings:", err);
      alert("Houve um erro ao salvar as configurações no Firebase. Tente novamente.");
    } finally {
      setIsSavingBrand(false);
    }
  };

  // Copy unique slug link for parent form submission
  const handleCopyFormLink = async () => {
    try {
      const formLink = `${window.location.origin}/?c=default`;
      await navigator.clipboard.writeText(formLink);
      setLinkCopied(true);
      setTimeout(() => setLinkCopied(false), 4000);
    } catch (err) {
      console.error("Error copying link:", err);
      alert("Houve um erro ao copiar o link. Tente copiar manualmente.");
    }
  };

  // Handle Student Registration Delete
  const handleDeleteReg = async (id: string) => {
    if (confirm("Tem certeza que deseja excluir permanentemente este cadastro do sistema?")) {
      try {
        await deleteRegistration(id);
        setRegistrations(prev => prev.filter(item => item.id !== id));
        if (selectedReg && selectedReg.id === id) {
          setSelectedReg(null);
        }
      } catch (err) {
        console.error(err);
        alert("Erro ao excluir o cadastro.");
      }
    }
  };

  // Botão de contato para os pais (Rodapé)
  const contactAgency = () => {
    const phone = brandSettings.whatsapp || '5511999999999';
    const msg = brandSettings.doubtMsg || 'Olá, estou preenchendo o formulário e tenho uma dúvida.';
    const formattedPhone = phone.replace(/\D/g, '');
    const message = encodeURIComponent(msg);
    window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank');
  };

  // Handle high quality printing by saving to localStorage and opening a new tab
  const handlePrint = (regToPrint: any) => {
    try {
      localStorage.setItem('print_ficha_data', JSON.stringify(regToPrint));
      localStorage.setItem('print_brand_settings', JSON.stringify(brandSettings));
      
      const printUrl = `${window.location.origin}${window.location.pathname}?print=${regToPrint.id}`;
      const printWindow = window.open(printUrl, '_blank');
      
      if (!printWindow) {
        alert("O seu navegador bloqueou a abertura da janela de impressão. Por favor, libere os pop-ups para imprimir em alta qualidade.");
        window.focus();
        window.print();
      }
    } catch (err) {
      console.error("Print error, trying fallback:", err);
      window.focus();
      window.print();
    }
  };

  // Logo uploader that covers, centers and fits perfectly on a 200x200 square canvas without safe padding borders
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const SIZE = 200; // Perfect square canvas
        canvas.width = SIZE;
        canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Clear and prepare transparency support
          ctx.clearRect(0, 0, SIZE, SIZE);
          
          let drawWidth = img.width;
          let drawHeight = img.height;
          
          // Cover the 200x200 canvas proportionally and center it perfectly
          const scale = Math.max(SIZE / drawWidth, SIZE / drawHeight);
          const drawW = drawWidth * scale;
          const drawH = drawHeight * scale;
          
          const x = (SIZE - drawW) / 2;
          const y = (SIZE - drawH) / 2;
          
          ctx.drawImage(img, x, y, drawW, drawH);
          
          // Use 'image/png' to preserve transparency of transparent logos
          const compressedBase64 = canvas.toDataURL('image/png');
          setBrandSettings(prev => ({ ...prev, brandLogo: compressedBase64 }));
        }
      };
      if (event.target?.result) {
        img.src = event.target.result as string;
      }
    };
    reader.readAsDataURL(file);
  };

  if (isLoadingPage) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex flex-col items-center justify-center p-4">
        <Loader2 className="text-brand-green animate-spin" size={48} />
        <p className="text-sm font-bold text-gray-500 mt-4 font-sans">Carregando M.A.P.A. ...</p>
      </div>
    );
  }

  // PRINT PREVIEW MODE (Renders a high quality, paper-optimized, non-scrollable document ready for PDF/Printer)
  if (isPrintMode) {
    if (!printFichaData) {
      return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
          <Loader2 className="text-brand-green animate-spin" size={48} />
          <p className="text-sm font-bold text-gray-500 mt-4 font-sans">Carregando dados para impressão...</p>
        </div>
      );
    }

    const brand = printBrandSettings || brandSettings;

    return (
      <div className="bg-white min-h-screen text-slate-900 font-sans p-0 m-0">
        {/* Print Top bar - hidden on print */}
        <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center no-print border-b border-gray-800">
          <div className="flex items-center gap-2">
            <Printer size={16} className="text-brand-green" />
            <span className="text-xs font-bold uppercase tracking-wider">Modo de Impressão de Alta Qualidade</span>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                try {
                  window.focus();
                  window.print();
                } catch (e) {
                  console.error(e);
                }
              }} 
              className="bg-brand-green hover:bg-opacity-95 text-white text-xs font-bold px-4 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow"
            >
              <Printer size={14} /> Imprimir Ficha
            </button>
            <button 
              onClick={() => window.close()} 
              className="bg-slate-700 hover:bg-slate-600 text-white text-xs font-bold px-4 py-2 rounded-xl cursor-pointer"
            >
              Fechar Aba
            </button>
          </div>
        </div>

        {/* Printable Paper Container */}
        <div className="max-w-4xl mx-auto p-6 md:p-10 bg-white space-y-8" id="print-area">
          
          {/* Brand Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b-2 border-brand-green pb-6 gap-4">
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              {/* Official M.A.P.A FabrineF. Branding (Always present) */}
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-100 flex items-center justify-center bg-white shrink-0 shadow-sm">
                  <img src="https://i.ibb.co/tTJkBTHZ/mapa-kids.png" alt="Logo M.A.P.A FabrineF." className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
                <div className="text-left">
                  <h1 className="uppercase text-sm font-black tracking-tight text-gray-900">M.A.P.A FabrineF.</h1>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Acolhimento & Apoio</p>
                </div>
              </div>

              {/* Dynamic Partner / Custom Brand Branding */}
              {brand.brandName && brand.brandName !== 'M.A.P.A FabrineF.' && brand.brandName !== 'M.A.P.A. FF' && brand.brandName !== 'SUA MARCA' && (
                <>
                  <div className="h-10 w-px bg-gray-200 hidden sm:block" />
                  <div className="flex items-center gap-3">
                    {brand.brandLogo ? (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shrink-0 shadow-sm">
                        <img src={brand.brandLogo} alt="Logo Parceiro" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                      </div>
                    ) : (
                      <div className="w-14 h-14 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-gray-50 shrink-0 shadow-sm">
                        <span className="text-xs font-bold text-gray-400 uppercase">Logo</span>
                      </div>
                    )}
                    <div className="text-left">
                      <h2 className="uppercase text-sm font-black tracking-tight text-brand-green">{brand.brandName}</h2>
                      <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{brand.brandTagline || 'Apoio Pedagógico Autorizado'}</p>
                    </div>
                  </div>
                </>
              )}
            </div>
            
            <div className="text-right flex flex-col items-end shrink-0 sm:self-center">
              <span className="text-[9px] text-gray-400 font-mono">ID: {printFichaData.id}</span>
              <span className="text-[10px] bg-brand-light text-brand-green px-2.5 py-1 rounded-full font-bold uppercase mt-1">FICHA DE APOIO M.A.P.A.</span>
            </div>
          </div>

          {/* Student Profile Block */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
            {/* Photo */}
            <div className="md:col-span-1 flex flex-col items-center text-center">
              <div className="w-28 h-28 rounded-2xl bg-white border border-brand-green/20 overflow-hidden flex items-center justify-center shadow-sm mb-2">
                {printFichaData.photo ? (
                  <img src={printFichaData.photo} alt={printFichaData.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                ) : (
                  <Smile className="text-brand-green" size={48} />
                )}
              </div>
              <h2 className="font-extrabold text-gray-950 text-sm">{printFichaData.name}</h2>
              {printFichaData.nickname && <p className="text-xs text-gray-400 italic">Apelido: {printFichaData.nickname}</p>}
            </div>

            {/* General Identification */}
            <div className="md:col-span-3 space-y-3">
              <h3 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1 border-b border-brand-green/10 pb-1.5">
                <User size={13} /> 1. Identificação Geral
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 text-xs">
                <p><strong>Nascimento:</strong> {printFichaData.birthday}</p>
                <p><strong>Idade:</strong> {printFichaData.age} anos</p>
                <p><strong>Responsável:</strong> {printFichaData.guardianNameRelation}</p>
                <p><strong>Telefone:</strong> {printFichaData.phone}</p>
                <p><strong>Escola Atual:</strong> {printFichaData.school || '-'}</p>
                <p><strong>Série/Ano:</strong> {printFichaData.grade || '-'}</p>
              </div>
            </div>
          </div>

          {/* Pedagogical Sections Block */}
          <div className="space-y-6">
            
            {/* 2. Contexto Clínico */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1 border-b border-red-100 pb-1.5">
                <HeartPulse size={14} /> 2. Contexto Clínico
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Possui laudo/diagnóstico?</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.diagnosis || 'Não relatado'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Acompanhamentos profissionais:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.professionals || 'Nenhum'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Uso de medicações contínuas:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.medications || 'Nenhuma'}</p>
                </div>
              </div>
            </div>

            {/* 3. Comunicação & Fala */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#68C9EA] uppercase tracking-wider flex items-center gap-1 border-b border-[#68C9EA]/20 pb-1.5">
                <MessageCircle size={14} /> 3. Comunicação & Fala
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Forma primária de comunicação:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.communicationMethod || 'Não informado'}</p>
                  {printFichaData.communicationOtherDesc && (
                    <p className="mt-2"><strong>Observações de fala:</strong> {printFichaData.communicationOtherDesc}</p>
                  )}
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Compreensão de comandos verbais:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.comprehension || 'Não informado'}</p>
                </div>
              </div>
            </div>

            {/* 4. Processamento Sensorial */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#FA4E74] uppercase tracking-wider flex items-center gap-1 border-b border-[#FA4E74]/20 pb-1.5">
                <AlertTriangle size={14} /> 4. Processamento Sensorial
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Reações a Sons:</span>
                  <p className="text-gray-800 bg-gray-50/50 p-2 rounded-lg">{printFichaData.sensorialSounds?.join(', ') || 'Sem reações críticas'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Estímulos Visuais:</span>
                  <p className="text-gray-800 bg-gray-50/50 p-2 rounded-lg">{printFichaData.sensorialLights?.join(', ') || 'Sem reações críticas'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Toque:</span>
                  <p className="text-gray-800 bg-gray-50/50 p-2 rounded-lg">{printFichaData.sensorialTouch?.join(', ') || 'Sem reações críticas'}</p>
                </div>
                <div>
                  <span className="font-semibold text-gray-500 block mb-1">Equilíbrio/Movimento:</span>
                  <p className="text-gray-800 bg-gray-50/50 p-2 rounded-lg">{printFichaData.sensorialMovement?.join(', ') || 'Sem reações críticas'}</p>
                </div>
              </div>
              {printFichaData.sensorialNotes && (
                <div className="bg-yellow-50/50 p-3 rounded-lg border border-yellow-100 text-xs">
                  <strong className="text-yellow-800 block text-[10px] uppercase">Notas Sensoriais Importantes:</strong>
                  <p className="text-gray-700 mt-0.5">{printFichaData.sensorialNotes}</p>
                </div>
              )}
            </div>

            {/* 5. Comportamento e Crises */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1 border-b border-purple-100 pb-1.5">
                <Sliders size={14} /> 5. Comportamento & Crises
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Como reage a frustrações ou situações de crise?</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.emotionalReaction || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Gatilhos visíveis / Sinais de alerta:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.emotionalTriggers || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">O que ajuda a acalmar / regular emocionalmente:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.emotionalCalming || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">O que deve ser evitado a todo custo:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.emotionalWhatToAvoid || '-'}</p>
                </div>
              </div>
            </div>

            {/* 6. Rotina, Alimentação e Sono */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1 border-b border-amber-100 pb-1.5">
                <Calendar size={14} /> 6. Rotina, Alimentação & Sono
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Rotina diária em casa:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.routineType || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Reação a quebras súbitas de rotina:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.routineChanges || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Restrições ou seletividade alimentar:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.foodRestrictions || '-'}</p>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Dificuldades relatadas no sono:</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.sleepDifficulties || '-'}</p>
                </div>
              </div>
            </div>

            {/* 7-9. Interesses, Interações e Escola */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-3">
              <h3 className="text-xs font-bold text-[#56C45F] uppercase tracking-wider flex items-center gap-1 border-b border-brand-green/20 pb-1.5">
                <Sliders size={14} /> 7-9. Interesses & Convivência
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs leading-relaxed">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Assuntos & Brinquedos favoritos:</p>
                  <div className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                    <p><strong>Assuntos:</strong> {printFichaData.favoriteSubjects || '-'}</p>
                    <p><strong>Brinquedos:</strong> {printFichaData.favoriteToys || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Interação Social & Relacionamento:</p>
                  <div className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100 space-y-1">
                    <p><strong>Com Colegas:</strong> {printFichaData.peerRelationship || '-'}</p>
                    <p><strong>Com Adultos/Autoridade:</strong> {printFichaData.authorityRelationship || '-'}</p>
                  </div>
                </div>
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Adaptações escolares feitas (PEI):</p>
                  <p className="text-gray-800 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{printFichaData.schoolAdaptations || 'Nenhuma'}</p>
                </div>
              </div>
            </div>

            {/* 10. Informações adicionais e Assinatura */}
            <div className="border border-gray-100 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider flex items-center gap-1 border-b border-gray-200 pb-1.5">
                <FileText size={14} /> 10. Observações Finais & Assinatura
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs">
                <div>
                  <p className="font-semibold text-gray-500 mb-1">Observações Adicionais:</p>
                  <p className="text-gray-800 bg-gray-50 p-3 rounded-lg border border-gray-100">{printFichaData.additionalInfo || 'Nenhuma observação extra.'}</p>
                </div>
                <div className="bg-brand-light/20 p-4 border border-brand-green/10 rounded-xl flex flex-col justify-between space-y-3">
                  <p><strong>Data de Preenchimento:</strong> {printFichaData.fillDate}</p>
                  <div>
                    <span className="font-bold text-[10px] text-gray-400 block uppercase tracking-wider">Assinatura Responsável</span>
                    <span className="font-hand font-extrabold text-brand-green text-lg tracking-wide block mt-1">
                      ✍️ {printFichaData.guardianSignature}
                    </span>
                    {printFichaData.guardianSignatureDraw && (
                      <div className="mt-3 pt-3 border-t border-brand-green/10">
                        <span className="font-bold text-[10px] text-gray-400 block uppercase tracking-wider mb-1">Assinatura de Punho</span>
                        <div className="bg-white border border-gray-100 rounded-lg p-1 max-w-[200px]">
                          <img src={printFichaData.guardianSignatureDraw} alt="Assinatura" className="max-h-14 w-auto block mx-auto" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* 11. Checklist & Acompanhamento do Profissional (Impresso) */}
            <div className="border border-brand-green/30 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center justify-between border-b border-brand-green/20 pb-1.5">
                <span className="flex items-center gap-1.5">
                  <ClipboardCheck size={14} /> 11. Acompanhamento & Protocolo Aplicado pelo Profissional
                </span>
                <span className="text-[9px] bg-brand-light text-brand-green px-2 py-0.5 rounded-full font-bold">USO DO PROFISSIONAL</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* 1. Sinais de Alerta */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">1. Sinais sutis de alerta:</p>
                  <ul className="space-y-1">
                    {['Motores / Estereotipias', 'Sensoriais', 'Fisiológicos', 'Gatilhos ambientais comuns'].map(item => {
                      const checked = printFichaData.protocoloIntervention?.sinaisAlerta?.includes(item);
                      return (
                        <li key={item} className={`flex items-center gap-1.5 ${checked ? 'font-bold text-brand-green' : 'text-slate-500'}`}>
                          <span>{checked ? '☑' : '☐'}</span> {item}
                        </li>
                      );
                    })}
                  </ul>
                  {printFichaData.protocoloIntervention?.sinaisAlertaObs && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      <strong>Obs:</strong> {printFichaData.protocoloIntervention.sinaisAlertaObs}
                    </div>
                  )}
                </div>

                {/* 2. Estratégias de Autorregulação */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">2. Estratégias de autorregulação:</p>
                  <ul className="space-y-1">
                    {['Pressão profunda', 'Ancoramento 5-4-3-2-1', 'Redução do estímulo sensorial', 'Co-regulação'].map(item => {
                      const checked = printFichaData.protocoloIntervention?.autorregulacao?.includes(item);
                      return (
                        <li key={item} className={`flex items-center gap-1.5 ${checked ? 'font-bold text-brand-green' : 'text-slate-500'}`}>
                          <span>{checked ? '☑' : '☐'}</span> {item}
                        </li>
                      );
                    })}
                  </ul>
                  {printFichaData.protocoloIntervention?.autorregulacaoObs && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      <strong>Obs:</strong> {printFichaData.protocoloIntervention.autorregulacaoObs}
                    </div>
                  )}
                </div>

                {/* 3. Estratégias Extras na Escola */}
                <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-900 border-b border-slate-200 pb-1">3. Estratégias extras na escola:</p>
                  <ul className="space-y-1">
                    {['Cartão de pausa visual', 'Cantinho calmo', 'Reduzir demandas', 'Transição antecipada'].map(item => {
                      const checked = printFichaData.protocoloIntervention?.extrasEscola?.includes(item);
                      return (
                        <li key={item} className={`flex items-center gap-1.5 ${checked ? 'font-bold text-brand-green' : 'text-slate-500'}`}>
                          <span>{checked ? '☑' : '☐'}</span> {item}
                        </li>
                      );
                    })}
                  </ul>
                  {printFichaData.protocoloIntervention?.extrasEscolaObs && (
                    <div className="pt-2 border-t border-slate-200 text-[11px] text-slate-700">
                      <strong>Obs:</strong> {printFichaData.protocoloIntervention.extrasEscolaObs}
                    </div>
                  )}
                </div>
              </div>

              {printFichaData.protocoloIntervention?.lastUpdated && (
                <p className="text-[10px] text-slate-400 italic text-right">
                  Registro atualizado em: {printFichaData.protocoloIntervention.lastUpdated}
                </p>
              )}
            </div>

          </div>

          {/* Print Footer */}
          <div className="pt-8 border-t border-gray-200 text-center text-gray-400 text-xs space-y-2">
            <p>© {new Date().getFullYear()} {brand.brandName || 'SUA MARCA'} - {brand.brandTagline || 'Sua Tagline'}.</p>
            <p className="flex items-center justify-center gap-1.5">
              <span>Metodologia inspirada por:</span>
              <span className="font-bold text-gray-600">Fabrine Fernandes Psicopedagoga</span>
            </p>
          </div>

        </div>
      </div>
    );
  }

  // LOGIN SCREEN (Admin panel, unauthenticated)
  if (!isParentMode && !isLoggedIn) {
    return (
      <div className="min-h-screen bg-[#FDFBF7] flex items-center justify-center p-6">
        <div className="w-full max-w-md bg-white rounded-3xl shadow-xl border border-gray-100 p-8 space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-[#56C45F]"></div>
          
          <div className="mx-auto w-16 h-16 bg-green-50 text-brand-green rounded-full flex items-center justify-center">
            <Lock size={28} />
          </div>

          <div className="space-y-2">
            <h1 className="text-2xl font-black text-gray-800 tracking-tight">Acesso Administrativo</h1>
            <p className="text-sm text-gray-400 font-semibold uppercase tracking-wider">M.A.P.A FabrineF.</p>
            <p className="text-xs text-gray-500 max-w-xs mx-auto">Digite a senha administrativa para acessar as fichas recebidas e customizar a marca.</p>
          </div>

          <form onSubmit={handleLoginSubmit} className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Senha de Acesso</label>
              <input 
                type="password"
                required
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                className="w-full p-3.5 bg-gray-50 rounded-xl border border-gray-200 focus:border-brand-green focus:bg-white outline-none text-center text-lg font-mono font-bold tracking-widest transition-all"
                placeholder="••••••••"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-lg text-center">{loginError}</p>
            )}

            <button 
              type="submit"
              disabled={isLoggingIn}
              className="w-full py-3.5 bg-brand-green hover:bg-opacity-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoggingIn ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <div className="text-[10px] text-gray-400 font-bold pt-4 border-t border-gray-100 flex items-center justify-center gap-1">
            <CheckCircle2 size={12} className="text-brand-green" /> M.A.P.A. Sistema de Apoio
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] pb-12">
      
      {/* AGENCY ADMIN PANEL HEADER & CONTENT (Only visible to Logged In Admin) */}
      {!isParentMode && isLoggedIn && (
        <div className="bg-slate-900 text-white sticky top-0 z-50 shadow-lg">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-3.5 flex flex-col md:flex-row justify-between items-center gap-4">
            
            <div className="flex items-center gap-3">
              {brandSettings.brandLogo ? (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center bg-white shrink-0 shadow-sm">
                  <img src={brandSettings.brandLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              ) : (
                <div className="w-12 h-12 rounded-full overflow-hidden border border-slate-700 flex items-center justify-center bg-white shrink-0 shadow-sm">
                  <img src="https://i.ibb.co/tTJkBTHZ/mapa-kids.png" alt="Logo M.A.P.A FabrineF." className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                </div>
              )}
              <div className="text-left">
                <h3 className="font-extrabold text-sm text-white leading-none flex items-center gap-1.5">
                  Painel de Controle
                  <span className="text-[9px] bg-white/10 px-2 py-0.5 rounded-full text-green-400 font-black">ADMIN</span>
                </h3>
                <p className="text-[10px] text-gray-400 mt-1">Gerencie logins e fichas de alunos.</p>
              </div>
            </div>

            {/* Menu Tabs */}
            <div className="flex flex-wrap items-center gap-1.5">
              <button 
                onClick={() => { setActiveAdminTab('branding'); setIsAdminPanelOpen(true); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'branding' ? 'bg-[#56C45F] text-white' : 'hover:bg-white/10 text-gray-300'}`}
              >
                Personalizar Marca
              </button>
              
              <button 
                onClick={() => { setActiveAdminTab('registrations'); setIsAdminPanelOpen(true); fetchRegistrationsList(); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all relative ${activeAdminTab === 'registrations' ? 'bg-[#56C45F] text-white' : 'hover:bg-white/10 text-gray-300'}`}
              >
                Fichas Recebidas
                {registrations.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] w-4.5 h-4.5 rounded-full flex items-center justify-center font-black animate-pulse">
                    {registrations.length}
                  </span>
                )}
              </button>

              <button 
                onClick={() => { setActiveAdminTab('security'); setIsAdminPanelOpen(true); }}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all ${activeAdminTab === 'security' ? 'bg-[#56C45F] text-white' : 'hover:bg-white/10 text-gray-300'}`}
              >
                Alterar Senha
              </button>

              <button 
                onClick={() => setIsAnticriseModalOpen(true)}
                className="px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 bg-[#56C45F] hover:bg-[#48b551] text-white cursor-pointer shadow-sm border border-[#56C45F]"
                title="Abrir Protocolo de Segurança Anticrise"
              >
                <ShieldAlert size={14} className="text-[#F9DC3F]" />
                Protocolo Anticrise
              </button>

              <div className="h-6 w-px bg-white/10 mx-1"></div>

              <button 
                onClick={handleLogout}
                className="p-1.5 hover:bg-red-500/10 hover:text-red-400 text-gray-400 rounded-lg transition-colors"
                title="Sair do Painel"
              >
                <LogOut size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Admin Panel Drawer Content Container */}
      {!isParentMode && isLoggedIn && isAdminPanelOpen && (
        <div className="bg-white border-b border-gray-200 shadow-inner">
          <div className="max-w-5xl mx-auto px-4 md:px-8 py-6">
            
            {/* TAB 1: BRANDING PERSONALIZATION */}
            {activeAdminTab === 'branding' && (
              <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-100 pb-3">
                  <div>
                    <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                      <Sliders className="text-brand-green" size={20} />
                      Configuração Visual da Ficha
                    </h4>
                    <p className="text-xs text-gray-500 mt-1">Personalize o logotipo, slogan e contatos de WhatsApp exibidos na ficha dos pais.</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <button 
                      onClick={handleSaveBrandSettings}
                      disabled={isSavingBrand}
                      className="flex items-center gap-2 px-5 py-2.5 bg-brand-green hover:bg-opacity-95 text-white font-extrabold text-xs rounded-xl shadow-md transition-all transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      {isSavingBrand ? (
                        <Loader2 size={14} className="animate-spin" />
                      ) : (
                        <>
                          <Save size={14} />
                          Salvar Configurações da Marca
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {brandSaveSuccess && (
                  <div className="bg-green-50 border border-green-200 text-brand-green rounded-xl p-3 flex items-center gap-2.5 animate-in fade-in duration-300">
                    <CheckCircle2 size={16} className="text-brand-green shrink-0" />
                    <span className="text-xs font-bold">Configurações de marca salvas e sincronizadas com o Firebase!</span>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 text-blue-800 rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-3 animate-in fade-in duration-300">
                  <div className="text-xs font-bold leading-tight flex flex-wrap items-center justify-center sm:justify-start gap-1.5 text-center sm:text-left">
                    <CheckCircle2 size={14} className="text-blue-500 shrink-0" /> Link de Preenchimento Único para as Famílias:
                    <span className="font-mono bg-white px-2 py-1 rounded text-gray-700 select-all border border-blue-100 break-all">{`${window.location.origin}/?c=default`}</span>
                  </div>
                  <button 
                    onClick={handleCopyFormLink} 
                    className="text-xs bg-slate-800 text-white hover:bg-slate-700 font-extrabold px-3 py-1.5 rounded-lg transition-colors shrink-0 cursor-pointer"
                  >
                    Copiar Link
                  </button>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Column 1: Brand Info */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Logo e Nomes</h5>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nome da Marca</label>
                      <input 
                        type="text"
                        value={brandSettings.brandName}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, brandName: e.target.value.toUpperCase() }))}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none"
                        placeholder="Ex: MINHA AGÊNCIA"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Slogan / Tagline</label>
                      <input 
                        type="text"
                        value={brandSettings.brandTagline}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, brandTagline: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none"
                        placeholder="Ex: Viagens e Turismo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Logo da Marca (Upload)</label>
                      <div className="flex items-center gap-2">
                        <input 
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="hidden"
                          id="logo-upload"
                        />
                        <label 
                          htmlFor="logo-upload"
                          className="cursor-pointer flex items-center gap-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold px-3 py-2 rounded-lg border border-gray-200 transition-colors"
                        >
                          Selecionar Imagem
                        </label>
                        {brandSettings.brandLogo && (
                          <button 
                            onClick={() => setBrandSettings(prev => ({ ...prev, brandLogo: '' }))}
                            className="text-red-500 hover:text-red-700 text-xs font-medium"
                          >
                            Resetar
                          </button>
                        )}
                      </div>
                      {brandSettings.brandLogo && (
                        <div className="mt-2.5 w-20 h-20 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shadow-sm shrink-0">
                          <img src={brandSettings.brandLogo} alt="Preview Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Column 2: Fixed Colors */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Cores Oficiais (Logomarca Fabrine)</h5>
                    <div className="p-4 bg-gray-50 border border-gray-100 rounded-xl space-y-3.5">
                      <p className="text-[11px] text-gray-500 leading-relaxed">
                        Esta ficha utiliza de forma fixa a paleta cromática oficial da logomarca da <strong className="text-gray-700">Fabrine Fernandes</strong> para garantir harmonia, profissionalismo e acessibilidade.
                      </p>
                      
                      <div className="grid grid-cols-2 gap-2">
                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                          <span className="w-4 h-4 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: '#56C45F' }}></span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-700 leading-none">Verde</span>
                            <span className="text-[8px] font-mono text-gray-400 uppercase">#56C45F</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                          <span className="w-4 h-4 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: '#F9DC3F' }}></span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-700 leading-none">Amarelo</span>
                            <span className="text-[8px] font-mono text-gray-400 uppercase">#F9DC3F</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                          <span className="w-4 h-4 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: '#68C9EA' }}></span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-700 leading-none">Azul</span>
                            <span className="text-[8px] font-mono text-gray-400 uppercase">#68C9EA</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-gray-100 shadow-sm">
                          <span className="w-4 h-4 rounded-full shrink-0 border border-black/5" style={{ backgroundColor: '#FA4E74' }}></span>
                          <div className="flex flex-col min-w-0">
                            <span className="text-[10px] font-bold text-gray-700 leading-none">Rosa</span>
                            <span className="text-[8px] font-mono text-gray-400 uppercase">#FA4E74</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Column 3: Contacts */}
                  <div className="space-y-4">
                    <h5 className="font-semibold text-xs text-gray-400 uppercase tracking-wider">Atendimento & Whats</h5>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp de Recebimento</label>
                      <input 
                        type="text"
                        value={brandSettings.whatsapp}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, whatsapp: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none font-mono"
                        placeholder="Ex: 5511999999999"
                      />
                      <p className="text-[9px] text-gray-400 mt-1">Insira apenas os números com 55 (DDI) e o DDD.</p>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Mensagem de Dúvida (Suporte)</label>
                      <textarea 
                        value={brandSettings.doubtMsg}
                        onChange={(e) => setBrandSettings(prev => ({ ...prev, doubtMsg: e.target.value }))}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none resize-none"
                        rows={2}
                        placeholder="Ex: Olá, gostaria de tirar uma dúvida..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB 2: RECEIVED REGISTRATIONS (CADASTROS) */}
            {activeAdminTab === 'registrations' && (() => {
              const filteredAndSortedRegistrations = [...registrations]
                .filter(reg => {
                  const term = searchTerm.toLowerCase();
                  return (
                    (reg.name && reg.name.toLowerCase().includes(term)) ||
                    (reg.nickname && reg.nickname.toLowerCase().includes(term)) ||
                    (reg.guardianNameRelation && reg.guardianNameRelation.toLowerCase().includes(term))
                  );
                })
                .sort((a, b) => (a.name || '').localeCompare(b.name || '', 'pt-BR'));

              return (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-gray-100 pb-3 gap-3">
                    <div>
                      <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                        <FileText className="text-brand-green" size={20} />
                        Alunos Cadastrados no Banco de Dados ({registrations.length})
                      </h4>
                      <p className="text-xs text-gray-500 mt-1">Fichas preenchidas e enviadas pelas famílias sincronizadas em tempo real.</p>
                    </div>
                    <button 
                      onClick={fetchRegistrationsList}
                      className="text-xs bg-slate-100 hover:bg-slate-200 text-gray-700 font-bold px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer self-start sm:self-center"
                    >
                      Atualizar Lista
                    </button>
                  </div>

                  {registrations.length > 0 && (
                    <div className="relative">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
                        <Search size={16} />
                      </span>
                      <input 
                        type="text"
                        placeholder="Buscar por nome do aluno, apelido ou responsável..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full text-xs pl-10 pr-10 py-3 bg-gray-50 hover:bg-gray-100/50 focus:bg-white rounded-xl border border-gray-100 focus:border-brand-green outline-none transition-all"
                      />
                      {searchTerm && (
                        <button 
                          onClick={() => setSearchTerm('')}
                          className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 text-xs font-bold cursor-pointer"
                        >
                          Limpar
                        </button>
                      )}
                    </div>
                  )}

                  {isLoadingRegistrations ? (
                    <div className="py-12 flex flex-col items-center justify-center">
                      <Loader2 className="animate-spin text-brand-green mb-2" size={32} />
                      <p className="text-xs text-gray-500">Sincronizando com o Firestore...</p>
                    </div>
                  ) : registrations.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 border-2 border-dashed border-gray-100 rounded-3xl">
                      <Smile size={36} className="mx-auto mb-2 opacity-50" />
                      <p className="text-sm font-bold">Nenhum cadastro recebido ainda.</p>
                      <p className="text-xs text-gray-500">Compartilhe o link do formulário com as famílias para começar a receber.</p>
                    </div>
                  ) : filteredAndSortedRegistrations.length === 0 ? (
                    <div className="py-12 text-center text-gray-400 border border-dashed border-gray-150 rounded-2xl bg-gray-50/50">
                      <p className="text-sm font-bold">Nenhum aluno encontrado para "{searchTerm}".</p>
                      <p className="text-xs text-gray-500 mt-1">Verifique a escrita ou tente buscar por outro termo.</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {filteredAndSortedRegistrations.map((reg) => (
                        <div 
                          key={reg.id} 
                          className="bg-white border border-gray-100 hover:border-[#56C45F]/30 hover:shadow-md transition-all rounded-2xl p-4 flex flex-col justify-between relative overflow-hidden group shadow-sm"
                        >
                          <div className="space-y-3.5">
                            <div className="flex items-start gap-3">
                              <div className="w-14 h-14 bg-brand-light rounded-xl overflow-hidden flex items-center justify-center border border-gray-100 shrink-0">
                                {reg.photo ? (
                                  <img src={reg.photo} alt={reg.name} className="w-full h-full object-cover" />
                                ) : (
                                  <Smile className="text-brand-green/50" size={24} />
                                )}
                              </div>
                              <div className="min-w-0">
                                <h5 className="font-extrabold text-sm text-gray-800 leading-tight truncate" title={reg.name}>
                                  {reg.name}
                                </h5>
                                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                  {reg.nickname && <span>"{reg.nickname}" • </span>}
                                  <span>{reg.age} anos</span>
                                </p>
                                {reg.diagnosis && (
                                  <span className="inline-block mt-1.5 bg-red-50 text-red-500 border border-red-100 text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                                    Laudo / Diagnóstico
                                  </span>
                                )}
                              </div>
                            </div>

                            <div className="text-[11px] text-gray-600 bg-gray-50 p-2.5 rounded-lg space-y-1">
                              <p className="truncate"><strong>Responsável:</strong> {reg.guardianNameRelation}</p>
                              <p className="text-xs font-medium">
                                <a 
                                  href={getWhatsAppUrl(reg.phone)} 
                                  target="_blank" 
                                  rel="noopener noreferrer" 
                                  className="inline-flex items-center gap-1 text-gray-500 hover:text-[#25D366] transition-colors"
                                  title="Falar no WhatsApp"
                                >
                                  <Phone size={11} className="text-[#25D366]" /> {reg.phone}
                                </a>
                              </p>
                            </div>
                          </div>

                          <div className="mt-4 pt-3.5 border-t border-gray-100 flex items-center justify-between gap-2">
                            <span className="text-[9px] text-gray-400 font-mono">
                              {reg.fillDate || 'Sem Data'}
                            </span>
                            
                            <div className="flex items-center gap-1">
                              <button 
                                onClick={() => setSelectedReg(reg)}
                                className="p-1.5 hover:bg-brand-green/10 text-brand-green rounded-lg transition-colors flex items-center gap-1 text-[11px] font-bold cursor-pointer"
                                title="Visualizar Ficha Completa"
                              >
                                <Eye size={14} /> Ficha
                              </button>
                              <button 
                                onClick={() => handleDeleteReg(reg.id)}
                                className="p-1.5 hover:bg-red-50 text-red-500 rounded-lg transition-colors cursor-pointer"
                                title="Excluir do Sistema"
                              >
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* TAB 3: ADMIN SECURITY (PASSWORD) */}
            {activeAdminTab === 'security' && (
              <div className="space-y-6 max-w-lg">
                <div>
                  <h4 className="font-bold text-gray-800 text-lg flex items-center gap-2">
                    <Key className="text-brand-green" size={20} />
                    Segurança do Painel
                  </h4>
                  <p className="text-xs text-gray-500 mt-1">Altere a senha que dá acesso ao painel de controle administrativo em múltiplos aparelhos.</p>
                </div>

                <form onSubmit={handleChangePasswordSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Nova Senha</label>
                      <input 
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none"
                        placeholder="Ex: novaSenha123"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">Confirmar Nova Senha</label>
                      <input 
                        type="password"
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className="w-full text-xs p-2.5 bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-green outline-none"
                        placeholder="Repita a senha"
                      />
                    </div>
                  </div>

                  {passwordStatus.error && (
                    <p className="text-xs text-red-500 font-bold bg-red-50 p-2.5 rounded-lg">{passwordStatus.error}</p>
                  )}
                  {passwordStatus.success && (
                    <p className="text-xs text-green-600 font-bold bg-green-50 p-2.5 rounded-lg flex items-center gap-1.5">
                      <CheckCircle2 size={13} /> Senha administrativa atualizada com sucesso no banco de dados!
                    </p>
                  )}

                  <button 
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-6 py-2.5 bg-brand-green hover:bg-opacity-95 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    {isChangingPassword ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      'Salvar Nova Senha'
                    )}
                  </button>
                </form>
              </div>
            )}

          </div>
        </div>
      )}

      {/* DETAIL MODAL: READ-ONLY STUDENT FORM ANSWERS */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div id="printable-ficha" className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[85vh] overflow-y-auto flex flex-col animate-in fade-in zoom-in duration-300">
            
            {/* Modal Header */}
            <div className="bg-slate-900 text-white px-6 py-4 flex justify-between items-center sticky top-0 z-10 border-b border-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-brand-light overflow-hidden flex items-center justify-center shrink-0 border border-white/10">
                  {selectedReg.photo ? (
                    <img src={selectedReg.photo} alt={selectedReg.name} className="w-full h-full object-cover" />
                  ) : (
                    <Smile className="text-brand-green" size={20} />
                  )}
                </div>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm leading-none text-white">{selectedReg.name}</h3>
                  <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold">Ficha de Apoio Completa (M.A.P.A.)</p>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1 no-print">
                <div className="flex items-center gap-2">
                  <button 
                    onClick={() => handlePrint(selectedReg)}
                    className="text-xs bg-brand-green hover:bg-opacity-90 text-white px-3.5 py-1.5 rounded-full font-bold transition-all flex items-center gap-1.5 shadow cursor-pointer"
                    title="Imprimir Ficha em alta qualidade"
                  >
                    <Printer size={13} />
                    Imprimir Ficha
                  </button>
                  <button 
                    onClick={() => setSelectedReg(null)}
                    className="text-xs bg-white/10 hover:bg-white/20 text-white px-3.5 py-1.5 rounded-full font-bold transition-all cursor-pointer"
                  >
                    Fechar Ficha
                  </button>
                </div>
                <span className="text-[9px] text-gray-400">Se a impressão não abrir no painel, clique no ícone de nova aba no topo direito.</span>
              </div>
            </div>

            {/* Modal Content */}
            <div className="p-6 md:p-8 space-y-6 overflow-y-auto text-left">
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                
                {/* Visual Header card */}
                <div className="bg-brand-light/30 border border-brand-green/10 rounded-2xl p-5 flex flex-col items-center justify-center text-center">
                  <div className="w-28 h-28 rounded-2xl bg-white border border-brand-green/20 overflow-hidden flex items-center justify-center shadow-sm mb-3">
                    {selectedReg.photo ? (
                      <img src={selectedReg.photo} alt={selectedReg.name} className="w-full h-full object-cover" />
                    ) : (
                      <Smile className="text-brand-green" size={48} />
                    )}
                  </div>
                  <h4 className="font-bold text-gray-800 text-sm">{selectedReg.name}</h4>
                  <p className="text-xs text-gray-400 mt-0.5">Apelido: {selectedReg.nickname || '-'}</p>
                </div>

                {/* Identificação Details block */}
                <div className="md:col-span-2 space-y-3.5 bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-xs font-bold text-brand-green uppercase tracking-wider flex items-center gap-1">
                    <User size={13} /> 1. Identificação Geral
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-xs">
                    <p><strong>Nascimento:</strong> {selectedReg.birthday}</p>
                    <p><strong>Idade:</strong> {selectedReg.age} anos</p>
                    <p><strong>Responsável:</strong> {selectedReg.guardianNameRelation}</p>
                    <p>
                      <strong>Telefone:</strong>{' '}
                      <a 
                        href={getWhatsAppUrl(selectedReg.phone)} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-brand-green hover:underline hover:text-[#25D366] transition-colors"
                        title="Falar no WhatsApp"
                      >
                        {selectedReg.phone} (WhatsApp)
                      </a>
                    </p>
                    <p><strong>Escola Atual:</strong> {selectedReg.school || '-'}</p>
                    <p><strong>Série/Ano:</strong> {selectedReg.grade || '-'}</p>
                  </div>
                </div>
              </div>

              {/* Grid of structured pedagogical sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                
                {/* 2. Contexto Clínico */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider flex items-center gap-1">
                    <HeartPulse size={14} /> 2. Contexto Clínico
                  </h4>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><strong>Possui laudo/diagnóstico?</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.diagnosis || 'Nenhum'}</p>
                    
                    <p><strong>Acompanhamentos profissionais:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.professionals || 'Nenhum'}</p>
                    
                    <p><strong>Uso de medicações contínuas:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.medications || 'Nenhuma'}</p>
                  </div>
                </div>

                {/* 3. Comunicação e Compreensão */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-[#68C9EA] uppercase tracking-wider flex items-center gap-1">
                    <MessageCircle size={14} /> 3. Comunicação & Fala
                  </h4>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><strong>Forma primária de comunicação:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.communicationMethod || 'Não informado'}</p>
                    {selectedReg.communicationOtherDesc && (
                      <p><strong>Outras descrições de fala:</strong> <span className="text-gray-600 bg-gray-50 px-2 py-1 rounded">{selectedReg.communicationOtherDesc}</span></p>
                    )}
                    
                    <p><strong>Compreensão de comandos verbais:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.comprehension || 'Não informado'}</p>
                  </div>
                </div>

                {/* 4. Processamento Sensorial */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-[#FA4E74] uppercase tracking-wider flex items-center gap-1">
                    <AlertTriangle size={14} /> 4. Processamento Sensorial
                  </h4>
                  <div className="text-xs space-y-2.5 leading-relaxed">
                    <div>
                      <span className="font-semibold block text-gray-500 mb-1">Reações a Sons:</span>
                      <p className="text-gray-600">{selectedReg.sensorialSounds?.join(', ') || 'Sem observações'}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 mb-1">Luzes & Estímulos Visuais:</span>
                      <p className="text-gray-600">{selectedReg.sensorialLights?.join(', ') || 'Sem observações'}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 mb-1">Sensibilidade ao Toque:</span>
                      <p className="text-gray-600">{selectedReg.sensorialTouch?.join(', ') || 'Sem observações'}</p>
                    </div>
                    <div>
                      <span className="font-semibold block text-gray-500 mb-1">Movimentos & Equilíbrio:</span>
                      <p className="text-gray-600">{selectedReg.sensorialMovement?.join(', ') || 'Sem observações'}</p>
                    </div>
                    {selectedReg.sensorialNotes && (
                      <div className="bg-yellow-50 p-2.5 rounded-lg border border-yellow-100">
                        <span className="font-bold block text-yellow-800 text-[10px] uppercase">Observações Sensoriais Importantes</span>
                        <p className="text-gray-600 mt-0.5">{selectedReg.sensorialNotes}</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* 5. Comportamento e Crises */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-purple-600 uppercase tracking-wider flex items-center gap-1">
                    <Sliders size={14} /> 5. Comportamento & Crises
                  </h4>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><strong>Como reage a frustrações ou situações de crise?</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.emotionalReaction || '-'}</p>

                    <p><strong>Gatilhos visíveis / Sinais de alerta:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.emotionalTriggers || '-'}</p>

                    <p><strong>O que ajuda a acalmar / regular emocionalmente:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.emotionalCalming || '-'}</p>

                    <p><strong>O que deve ser evitado a todo custo:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.emotionalWhatToAvoid || '-'}</p>
                  </div>
                </div>

                {/* 6. Rotina, Alimentação e Sono */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-amber-600 uppercase tracking-wider flex items-center gap-1">
                    <Calendar size={14} /> 6. Rotina, Alimentação & Sono
                  </h4>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><strong>Rotina diária em casa:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.routineType || '-'}</p>

                    <p><strong>Reação a quebras súbitas de rotina:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.routineChanges || '-'}</p>

                    <p><strong>Restrições ou seletividade alimentar:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.foodRestrictions || '-'}</p>

                    <p><strong>Dificuldades relatadas no sono:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.sleepDifficulties || '-'}</p>
                  </div>
                </div>

                {/* 7-9. Interesses, Interações e Escola */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 space-y-2.5">
                  <h4 className="text-xs font-bold text-[#56C45F] uppercase tracking-wider flex items-center gap-1">
                    <Sliders size={14} /> 7-9. Interesses & Convivência
                  </h4>
                  <div className="text-xs space-y-2 leading-relaxed">
                    <p><strong>Assuntos e brinquedos favoritos:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <strong>Assuntos:</strong> {selectedReg.favoriteSubjects || '-'}<br/>
                      <strong>Brinquedos:</strong> {selectedReg.favoriteToys || '-'}
                    </p>

                    <p><strong>Interação social com colegas e autoridades:</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">
                      <strong>Colegas:</strong> {selectedReg.peerRelationship || '-'}<br/>
                      <strong>Adultos:</strong> {selectedReg.authorityRelationship || '-'}
                    </p>

                    <p><strong>Adaptações escolares feitas (PEI):</strong></p>
                    <p className="text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-100">{selectedReg.schoolAdaptations || 'Nenhuma'}</p>
                  </div>
                </div>

              </div>

              {/* 10. Informações adicionais e Assinatura */}
              <div className="pt-6 border-t border-gray-100 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div>
                  <h5 className="font-bold text-gray-500 uppercase tracking-widest text-[10px]">Informações Adicionais:</h5>
                  <p className="text-gray-600 bg-gray-50 p-3 rounded-lg mt-1">{selectedReg.additionalInfo || 'Nenhuma observação extra.'}</p>
                </div>
                <div className="bg-brand-light/20 p-4 border border-brand-green/10 rounded-xl flex flex-col justify-between">
                  <p><strong>Data de Preenchimento:</strong> {selectedReg.fillDate}</p>
                  <div className="mt-3">
                    <span className="font-bold text-[10px] text-gray-400 block uppercase tracking-wider">Assinatura Digital</span>
                    <span className="font-hand font-extrabold text-brand-green text-lg tracking-wide select-none block mt-1">
                      ✍️ {selectedReg.guardianSignature}
                    </span>
                    {selectedReg.guardianSignatureDraw && (
                      <div className="mt-3 pt-3 border-t border-brand-green/10">
                        <span className="font-bold text-[10px] text-gray-400 block uppercase tracking-wider mb-1">Assinatura de Punho</span>
                        <div className="bg-white border border-gray-100 rounded-lg p-1.5 max-w-[200px] mt-1">
                          <img src={selectedReg.guardianSignatureDraw} alt="Assinatura" className="max-h-16 w-auto block mx-auto" referrerPolicy="no-referrer" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* CHECKLIST DE INTERVENÇÃO & PROTOCOLO (USO EXCLUSIVO DO PROFISSIONAL) */}
              <div className="pt-6 border-t-2 border-brand-green/30 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-brand-light/60 p-4 rounded-2xl border border-brand-green/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-brand-green text-white flex items-center justify-center shrink-0 shadow-sm">
                      <ClipboardCheck size={22} />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="text-sm font-black text-slate-900 tracking-tight">Checklist de Intervenção · Protocolo de Apoio</h4>
                        <span className="text-[9px] bg-brand-green text-white px-2 py-0.5 rounded-full font-black uppercase">
                          Exclusivo do Profissional
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Assinale os itens que precisou utilizar com esta criança e registre observações no histórico do aluno.
                      </p>
                    </div>
                  </div>

                  {/* Save Button */}
                  <div className="flex items-center gap-2 self-end sm:self-center no-print">
                    {interventionSaveSuccess && (
                      <span className="text-xs font-bold text-brand-green flex items-center gap-1">
                        <CheckCircle2 size={14} /> Salvo!
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleSaveIntervention}
                      disabled={isSavingIntervention}
                      className="bg-brand-green hover:bg-[#48b551] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all shadow-sm flex items-center gap-1.5 cursor-pointer disabled:opacity-50 active:scale-95"
                    >
                      {isSavingIntervention ? (
                        <>
                          <Loader2 size={14} className="animate-spin" />
                          Salvando...
                        </>
                      ) : (
                        <>
                          <Save size={14} />
                          Salvar Checklist
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* 3 Categories Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                  
                  {/* Category 1: Sinais sutis de alerta */}
                  <div className="bg-white border border-brand-green/25 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs font-black flex items-center justify-center shrink-0">
                        1
                      </span>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Sinais sutis de alerta
                      </h5>
                    </div>
                    
                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'Motores / Estereotipias', label: 'Motores / Estereotipias' },
                        { id: 'Sensoriais', label: 'Sensoriais' },
                        { id: 'Fisiológicos', label: 'Fisiológicos' },
                        { id: 'Gatilhos ambientais comuns', label: 'Gatilhos ambientais comuns' }
                      ].map((item) => {
                        const isChecked = selectedReg.protocoloIntervention?.sinaisAlerta?.includes(item.id);
                        return (
                          <label 
                            key={item.id}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                              isChecked ? 'bg-brand-light border-brand-green text-brand-green font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={() => handleToggleProtocolItem('sinaisAlerta', item.id)}
                              className="w-4 h-4 rounded text-brand-green accent-brand-green cursor-pointer"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Observações sobre os sinais:
                      </label>
                      <textarea
                        rows={3}
                        value={selectedReg.protocoloIntervention?.sinaisAlertaObs || ''}
                        onChange={(e) => handleUpdateProtocolObs('sinaisAlertaObs', e.target.value)}
                        placeholder="Descreva reações, sinais ou detalhes observados..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none bg-slate-50/50 resize-y"
                      />
                    </div>
                  </div>

                  {/* Category 2: Estratégias de autorregulação */}
                  <div className="bg-white border border-brand-green/25 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs font-black flex items-center justify-center shrink-0">
                        2
                      </span>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Estratégias de autorregulação
                      </h5>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'Pressão profunda', label: 'Pressão profunda' },
                        { id: 'Ancoramento 5-4-3-2-1', label: 'Ancoramento 5-4-3-2-1' },
                        { id: 'Redução do estímulo sensorial', label: 'Redução do estímulo sensorial' },
                        { id: 'Co-regulação', label: 'Co-regulação' }
                      ].map((item) => {
                        const isChecked = selectedReg.protocoloIntervention?.autorregulacao?.includes(item.id);
                        return (
                          <label 
                            key={item.id}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                              isChecked ? 'bg-brand-light border-brand-green text-brand-green font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={() => handleToggleProtocolItem('autorregulacao', item.id)}
                              className="w-4 h-4 rounded text-brand-green accent-brand-green cursor-pointer"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Observações sobre autorregulação:
                      </label>
                      <textarea
                        rows={3}
                        value={selectedReg.protocoloIntervention?.autorregulacaoObs || ''}
                        onChange={(e) => handleUpdateProtocolObs('autorregulacaoObs', e.target.value)}
                        placeholder="Quais técnicas funcionaram melhor, respostas observadas..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none bg-slate-50/50 resize-y"
                      />
                    </div>
                  </div>

                  {/* Category 3: Estratégias extras na escola */}
                  <div className="bg-white border border-brand-green/25 rounded-2xl p-4.5 space-y-3.5 shadow-xs">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-100">
                      <span className="w-6 h-6 rounded-full bg-brand-green text-white text-xs font-black flex items-center justify-center shrink-0">
                        3
                      </span>
                      <h5 className="font-bold text-xs uppercase tracking-wider text-slate-900">
                        Estratégias extras na escola
                      </h5>
                    </div>

                    <div className="space-y-2 text-xs">
                      {[
                        { id: 'Cartão de pausa visual', label: 'Cartão de pausa visual' },
                        { id: 'Cantinho calmo', label: 'Cantinho calmo' },
                        { id: 'Reduzir demandas', label: 'Reduzir demandas' },
                        { id: 'Transição antecipada', label: 'Transição antecipada' }
                      ].map((item) => {
                        const isChecked = selectedReg.protocoloIntervention?.extrasEscola?.includes(item.id);
                        return (
                          <label 
                            key={item.id}
                            className={`flex items-center gap-2.5 p-2 rounded-xl border transition-all cursor-pointer ${
                              isChecked ? 'bg-brand-light border-brand-green text-brand-green font-bold shadow-xs' : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <input 
                              type="checkbox"
                              checked={!!isChecked}
                              onChange={() => handleToggleProtocolItem('extrasEscola', item.id)}
                              className="w-4 h-4 rounded text-brand-green accent-brand-green cursor-pointer"
                            />
                            <span className="text-xs">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>

                    <div className="pt-2">
                      <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                        Observações escolares:
                      </label>
                      <textarea
                        rows={3}
                        value={selectedReg.protocoloIntervention?.extrasEscolaObs || ''}
                        onChange={(e) => handleUpdateProtocolObs('extrasEscolaObs', e.target.value)}
                        placeholder="Orientações e adaptações executadas na rotina escolar..."
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-200 focus:border-brand-green focus:ring-1 focus:ring-brand-green outline-none bg-slate-50/50 resize-y"
                      />
                    </div>
                  </div>

                </div>

                {selectedReg.protocoloIntervention?.lastUpdated && (
                  <p className="text-[11px] text-slate-400 italic text-right">
                    Última atualização registrada: {selectedReg.protocoloIntervention.lastUpdated}
                  </p>
                )}
              </div>

            </div>

            {/* Modal Footer */}
            <div className="bg-slate-50 px-6 py-4 flex flex-col sm:flex-row gap-3 justify-between items-center border-t border-gray-200 no-print">
              <div className="flex flex-col text-left">
                <span className="text-[10px] text-gray-400 font-mono">ID: {selectedReg.id}</span>
                <span className="text-[9px] text-gray-400 mt-0.5">Dica: Se a impressão não abrir, use o link de nova aba do topo direito para imprimir fora do painel.</span>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => handlePrint(selectedReg)}
                  className="bg-brand-green hover:bg-opacity-90 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer size={14} />
                  Imprimir Ficha
                </button>
                <button 
                  onClick={() => setSelectedReg(null)}
                  className="bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs px-5 py-2.5 rounded-xl transition-all shadow cursor-pointer"
                >
                  Voltar ao Painel
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* Branding Bar */}
      <div className="bg-white border-b border-gray-100 py-3.5 px-4 sm:px-6 flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-4 font-bold text-brand-green text-xl tracking-tighter">
           {brandSettings.brandLogo ? (
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shrink-0 shadow-sm">
               <img src={brandSettings.brandLogo} alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
           ) : (
             <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full overflow-hidden border border-gray-200 flex items-center justify-center bg-white shrink-0 shadow-sm">
               <img src="https://i.ibb.co/tTJkBTHZ/mapa-kids.png" alt="Logo M.A.P.A FabrineF." className="w-full h-full object-cover" referrerPolicy="no-referrer" />
             </div>
           )}
           <span className="uppercase text-base sm:text-lg font-black tracking-tight">{brandSettings.brandName || 'SUA MARCA'}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-xs text-gray-400 uppercase font-bold tracking-widest hidden md:block">
            {brandSettings.brandTagline || 'Sua Tagline'}
          </div>
          <button
            onClick={() => setIsAnticriseModalOpen(true)}
            className="flex items-center gap-1.5 bg-[#EAF7EE] hover:bg-[#56C45F] text-[#0D6E54] hover:text-white border border-[#C6EAD1] hover:border-[#56C45F] text-xs font-bold px-3.5 py-2 rounded-xl transition-all shadow-xs cursor-pointer active:scale-95"
            title="Abrir Protocolo de Segurança Anticrise"
          >
            <ShieldAlert size={15} className="text-amber-500" />
            <span>Protocolo Anticrise</span>
          </button>
        </div>
      </div>

      {/* Main Form Content */}
      <main className="max-w-4xl mx-auto px-4 md:px-8 mt-10">
        
        <div className="text-center mb-10 max-w-3xl mx-auto space-y-4">
          <h2 className="text-3xl md:text-4xl font-bold font-hand text-brand-green tracking-tight">M.A.P.A. do Acolhimento</h2>
          <h3 className="text-xl md:text-2xl font-bold font-hand text-slate-800 tracking-wide">Conhecendo a criança / o adolescente</h3>
          <p className="text-[#FA4E74] italic text-xs md:text-sm font-black uppercase tracking-wider">Ficha para preenchimento da família — apoio ao primeiro contato clínico ou escolar</p>
          <p className="text-gray-500 italic text-xs md:text-sm leading-relaxed max-w-2xl mx-auto pt-1">
            Esta ficha ajuda a organizar informações importantes sobre a criança ou o adolescente antes do primeiro atendimento ou do início na sala de aula. Quanto mais completas as respostas, mais rápido conseguimos construir um ambiente seguro e adequado às necessidades reais dele(a). Não há resposta certa ou errada — o objetivo é conhecer, não avaliar.
          </p>

          {/* Methodology Badge */}
          <div className="flex justify-center pt-2">
            <div className="inline-flex bg-white px-4 py-2.5 rounded-2xl shadow-sm border border-green-50 items-center gap-3 hover:shadow-md transition-all duration-300">
               <img src="https://raw.githubusercontent.com/easybyzcreator/imagens/760f541bfc53287fe80e3b73d99869979d00d02f/logo%20fabrine%20-%20fundo%20transparente.png" alt="Fabrine Fernandes Logo" className="w-10 h-10 object-contain rounded-full border border-gray-100 shrink-0 bg-white" referrerPolicy="no-referrer" />
               <div className="flex flex-col text-left">
                  <span className="text-[9px] text-gray-400 uppercase tracking-wider font-extrabold">Metodologia</span>
                  <span className="text-xs font-extrabold text-gray-700 leading-tight">Fabrine Fernandes Psicopedagoga</span>
               </div>
            </div>
          </div>
        </div>

        <StudentForm tripDetails={tripDetails} whatsappPhone={brandSettings.whatsapp || '5511999999999'} />

        {/* Footer Credits */}
        <footer className="mt-16 border-t border-gray-200 pt-8 text-center text-gray-400 text-sm mb-8 flex flex-col items-center gap-6">
          <div>
            <p>© {new Date().getFullYear()} {brandSettings.brandName || 'SUA MARCA'} - {brandSettings.brandTagline || 'Sua Tagline'}.</p>
            <p className="mt-3 flex flex-wrap items-center justify-center gap-2">
              <span className="text-gray-400 text-xs font-semibold">Metodologia inspirada por:</span>
              <span className="inline-flex items-center gap-1.5 bg-white px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100 font-bold text-xs text-gray-700">
                <img src="https://raw.githubusercontent.com/easybyzcreator/imagens/760f541bfc53287fe80e3b73d99869979d00d02f/logo%20fabrine%20-%20fundo%20transparente.png" alt="Fabrine Fernandes" className="w-5 h-5 object-contain" referrerPolicy="no-referrer" />
                Fabrine Fernandes Psicopedagoga
              </span>
            </p>
          </div>
          
          <button 
            onClick={contactAgency}
            className="flex items-center gap-2 bg-[#25D366] text-white hover:bg-[#20bd5a] font-bold text-xs px-5 py-2.5 rounded-full shadow-md transition-all transform active:scale-95 cursor-pointer"
          >
            <MessageCircle size={14} />
            Dúvidas? Fale Conosco
          </button>

          {/* Development Signature */}
          <div className="mt-8 pt-6 border-t border-gray-100 w-full max-w-xs flex flex-col items-center gap-2">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest font-semibold">DESENVOLVIDO POR</span>
            <a href="https://www.easybyzcreator.com" target="_blank" rel="noopener noreferrer" className="block focus:outline-none">
              <img 
                src="https://raw.githubusercontent.com/easybyzcreator/imagens/c7b535d4591af80294baeedd0b16e87bc4b3e315/logo%20easy%20byz%20-%20fundo%20transparente.png" 
                alt="Easy Byz Creator" 
                className="h-16 w-auto object-contain transition-all duration-300 cursor-pointer opacity-85 hover:opacity-100" 
                referrerPolicy="no-referrer" 
              />
            </a>
          </div>
        </footer>
      </main>

      {/* Protocolo Anticrise Modal */}
      <ProtocoloAnticriseModal 
        isOpen={isAnticriseModalOpen} 
        onClose={() => setIsAnticriseModalOpen(false)} 
      />
    </div>
  );
};

export default App;
