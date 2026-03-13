import { api } from '@/api'
import type {
  CategoriesResponse,
  CategoryResponse,
  CreateCategoryBody,
  DeleteCategoryResponse,
  UpdateCategoryBody,
} from '@/types/category'
import type {
  CategoryGroupResponse,
  CategoryGroupsResponse,
  CreateCategoryGroupBody,
  DeleteCategoryGroupResponse,
  UpdateCategoryGroupBody,
} from '@/types/category-group'

// 카테고리 그룹
export const getCategoryGroups = async () => {
  const response = await api.get<CategoryGroupsResponse>('/api/category-groups')
  return response.data?.data
}

export const createCategoryGroup = async (data: CreateCategoryGroupBody) => {
  const response = await api.post<CategoryGroupResponse>('/api/category-groups', data)
  return response.data?.data
}

export const updateCategoryGroup = async (id: number, data: UpdateCategoryGroupBody) => {
  const response = await api.patch<CategoryGroupResponse>(`/api/category-groups/${id}`, data)
  return response.data?.data
}

export const deleteCategoryGroup = async (id: number) => {
  const response = await api.delete<DeleteCategoryGroupResponse>(`/api/category-groups/${id}`)
  return response.data?.data
}

// 카테고리
export const getCategories = async () => {
  const response = await api.get<CategoriesResponse>('/api/categories')
  return response.data?.data
}

export const createCategory = async (data: CreateCategoryBody) => {
  const response = await api.post<CategoryResponse>('/api/categories', data)
  return response.data?.data
}

export const updateCategory = async (id: number, data: UpdateCategoryBody) => {
  const response = await api.patch<CategoryResponse>(`/api/categories/${id}`, data)
  return response.data?.data
}

export const deleteCategory = async (id: number) => {
  const response = await api.delete<DeleteCategoryResponse>(`/api/categories/${id}`)
  return response.data?.data
}
