import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';

interface SearchBarProps {
  className?: string;
  placeholder?: string;
  initialValue?: string;
  onSearch?: (query: string) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  className = '', 
  placeholder = 'Search for items...', 
  initialValue = '',
  onSearch 
}) => {
  const [query, setQuery] = useState(initialValue);
  
  // Update query when initialValue changes
  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    }
  };

  return (
    <form 
      onSubmit={handleSearch} 
      className={`relative flex items-center w-full max-w-md ${className}`}
    >
      <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-muted-foreground" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full py-2 pl-10 pr-4 rounded-full bg-background border border-input focus:border-primary focus:ring-1 focus:ring-primary/30 focus-ring transition-all duration-200"
      />
      <button
        type="submit"
        className="absolute inset-y-0 right-1 flex items-center bg-primary text-primary-foreground px-4 my-1 rounded-full text-sm font-medium transition-colors hover:bg-primary/90 focus-ring"
      >
        Search
      </button>
    </form>
  );
};

export default SearchBar;
