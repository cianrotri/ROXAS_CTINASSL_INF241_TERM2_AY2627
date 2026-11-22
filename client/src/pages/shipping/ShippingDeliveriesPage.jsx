import { useEffect, useState } from 'react';
import api from '../../api';
import TablePagination, {
  TABLE_PAGE_SIZE,
  MAX_PAGES_DEFAULT,
  effectivePageCount,
  pageSlice,
} from '../../components/TablePagination';

function customerEmail(order) {
  return order?.user?.email || '—';
}

function customerName(order) {
  return order?.user?.fullName || order?.customerSnapshot?.fullName || '—';
}

export default function ShippingDeliveriesPage() {
  const [deliveries, setDeliveries] = useState([]);
  const [delSearch, setDelSearch] = useState('');
  const [delDate, setDelDate] = useState('');
  const [deliveryPage, setDeliveryPage] = useState(1);
  const [message, setMessage] = useState('');

  const loadDeliveries = async () => {
    const { data } = await api.get('/shipping/deliveries');
    setDeliveries(data);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const filteredDeliveries = deliveries.filter((d) => {
    const order = d.order;
    if (!order) return false;

    if (delDate) {
      const created = new Date(order.createdAt).toDateString();
      if (created !== new Date(delDate).toDateString()) return false;
    }

    if (!delSearch.trim()) return true;
    const s = delSearch.toLowerCase();
    const email = customerEmail(order).toLowerCase();
    const name = customerName(order).toLowerCase();
    return (
      order.orderNumber?.toLowerCase().includes(s) ||
      d.riderName?.toLowerCase().includes(s) ||
      email.includes(s) ||
      name.includes(s)
    );
  });

  const deliveryFiltered = Boolean(delSearch.trim() || delDate);

  useEffect(() => {
    setDeliveryPage(1);
  }, [delSearch, delDate, filteredDeliveries.length]);

  const deliveryPageCount = effectivePageCount(
    filteredDeliveries.length,
    TABLE_PAGE_SIZE,
    deliveryFiltered ? null : MAX_PAGES_DEFAULT
  );

  const safeDeliveryPage = Math.min(deliveryPage, deliveryPageCount);
  const pagedDeliveries = pageSlice(filteredDeliveries, safeDeliveryPage, TABLE_PAGE_SIZE);

  const deliveryCapped =
    !deliveryFiltered &&
    Math.ceil(filteredDeliveries.length / TABLE_PAGE_SIZE) > MAX_PAGES_DEFAULT;

  const progressPercent = (d) => {
    const done = d.steps.filter((s) => s.completed).length;
    return Math.round((done / d.steps.length) * 100);
  };

  const canComplete = (order) =>
    order?.status === 'on_delivery' && Boolean(order?.shippedAt);

  const markComplete = async (orderId) => {
    setMessage('');
    const ok = window.confirm('Mark this delivery as completed? The customer order will be closed.');
    if (!ok) return;
    try {
      await api.patch(`/shipping/orders/${orderId}/complete`);
      await loadDeliveries();
      setMessage('Delivery marked complete.');
    } catch (err) {
      setMessage(err.response?.data?.message || 'Could not complete delivery');
    }
  };

  return (
    <div className="admin-page admin-orders-delivery">
      <section className="admin-white-panel split">
        <h1 className="admin-title">DELIVERY</h1>
        <p className="shipping-subtitle">Chiikawa Express — confirm arrivals here.</p>

        <div className="admin-filter-bar">
          <span className="filter-search-wrap">
            <span className="filter-search-icon" aria-hidden>
              ⌕
            </span>
            <input
              type="search"
              placeholder="Search order, rider, email"
              value={delSearch}
              onChange={(e) => setDelSearch(e.target.value)}
            />
          </span>
          <input
            type="date"
            value={delDate}
            onChange={(e) => setDelDate(e.target.value)}
            aria-label="Filter by date"
          />
        </div>

        {message && <p className="form-note shipping-banner">{message}</p>}

        <div className="mini-table-wrap">
          <table className="data-table delivery-table">
            <thead>
              <tr>
                <th>ORDER NO.</th>
                <th>CUSTOMER</th>
                <th>EMAIL</th>
                <th>RIDER</th>
                <th>PROGRESS</th>
                <th>DATE SHIPPED</th>
                <th>DATE ARRIVED</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filteredDeliveries.length === 0 && (
                <tr>
                  <td colSpan={8} className="empty-row">
                    No deliveries match your filters.
                  </td>
                </tr>
              )}
              {pagedDeliveries.map((d) => (
                <tr key={d._id}>
                  <td>{d.order?.orderNumber}</td>
                  <td>{customerName(d.order)}</td>
                  <td className="cell-email">{customerEmail(d.order)}</td>
                  <td>{d.riderName}</td>
                  <td>
                    <div className="progress-track slim">
                      <div className="progress-fill" style={{ width: `${progressPercent(d)}%` }} />
                    </div>
                  </td>
                  <td>{fmt(d.order?.shippedAt)}</td>
                  <td>{fmt(d.order?.deliveredAt)}</td>
                  <td className="row-actions">
                    <div className="row-actions-inner">
                      {canComplete(d.order) && (
                        <button
                          type="button"
                          className="btn-moss sm shipping-complete-btn"
                          onClick={() => markComplete(d.order._id)}
                        >
                          COMPLETE
                        </button>
                      )}
                      {d.order?.status === 'completed' && <span className="pill completed">done</span>}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {deliveryCapped && (
          <p className="pagination-hint">Showing first {MAX_PAGES_DEFAULT} pages — use search to see more.</p>
        )}
        <TablePagination
          id="delivery"
          page={safeDeliveryPage}
          totalPages={deliveryPageCount}
          onPageChange={setDeliveryPage}
        />
      </section>
    </div>
  );
}