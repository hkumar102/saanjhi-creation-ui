export interface PaginatedResult<T> {
  items: T[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
}

export interface PaginationQuery {
  name?: string;
  email?: string;
  phone?: string;
  page: number;
  pageSize: number;
}