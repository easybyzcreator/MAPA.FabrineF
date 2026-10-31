import React from 'react';
import { MapPin, School, PenLine, GraduationCap } from 'lucide-react';
import { TripDetails } from '../types';

interface TripHeaderProps {
  details: TripDetails;
  onChange: (field: keyof TripDetails, value: string) => void;
  isEditable: boolean;
  toggleEdit: () => void;
  isParentMode?: boolean;
}

export const TripHeader: React.FC<TripHeaderProps> = ({ details, onChange, isEditable, toggleEdit, isParentMode = false }) => {
  
  // Função auxiliar para formatar a data com barras automáticas
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let v = e.target.value.replace(/\D/g, ''); // Remove tudo que não é dígito
    
    if (v.length > 8) v = v.slice(0, 8); // Limita a 8 números

    // Adiciona as barras
    if (v.length >= 5) {
      v = `${v.slice(0, 2)}/${v.slice(2, 4)}/${v.slice(4)}`;
    } else if (v.length >= 3) {
      v = `${v.slice(0, 2)}/${v.slice(2)}`;
    }
    
    onChange('date', v);
  };

  return (
    <div className="bg-brand-green text-white p-6 rounded-b-3xl shadow-lg mb-8 transition-all duration-500">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-start mb-6">
           <h1 className="text-3xl font-black tracking-tight uppercase">Ficha do Aluno</h1>
           {!isParentMode && (
             <button 
               onClick={toggleEdit}
               className="text-white/80 hover:text-white flex items-center gap-1 text-sm bg-white/10 px-3 py-1 rounded-full backdrop-blur-sm transition-colors hover:bg-white/20"
             >
               <PenLine size={14} />
               {isEditable ? 'Salvar Dados' : 'Editar Viagem'}
             </button>
           )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* School / City */}
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-2 text-green-100 mb-1 text-xs uppercase font-bold tracking-wider">
              <School size={14} />
              Escola / Cidade
            </div>
            {isEditable ? (
              <input 
                type="text" 
                value={details.schoolName}
                onChange={(e) => onChange('schoolName', e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-white placeholder-white/50 font-semibold"
                placeholder="Nome da Escola"
              />
            ) : (
              <div className="font-bold text-lg truncate" title={details.schoolName}>{details.schoolName}</div>
            )}
          </div>

          {/* Grade / Year */}
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
            <div className="flex items-center gap-2 text-green-100 mb-1 text-xs uppercase font-bold tracking-wider">
              <GraduationCap size={14} />
              Série / Ano
            </div>
            {isEditable ? (
              <input 
                type="text" 
                value={details.grade || ''}
                onChange={(e) => onChange('grade', e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-white placeholder-white/50 font-semibold"
                placeholder="Ex: 5º Ano B"
              />
            ) : (
              <div className="font-bold text-lg truncate">{details.grade || '-'}</div>
            )}
          </div>

          {/* Destination */}
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
             <div className="flex items-center gap-2 text-green-100 mb-1 text-xs uppercase font-bold tracking-wider">
              <MapPin size={14} />
              Destino
            </div>
            {isEditable ? (
              <input 
                type="text" 
                value={details.destination}
                onChange={(e) => onChange('destination', e.target.value)}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-white placeholder-white/50 font-semibold"
                placeholder="Local do Passeio"
              />
            ) : (
              <div className="font-bold text-lg truncate" title={details.destination}>{details.destination}</div>
            )}
          </div>

          {/* Date - COM MÁSCARA AUTOMÁTICA */}
          <div className="bg-white/10 p-3 rounded-lg backdrop-blur-sm border border-white/5">
             <div className="flex items-center gap-2 text-green-100 mb-1 text-xs uppercase font-bold tracking-wider">
              Data do Estudo
            </div>
            {isEditable ? (
              <input 
                type="text"
                value={details.date}
                onChange={handleDateChange}
                className="w-full bg-transparent border-b border-white/30 focus:border-white outline-none text-white font-semibold placeholder-white/50"
                placeholder="DD/MM/AAAA"
                maxLength={10}
              />
            ) : (
              <div className="font-bold text-lg">
                {details.date || 'Data não informada'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};