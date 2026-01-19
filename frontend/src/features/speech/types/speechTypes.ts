export type SpeechStatus = 'idle' | 'authorizing' | 'listening';

export type SpeechTokenResponse = {
  token: string;
  region: string;
  expires_time: number;
};

export type SpeechState = {
  status: SpeechStatus;
  showText: string;
  error: string | null;
  setStatus: (status: SpeechStatus) => void;
  appendshowText: (text: string) => void;
  setError: (value: string | null) => void;
  resetText: () => void;
  reset: () => void;
};
