"use client";

import { useMemo } from "react";

export function usePagination(
  page: number,
  pageSize: number,
  totalCount: number,
) {
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const canGoPrevious = page > 1;
  const canGoNext = page < totalPages;

  const pages = useMemo(() => {
    const left = Math.max(1, page - 2);
    const right = Math.min(totalPages, page + 2);
    const values: number[] = [];

    for (let i = left; i <= right; i += 1) {
      values.push(i);
    }

    return values;
  }, [page, totalPages]);

  return {
    totalPages,
    canGoPrevious,
    canGoNext,
    pages,
  };
}
