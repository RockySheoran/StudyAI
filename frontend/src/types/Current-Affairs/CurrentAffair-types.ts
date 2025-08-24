export interface CurrentAffair {
  _id?: string;
  title: string;
  summary: string;
  fullContent: string;
  category: string;
  createdAt?: string;
}

export type AffairType = 'random' | 'custom';