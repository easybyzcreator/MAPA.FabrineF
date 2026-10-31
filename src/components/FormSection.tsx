import React from 'react';

interface FormSectionProps {
  title: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
  color?: string;
}

export const FormSection: React.FC<FormSectionProps> = ({ title, children, icon, color = "text-brand-green" }) => {
  return (
    <div className="bg-white p-6 rounded-2xl shadow-sm border border-green-100 mb-6 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-2 h-full bg-brand-green opacity-20"></div>
      <div className="flex items-center gap-3 mb-6 pb-2 border-b border-green-50">
        <div className={`${color}`}>
          {icon}
        </div>
        <h3 className={`text-xl font-bold font-hand ${color}`}>{title}</h3>
      </div>
      {/* Aumentei o espaçamento entre os filhos de 4 para 6 */}
      <div className="space-y-6">
        {children}
      </div>
    </div>
  );
};