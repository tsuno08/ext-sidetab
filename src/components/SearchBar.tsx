import React from "react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ value, onChange }) => {
  return (
    <div className="search-bar">
      <input
        type="text"
        placeholder="タブを検索..."
        className="search-input"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </div>
  );
};
