import { useState, useCallback } from 'react';

export const useSearch = (items, searchFields = []) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState(items);

  const search = useCallback((searchTerm) => {
    setQuery(searchTerm);
    if (!searchTerm.trim()) {
      setResults(items);
      return;
    }

    const term = searchTerm.toLowerCase().trim();
    const filtered = items.filter(item => {
      return searchFields.some(field => {
        const value = field.split('.').reduce((obj, key) => obj?.[key], item);
        return value?.toString().toLowerCase().includes(term);
      });
    });
    setResults(filtered);
  }, [items, searchFields]);

  return { query, results, search, setResults };
};