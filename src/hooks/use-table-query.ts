"use client";

import * as React from "react";

interface UseTableQueryOptions<T> {
  data: T[];
  searchKeys?: (keyof T)[];
  filters?: Record<string, ((item: T) => boolean) | undefined>;
  pageSize?: number;
}

export function useTableQuery<T>({
  data,
  searchKeys,
  filters,
  pageSize = 5,
}: UseTableQueryOptions<T>) {
  const [search, setSearchState] = React.useState("");
  const [page, setPageState] = React.useState(1);

  const setSearch = React.useCallback((value: string) => {
    setSearchState(value);
    setPageState(1);
  }, []);

  const setPage = React.useCallback((newPage: number) => {
    setPageState(newPage);
  }, []);

  const filtered = React.useMemo(() => {
    let result = data;
    if (searchKeys && search.trim()) {
      const query = search.trim().toLowerCase();
      result = result.filter((item) =>
        searchKeys.some((key) => {
          const val = item[key];
          if (Array.isArray(val)) {
            return val.some((elem) => String(elem).toLowerCase().includes(query));
          }
          return String(val ?? "").toLowerCase().includes(query);
        })
      );
    }
    if (filters) {
      Object.values(filters).forEach((predicate) => {
        if (predicate) result = result.filter(predicate);
      });
    }
    return result;
  }, [data, search, searchKeys, filters]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);

  const start = (safePage - 1) * pageSize;
  const paged = filtered.slice(start, start + pageSize);

  return {
    search,
    setSearch,
    page: safePage,
    setPage,
    filtered,
    paged,
    totalPages,
    totalCount: filtered.length,
    pageSize,
  };
}