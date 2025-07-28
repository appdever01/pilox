export interface FeatureFlag {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  maintenanceMessage?: string;
}

interface FeatureFlags {
  [key: string]: FeatureFlag;
}

export const FEATURES: FeatureFlags = {
  VIDEO_GENERATION: {
    id: 'video-generation',
    name: 'Video Generation',
    description: 'Generate video explanations from PDF content',
    enabled: false,
    maintenanceMessage: 'Video generation is currently under maintenance. We expect to restore service by next week.',
  },
  DOCUMENT_CONVERSION: {
    id: 'document-conversion',
    name: 'Document Conversion',
    description: 'Convert documents between different formats',
    enabled: false,
    maintenanceMessage: 'Document conversion feature is temporarily disabled for improvements.',
  },
};

export const isFeatureEnabled = (featureId: keyof typeof FEATURES): boolean => {
  return FEATURES[featureId]?.enabled ?? false;
};

export const getMaintenanceMessage = (featureId: keyof typeof FEATURES): string | undefined => {
  return FEATURES[featureId]?.maintenanceMessage;
}; 