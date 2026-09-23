import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  orderBy,
  deleteDoc,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db, auth, isFirebaseConfigured } from './firebase';
import { StoredPredictionRecord, PredictionInput } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth?.currentUser?.uid || null,
      email: auth?.currentUser?.email || null,
      emailVerified: auth?.currentUser?.emailVerified || null,
      isAnonymous: auth?.currentUser?.isAnonymous || null,
      tenantId: auth?.currentUser?.tenantId || null,
      providerInfo: auth?.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error:', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const LOCAL_STORAGE_KEY_PREFIX = 'aq_predictions_';

function getLocalPredictions(userId: string): StoredPredictionRecord[] {
  try {
    const raw = localStorage.getItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalPrediction(record: StoredPredictionRecord): void {
  try {
    const list = getLocalPredictions(record.userId);
    const updated = [record, ...list.filter(item => item.id !== record.id)];
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${record.userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to save to local storage fallback', e);
  }
}

function deleteLocalPrediction(userId: string, predictionId: string): void {
  try {
    const list = getLocalPredictions(userId);
    const updated = list.filter(item => item.id !== predictionId);
    localStorage.setItem(`${LOCAL_STORAGE_KEY_PREFIX}${userId}`, JSON.stringify(updated));
  } catch (e) {
    console.error('Failed to delete from local storage fallback', e);
  }
}

/**
 * Save user prediction to Firestore users/{userId}/predictions/{predictionId}
 */
export async function savePredictionRecord(params: {
  userId: string;
  inputData: PredictionInput;
  outputData: {
    predicted_pollutant_avg: number;
    target: string;
    model: string;
    message: string;
    isTestSimulation?: boolean;
  };
  status: 'success' | 'failed' | 'simulated';
}): Promise<StoredPredictionRecord> {
  const predictionId = `pred_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
  const record: StoredPredictionRecord = {
    id: predictionId,
    userId: params.userId,
    modelId: 'xgboost-air-quality-v1',
    modelName: 'XGBoost',
    inputData: params.inputData,
    outputData: params.outputData,
    status: params.status,
    createdAt: new Date().toISOString()
  };

  // Always back up to local storage so user data remains available
  saveLocalPrediction(record);

  if (db && isFirebaseConfigured) {
    const docPath = `users/${params.userId}/predictions/${predictionId}`;
    try {
      await setDoc(doc(db, 'users', params.userId, 'predictions', predictionId), {
        userId: params.userId,
        modelId: record.modelId,
        modelName: record.modelName,
        inputData: record.inputData,
        outputData: record.outputData,
        status: record.status,
        createdAt: serverTimestamp()
      });
    } catch (error) {
      console.warn('Firestore write failed, using local storage fallback:', error);
      handleFirestoreError(error, OperationType.CREATE, docPath);
    }
  }

  return record;
}

/**
 * Fetch all predictions for an authenticated user
 */
export async function getUserPredictions(userId: string): Promise<StoredPredictionRecord[]> {
  if (db && isFirebaseConfigured) {
    const collectionPath = `users/${userId}/predictions`;
    try {
      const q = query(collection(db, 'users', userId, 'predictions'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      const remoteRecords: StoredPredictionRecord[] = snapshot.docs.map(docSnap => {
        const data = docSnap.data();
        let createdAtStr = new Date().toISOString();
        if (data.createdAt instanceof Timestamp) {
          createdAtStr = data.createdAt.toDate().toISOString();
        } else if (typeof data.createdAt === 'string') {
          createdAtStr = data.createdAt;
        }

        return {
          id: docSnap.id,
          userId: data.userId || userId,
          modelId: data.modelId || 'xgboost-air-quality-v1',
          modelName: data.modelName || 'XGBoost',
          inputData: data.inputData,
          outputData: data.outputData,
          status: data.status || 'success',
          createdAt: createdAtStr
        };
      });

      if (remoteRecords.length > 0) {
        return remoteRecords;
      }
    } catch (error) {
      console.warn('Firestore query failed, using local records:', error);
      handleFirestoreError(error, OperationType.LIST, collectionPath);
    }
  }

  // Local fallback
  return getLocalPredictions(userId);
}

/**
 * Delete a user prediction
 */
export async function deleteUserPrediction(userId: string, predictionId: string): Promise<void> {
  deleteLocalPrediction(userId, predictionId);

  if (db && isFirebaseConfigured) {
    const path = `users/${userId}/predictions/${predictionId}`;
    try {
      await deleteDoc(doc(db, 'users', userId, 'predictions', predictionId));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  }
}
