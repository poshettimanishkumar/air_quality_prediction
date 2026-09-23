export interface PredictionInput {
  country: string;
  state: string;
  city: string;
  station: string;
  latitude: number;
  longitude: number;
  pollutant_id: string;
  last_update: string; // Format: "YYYY-MM-DD HH:MM:SS"
}

export interface PredictionSuccessResponse {
  message: string;
  predicted_pollutant_avg: number;
  target: string;
  model: string;
}

export interface PredictionTestResponse {
  message: string;
  country: string;
  state: string;
  city: string;
  station: string;
  pollutant_id: string;
  status: string;
}

export interface StoredPredictionRecord {
  id: string;
  userId: string;
  modelId: string;
  modelName: string;
  inputData: PredictionInput;
  outputData: {
    predicted_pollutant_avg: number;
    target: string;
    model: string;
    message: string;
    isTestSimulation?: boolean;
  };
  status: 'success' | 'failed' | 'simulated';
  createdAt: string; // ISO string or timestamp representation
}

export interface UserProfile {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  emailVerified?: boolean;
  createdAt?: string;
}

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  statusCode?: number;
  isColdStart?: boolean;
}
