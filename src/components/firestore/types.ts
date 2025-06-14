// Types for Firestore data
export interface FirestoreData {
  id: string;
  [key: string]: any;
}

export interface CollectionData {
  collectionName: string;
  data: FirestoreData[];
}

export interface EditingState {
  collectionName: string;
  docId: string;
  data: object;
}

export const COLLECTIONS = [
  "betting_config",
  "lotto_draws",
  "lotto_participations", 
  "lotto_prizes",
  "lottos",
  "odds_config",
  "referral_codes",
  "site_config",
  "sports_config",
  "users",
] as const;