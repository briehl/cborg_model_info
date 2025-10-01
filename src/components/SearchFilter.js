import './SearchFilter.css';

const SearchFilter = ({ searchTerm, setSearchTerm, filterCapability, setFilterCapability, sortBy, setSortBy }) => {
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

      <div className="sort-options">
        <label htmlFor="sort-select">Sort by:</label>
        <select
          id="sort-select"
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="sort-select"
        >
          <option value="name-asc">Name (A-Z)</option>
          <option value="name-desc">Name (Z-A)</option>
          <option value="cost-asc">Cost (Low to High)</option>
          <option value="cost-desc">Cost (High to Low)</option>
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
