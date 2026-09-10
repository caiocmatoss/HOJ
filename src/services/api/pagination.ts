export type PaginatedResult<T> = {
  items: T[];
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
};

function integerHeader(headers: Headers, name: string, fallback: number, min = 0): number {
  const value = Number(headers.get(name));
  return Number.isInteger(value) && value >= min ? value : fallback;
}

export function parsePaginationHeaders<T>(body: T[], headers: Headers): PaginatedResult<T> {
  const page = integerHeader(headers, "X-Page", 1, 1);
  const limit = integerHeader(headers, "X-Limit", body.length || 100, 1);
  const totalCount = integerHeader(headers, "X-Total-Count", body.length);
  const totalPages = integerHeader(headers, "X-Total-Pages", totalCount ? Math.ceil(totalCount / limit) : 0);
  return { items: body, page, limit, totalCount, totalPages };
}
