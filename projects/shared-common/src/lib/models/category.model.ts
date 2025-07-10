export interface CategoryDto {
  id: string;
  name?: string;
  description?: string;
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
  sortBy?: string;
  sortDesc?: boolean;
  page?: number;
  pageSize?: number;
}