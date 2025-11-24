//src/shared/api/types.ts
export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data?: T;
  errors?: string[];
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  meta: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface ApiError {
  success: false;
  message: string;
  errors?: string[];
  status?: number;
}

// src/shared/stores/auth.ts
