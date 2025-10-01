import React from 'react';
import './SearchFilter.css';

const SearchFilter = ({ searchTerm, setSearchTerm, filterCapability, setFilterCapability }) => {
  return (
    <div className="search-filter-container">
      <div className="search-box">
        <input
          type="text"
          placeholder="Search models by name or description..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
      </div>

      <div className="filter-options">
        <label htmlFor="capability-filter">Filter by capability:</label>
        <select
          id="capability-filter"
          value={filterCapability}
          onChange={(e) => setFilterCapability(e.target.value)}
          className="filter-select"
        >
          <option value="all">All Models</option>
          <option value="tools">Tool/Function Usage</option>
          <option value="vision">Vision</option>
          <option value="audio">Audio</option>
          <option value="reasoning">Reasoning</option>
        </select>
      </div>

      {searchTerm && (
        <button
          className="clear-search"
          onClick={() => setSearchTerm('')}
        >
          Clear Search
        </button>
      )}
    </div>
  );
};

export default SearchFilter;