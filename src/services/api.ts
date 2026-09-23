import { PredictionInput, PredictionSuccessResponse, PredictionTestResponse } from '../types';

export const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'https://air-quality-predictions.onrender.com').replace(/\/$/, '');

export interface HealthCheckResponse {
  status: string;
  model_loaded?: boolean;
  message?: string;
}

export interface ApiErrorResult {
  error: string;
  statusCode?: number;
  isColdStart?: boolean;
  rawDetail?: unknown;
}

/**
 * Check backend health status
 */
export async function checkBackendHealth(): Promise<{ healthy: boolean; data?: HealthCheckResponse; error?: string }> {
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 12000);

    const response = await fetch(`${API_BASE_URL}/health`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' },
      signal: controller.signal
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      return { healthy: false, error: `Health check responded with status ${response.status}` };
    }

    const data: HealthCheckResponse = await response.json();
    return { healthy: data.model_loaded === true, data };
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    return { healthy: false, error: message };
  }
}

/**
 * Check root status
 */
export async function checkBackendRoot(): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    const data = await response.json();
    return { success: response.ok, message: data.message };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}

/**
 * Call POST /predict with exact JSON schema required by FastAPI backend
 */
export async function submitPrediction(
  input: PredictionInput,
  onColdStartWarning?: () => void
): Promise<{ success: true; data: PredictionSuccessResponse } | { success: false; error: string; statusCode?: number; rawDetail?: unknown }> {
  const payload = {
    country: input.country.trim(),
    state: input.state.trim(),
    city: input.city.trim(),
    station: input.station.trim(),
    latitude: Number(input.latitude),
    longitude: Number(input.longitude),
    pollutant_id: input.pollutant_id.trim(),
    last_update: input.last_update.trim(),
  };

  const controller = new AbortController();
  // Render cold start might take up to 60 seconds
  const coldStartTimer = setTimeout(() => {
    if (onColdStartWarning) onColdStartWarning();
  }, 10000);

  const requestTimeout = setTimeout(() => {
    controller.abort();
  }, 75000);

  try {
    const response = await fetch(`${API_BASE_URL}/predict`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload),
      signal: controller.signal
    });

    clearTimeout(coldStartTimer);
    clearTimeout(requestTimeout);

    let responseData: any;
    try {
      responseData = await response.json();
    } catch {
      return {
        success: false,
        error: `Server responded with HTTP ${response.status} but returned non-JSON content.`,
        statusCode: response.status
      };
    }

    if (!response.ok) {
      // Handle known FastAPI validation errors (422) or internal server error (500)
      if (response.status === 422 && responseData?.detail) {
        const errorDetail = Array.isArray(responseData.detail)
          ? responseData.detail.map((d: any) => `${d.loc?.join('.') || 'field'}: ${d.msg}`).join(', ')
          : JSON.stringify(responseData.detail);
        return {
          success: false,
          error: `Validation Error (HTTP 422): ${errorDetail}`,
          statusCode: 422,
          rawDetail: responseData.detail
        };
      }

      if (response.status === 500) {
        const detailMsg = responseData?.detail || responseData?.message || 'Internal Server Error';
        return {
          success: false,
          error: `Backend Error (HTTP 500): ${detailMsg}`,
          statusCode: 500,
          rawDetail: responseData
        };
      }

      return {
        success: false,
        error: responseData?.detail || responseData?.message || `Request failed with status ${response.status}`,
        statusCode: response.status,
        rawDetail: responseData
      };
    }

    // Validate expected fields in success response
    if (typeof responseData.predicted_pollutant_avg !== 'number') {
      return {
        success: false,
        error: 'Invalid response from backend: predicted_pollutant_avg numeric field is missing.',
        statusCode: response.status,
        rawDetail: responseData
      };
    }

    return {
      success: true,
      data: {
        message: responseData.message || 'Prediction successful',
        predicted_pollutant_avg: responseData.predicted_pollutant_avg,
        target: responseData.target || 'pollutant_avg',
        model: responseData.model || 'XGBoost'
      }
    };
  } catch (err: unknown) {
    clearTimeout(coldStartTimer);
    clearTimeout(requestTimeout);

    if (err instanceof Error) {
      if (err.name === 'AbortError') {
        return {
          success: false,
          error: 'Request timed out. The backend server on Render may be waking up or experiencing high latency. Please retry in a few moments.',
          statusCode: 408
        };
      }
      return {
        success: false,
        error: `Network Connection Error: ${err.message}. Please verify internet access and backend availability.`,
      };
    }

    return {
      success: false,
      error: 'An unexpected network error occurred while communicating with the prediction server.'
    };
  }
}

/**
 * Call POST /predict-test (official test endpoint on backend)
 */
export async function submitTestPrediction(
  input: PredictionInput
): Promise<{ success: true; data: PredictionTestResponse } | { success: false; error: string }> {
  try {
    const payload = {
      country: input.country.trim(),
      state: input.state.trim(),
      city: input.city.trim(),
      station: input.station.trim(),
      latitude: Number(input.latitude),
      longitude: Number(input.longitude),
      pollutant_id: input.pollutant_id.trim(),
      last_update: input.last_update.trim(),
    };

    const response = await fetch(`${API_BASE_URL}/predict-test`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    if (!response.ok) {
      return { success: false, error: data.detail || `HTTP ${response.status}` };
    }
    return { success: true, data };
  } catch (err: unknown) {
    return { success: false, error: err instanceof Error ? err.message : String(err) };
  }
}
