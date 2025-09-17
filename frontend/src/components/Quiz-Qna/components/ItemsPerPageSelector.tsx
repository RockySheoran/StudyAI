"use client";

import React from "react";

interface ItemsPerPageSelectorProps {
  totalItems: number;
  itemsPerPage: number;
  onItemsPerPageChange: (itemsPerPage: number) => void;
}

export const ItemsPerPageSelector: React.FC<ItemsPerPageSelectorProps> = ({
  totalItems,
  itemsPerPage,
  onItemsPerPageChange,
}) => {
  if (totalItems <= 5) return null;

  return (
    <div className="flex items-center gap-2">
      <label className="text-sm text-gray-700 dark:text-gray-300">Show:</label>
      <select
        value={itemsPerPage}
        onChange={(e) => onItemsPerPageChange(Number(e.target.value))}
        className="px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value={5}>5</option>
        <option value={10}>10</option>
        <option value={20}>20</option>
        <option value={50}>50</option>
      </select>
      <span className="text-sm text-gray-700 dark:text-gray-300">per page</span>
    </div>
  );
};
