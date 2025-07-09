export interface CategoryDto {
  id: string;
  name: string;
  description?: string;
}

export interface CreateCategoryCommand {
  name: string;
  description?: string;
}

export interface UpdateCategoryCommand {
  id: string;
  name: string;
  description?: string;
}