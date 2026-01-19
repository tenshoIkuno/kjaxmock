export type NotificationSeverity = 'low' | 'medium' | 'critical';

export type NotificationEvidence = {
  transcript?: string;
  audioSegmentUrl?: string;
  relatedDocuments?: string[];
};

export type NotificationItem = {
  id: string;
  tenantId?: string;
  clientId?: string;
  type?: string;
  ruleId?: string;
  score?: number;
  severity?: NotificationSeverity;
  title: string;
  summary?: string;
  detectedAt?: string;
  read?: boolean;
  assignedTo?: string | null;
  actions?: string[];
  evidence?: NotificationEvidence;
};
