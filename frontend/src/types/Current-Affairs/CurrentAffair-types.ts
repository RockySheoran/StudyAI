export interface CurrentAffair {
  _id?: string;
  title: string;
  summary: string;
  fullContent: string;
  category: string;
  createdAt?: string;
}

export type AffairType = 'random' | 'custom';

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNext: boolean;
  hasPrev: boolean;
}

export interface CurrentAffairsResponse {
  affairs: CurrentAffair[];
  pagination: PaginationInfo;
}