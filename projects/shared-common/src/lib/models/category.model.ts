export interface CategoryDto {
  id: string;
  name?: string;
  description?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface CreateCategoryCommand {
  name?: string;
  description?: string;
}

export interface UpdateCategoryCommand {
  id: string;
  name?: string;
  description?: string;
}

export interface GetAllCategoriesQuery {
  search?: string;
  searchName?: string;
  searchDescription?: string;
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}