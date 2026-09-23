import { PredictionInput } from '../types';

export interface ValidationResult {
  isValid: boolean;
  errors: Record<string, string>;
}

export function validatePredictionInput(input: Partial<PredictionInput>): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.country || !input.country.trim()) {
    errors.country = 'Country is required.';
  }

  if (!input.state || !input.state.trim()) {
    errors.state = 'State is required.';
  }

  if (!input.city || !input.city.trim()) {
    errors.city = 'City is required.';
  }

  if (!input.station || !input.station.trim()) {
    errors.station = 'Station name is required.';
  }

  if (input.latitude === undefined || input.latitude === null || isNaN(Number(input.latitude))) {
    errors.latitude = 'Latitude must be a valid number.';
  } else if (Number(input.latitude) < -90 || Number(input.latitude) > 90) {
    errors.latitude = 'Latitude must be between -90 and 90.';
  }

  if (input.longitude === undefined || input.longitude === null || isNaN(Number(input.longitude))) {
    errors.longitude = 'Longitude must be a valid number.';
  } else if (Number(input.longitude) < -180 || Number(input.longitude) > 180) {
    errors.longitude = 'Longitude must be between -180 and 180.';
  }

  if (!input.pollutant_id || !input.pollutant_id.trim()) {
    errors.pollutant_id = 'Pollutant identifier is required.';
  }

  if (!input.last_update || !input.last_update.trim()) {
    errors.last_update = 'Last update timestamp is required.';
  } else {
    // Expected format: YYYY-MM-DD HH:MM:SS or parseable ISO date
    const regex = /^\d{4}-\d{2}-\d{2}\s\d{2}:\d{2}(:\d{2})?$/;
    const isoRegex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/;
    if (!regex.test(input.last_update.trim()) && !isoRegex.test(input.last_update.trim())) {
      errors.last_update = 'Format must be YYYY-MM-DD HH:MM:SS (e.g., 2024-01-15 10:00:00).';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
}

export function formatDateTimeForBackend(date: Date = new Date()): string {
  const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
  const yyyy = date.getFullYear();
  const mm = pad(date.getMonth() + 1);
  const dd = pad(date.getDate());
  const hh = pad(date.getHours());
  const mi = pad(date.getMinutes());
  const ss = pad(date.getSeconds());
  return `${yyyy}-${mm}-${dd} ${hh}:${mi}:${ss}`;
}
