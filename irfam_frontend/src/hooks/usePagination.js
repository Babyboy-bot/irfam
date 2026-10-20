import { useState, useMemo } from 'react';

export default function usePagination(data, itemsPerPage = 10) {
  const [currentPage, setCurrentPage] = useState(1);

  // Calculer le nombre total de pages
  const totalPages = Math.ceil(data.length / itemsPerPage);

  // Obtenir les données de la page actuelle
  const currentData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return data.slice(startIndex, endIndex);
  }, [data, currentPage, itemsPerPage]);

  // Changer de page
  const goToPage = (page) => {
    const pageNumber = Math.max(1, Math.min(page, totalPages));
    setCurrentPage(pageNumber);
  };

  // Page suivante
  const nextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Page précédente
  const previousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  // Réinitialiser à la page 1
  const reset = () => {
    setCurrentPage(1);
  };

  return {
    currentPage,
    totalPages,
    currentData,
    goToPage,
    nextPage,
    previousPage,
    reset,
    hasNext: currentPage < totalPages,
    hasPrevious: currentPage > 1,
  };
}
