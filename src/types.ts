export interface TripDetails {
  schoolName: string;
  grade?: string; // Série/Ano
  date: string;
  destination: string;
}

export interface StudentProfile {
  // 1. Identificação
  name: string;
  nickname: string;
  birthday: string;
  age: string;
  school: string;
  grade: string;
  guardianNameRelation: string;
  phone: string;
  photo: string | null;

  // 2. Contexto
  diagnosis: string;
  professionals: string;
  medications: string;

  // 3. Comunicação
  communicationMethod: string; // Ex: "Fala verbal fluente", etc.
  communicationOtherDesc: string;
  comprehension: string;

  // 4. Processamento Sensorial
  sensorialSounds: string[];
  sensorialLights: string[];
  sensorialTouch: string[];
  sensorialMovement: string[];
  sensorialNotes: string;

  // 5. Comportamento e Regulação Emocional
  emotionalReaction: string;
  emotionalTriggers: string;
  emotionalCalming: string;
  emotionalWhatToAvoid: string;

  // 6. Rotina, Alimentação e Sono
  routineType: string;
  routineChanges: string;
  foodRestrictions: string;
  sleepDifficulties: string;

  // 7. Interesses e Habilidades
  favoriteSubjects: string;
  favoriteToys: string;
  biggestDifficulties: string;

  // 8. Interação Social
  peerRelationship: string;
  authorityRelationship: string;

  // 9. Vida Escolar
  schoolAdaptations: string;
  schoolChallenges: string;

  // 10. Informações Adicionais
  additionalInfo: string;
  fillDate: string;
  guardianSignature: string;
  guardianSignatureDraw?: string;

  // Intervenção e Acompanhamento do Profissional (Checklist Protocolo)
  protocoloIntervention?: {
    sinaisAlerta?: string[];
    sinaisAlertaObs?: string;
    autorregulacao?: string[];
    autorregulacaoObs?: string;
    extrasEscola?: string[];
    extrasEscolaObs?: string;
    lastUpdated?: string;
  };
}

export interface AIAnalysisResult {
  summary: string;
  safetyAlerts: string[];
  engagementTips: string[];
}