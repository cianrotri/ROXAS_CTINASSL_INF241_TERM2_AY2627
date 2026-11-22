export const TABLE_PAGE_SIZE = 8;
export const MAX_PAGES_DEFAULT = 5;

export function effectivePageCount(itemCount, pageSize, maxPages) {
  const full = Math.max(1, Math.ceil(itemCount / pageSize));
  return maxPages != null ? Math.min(full, maxPages) : full;
}

export function pageSlice(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

export default function TablePagination({ page, totalPages, onPageChange, id }) {
  if (totalPages <= 1) return null;

  const prev = () => onPageChange(Math.max(1, page - 1));
  const next = () => onPageChange(Math.min(totalPages, page + 1));

  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);

  return (
    <nav className="table-pagination" aria-label={id ? `Pagination for ${id}` : 'Table pagination'}>
      <button type="button" className="page-btn" onClick={prev} disabled={page <= 1}>
        Prev
      </button>
      <div className="page-numbers">
        {pages.map((p) => (
          <button
            key={p}
            type="button"
            className={`page-num ${p === page ? 'active' : ''}`}
            onClick={() => onPageChange(p)}
            aria-current={p === page ? 'page' : undefined}
          >
            {p}
          </button>
        ))}
      </div>
      <button type="button" className="page-btn" onClick={next} disabled={page >= totalPages}>
        Next
      </button>
    </nav>
  );
}