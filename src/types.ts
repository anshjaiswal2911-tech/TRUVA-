export type Verdict = 
  | 'Compliant' 
  | 'Potential Violation' 
  | 'Requires Verification'
  | 'Discrepancy'
  | 'Needs Review'
  | 'Non-Compliant'
  | 'GOOD_COMPLIANT'
  | 'BAD_NON_COMPLIANT';

export type ModuleStatus = 
  | 'Compliant' 
  | 'Verified' 
  | 'Potential Violation'
  | 'Requires Verification'
  | 'Non-Compliant'
  | 'Review';

export interface KeyFinding {
  id: string;
  text: string;
  type: 'compliant' | 'warning' | 'info';
}

export interface DetailedModule {
  title: string;
  icon: string;
  status: ModuleStatus;
  statusType: 'success' | 'warning' | 'error' | 'info';
  subtitle: string;
  primaryFinding: string;
  details: {
    label: string;
    value: string;
    flagged?: boolean;
    note?: string;
  }[];
}

export interface OcrItem {
  box?: any;
  bbox?: any;
  text: string;
  confidence: number;
  source_index?: number;
  center_x?: number;
  center_y?: number;
}

export interface InspectorViolationEvidence {
  ruleCode: string;
  ruleTitle: string;
  section?: string;
  status?: string;
  ocrSnippet?: string;
  evidenceText?: string;
  bbox?: any;
  inspectorObservation?: any;
  selectedAt?: string;
  notes?: string;
  severity?: 'critical' | 'major' | 'minor';
}

export interface Product {
  id: string;
  inspectionId?: string;
  name: string;
  subtitle: string;
  category: string;
  barcode: string;
  mrp?: string;
  unitSalePrice?: string;
  volume?: string;
  quantity?: string;
  mfgDate?: string;
  expDate?: string;
  countryOfOrigin?: string;
  manufacturerName?: string;
  inspectionDate: string;
  imageUrl: string;
  imageAlt?: string;
  overallVerdict: Verdict;
  automatedVerdict?: Verdict;
  ocrItems?: any[];
  overallSummary: {
    declarations: { status: string; label: string; icon: string; type: 'success' | 'warning' | 'error' | 'info' };
    netQuantity: { status: string; label: string; icon: string; type: 'success' | 'warning' | 'error' | 'info' };
    mrpTax: { status: string; label: string; icon: string; type: 'success' | 'warning' | 'error' | 'info' };
    evidence: { status: string; label: string; icon: string; type: 'success' | 'warning' | 'error' | 'info' };
  };
  keyFindings: KeyFinding[];
  modules: {
    declarations: DetailedModule;
    netQuantity: DetailedModule;
    mrpTax: DetailedModule;
    evidence: DetailedModule;
  };
  inspectorDecision?: {
    action: 'concurred' | 'flagged_audit' | 'dismissed' | 'pending' | 'GOOD_COMPLIANT' | 'BAD_NON_COMPLIANT';
    notes?: string;
    timestamp?: string;
  };
  inspectorVerification?: {
    decision?: any;
    inspectorId?: string;
    inspectorName?: string;
    notes?: string;
    timestamp?: string;
    actionTaken?: string;
    observation?: string;
    violatedRules?: any[];
    submissionStatus?: string;
  };
  evidenceDetail?: {
    laboratory: string;
    reportDate: string;
    sampleBatch: string;
    declaredValue: string;
    observedValue: string;
    difference: string;
    differenceType: 'discrepancy' | 'match' | 'acceptable';
    explanation: string;
  };
  nutritionFacts?: {
    servingSize: string;
    calories: number | string;
    totalSugars: string;
    sodium: string;
    protein?: string;
    totalFat?: string;
  };
  primaryIngredients?: string[];
  distinctiveAdditives?: string;
  fdaStatus?: string;
  publicDataAvailability?: 'High' | 'Medium' | 'Low';
}

export interface NotificationItem {
  id: string;
  title: string;
  description: string;
  timeAgo: string;
  type: 'error' | 'analytics' | 'check' | 'description' | 'sync';
  isUnread: boolean;
  actionRequired?: boolean;
}

export type ActiveTab = 'landing' | 'home' | 'scan' | 'history' | 'settings' | 'notifications' | 'compare' | 'states';

export interface ScanProgressStep {
  id: number;
  title: string;
  status: 'completed' | 'active' | 'pending';
}
