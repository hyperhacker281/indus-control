import React from "react";

function EquipmentFilters({
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onAddNew,
  loading,
}) {
  const handleInputChange = (e) => {
    onFilterChange(e.target.name, e.target.value);
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      onApplyFilters();
    }
  };

  return (
    <div className="filters-section">
      <h2>🔍 Search & Filter Equipment</h2>

      <div className="filters-grid">
        <div className="filter-group">
          <label htmlFor="equipmentNumber">Equipment Number</label>
          <input
            type="text"
            id="equipmentNumber"
            name="equipmentNumber"
            placeholder="Enter equipment number..."
            value={filters.equipmentNumber}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="location">Location</label>
          <input
            type="text"
            id="location"
            name="location"
            placeholder="Enter location..."
            value={filters.location}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="manufacturer">Manufacturer</label>
          <input
            type="text"
            id="manufacturer"
            name="manufacturer"
            placeholder="Enter manufacturer..."
            value={filters.manufacturer}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>

        <div className="filter-group">
          <label htmlFor="serialNumber">Serial Number</label>
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            placeholder="Enter serial number..."
            value={filters.serialNumber}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
          />
        </div>
      </div>

      <div className="filter-actions">
        <button
          className="btn btn-primary"
          onClick={onApplyFilters}
          disabled={loading}
        >
          {loading ? "Searching..." : "🔍 Search"}
        </button>
        <button
          className="btn btn-secondary"
          onClick={onClearFilters}
          disabled={loading}
        >
          ✖️ Clear Filters
        </button>
        <button
          className="btn btn-success"
          onClick={onAddNew}
          disabled={loading}
        >
          ➕ Add New Equipment
        </button>
      </div>
    </div>
  );
}

export default EquipmentFilters;
