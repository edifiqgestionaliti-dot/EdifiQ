export default function MultiCriteriaBar({
  search,
  onSearch,
  searchPlaceholder = "Buscar...",
  filters = [],
  onClear,
}) {
  const hasFilters = Boolean(search) || filters.some((filter) => filter.value !== "");

  return (
    <div className="multi-criteria-bar">
      <input
        className="search-input"
        placeholder={searchPlaceholder}
        value={search}
        onChange={(event) => onSearch(event.target.value)}
      />
      {filters.map((filter) => (
        <label className="filter-control" key={filter.name}>
          {filter.label && <span>{filter.label}</span>}
          {filter.type === "select" ? (
            <select value={filter.value} onChange={(event) => filter.onChange(event.target.value)}>
              <option value="">{filter.placeholder || `Todos los ${filter.label?.toLowerCase() || "valores"}`}</option>
              {filter.options.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          ) : (
            <input
              type={filter.type || "text"}
              value={filter.value}
              placeholder={filter.placeholder}
              min={filter.min}
              onChange={(event) => filter.onChange(event.target.value)}
            />
          )}
        </label>
      ))}
      {hasFilters && (
        <button type="button" className="small-btn" onClick={onClear}>
          Limpiar filtros
        </button>
      )}
    </div>
  );
}
