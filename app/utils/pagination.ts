export interface PaginationOptions {
  page: number;
  limit: number;
}

export interface PaginationResult<T> {
  data: T[];
  total: number;
  page: number;
  totalPages: number;
}

export const paginate = <T>(
  data: T[],
  { page, limit }: PaginationOptions
): PaginationResult<T> => {
  const total = data.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const end = start + limit;
  return {
    data: data.slice(start, end),
    total,
    page,
    totalPages
  };
};
