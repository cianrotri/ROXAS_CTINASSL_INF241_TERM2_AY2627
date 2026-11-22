import { useCallback, useEffect, useMemo, useState } from 'react';
import api from '../../api';
import AdminTopBar from '../../components/AdminTopBar';
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

function isAwaitingShip(order) {
  return order?.status === 'on_delivery' && !order?.shippedAt;
}

function orderStatusLabel(order) {
  if (isAwaitingShip(order)) return 'to be shipped';
  if (order.status === 'on_delivery') return 'on delivery';
  return order.status.replace('_', ' ');
}

export default function OrdersDeliveryPage() {
  const [orders, setOrders] = useState([]);
  const [deliveries, setDeliveries] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [orderDate, setOrderDate] = useState('');
  const [delSearch, setDelSearch] = useState('');
  const [delDate, setDelDate] = useState('');
  const [ordersPage, setOrdersPage] = useState(1);
  const [deliveryPage, setDeliveryPage] = useState(1);

  const loadOrders = useCallback(async () => {
    const { data } = await api.get('/admin/orders', {
      params: {
        status,
        from: orderDate || undefined,
        to: orderDate || undefined,
      },
    });
    setOrders(data);
  }, [status, orderDate]);

  const loadDeliveries = async () => {
    const { data } = await api.get('/admin/deliveries');
    setDeliveries(data);
  };

  useEffect(() => {
    loadDeliveries();
  }, []);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const fmt = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  const filteredOrders = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return orders;
    return orders.filter((o) => {
      const orderNumber = (o.orderNumber || '').toLowerCase();
      const name = customerName(o).toLowerCase();
      const email = customerEmail(o).replace('—', '').toLowerCase();
      return orderNumber.includes(q) || name.includes(q) || email.includes(q);
    });
  }, [orders, search]);

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

  const ordersFiltered = Boolean(search.trim() || status || orderDate);
  const deliveryFiltered = Boolean(delSearch.trim() || delDate);

  useEffect(() => {
    setOrdersPage(1);
  }, [search, status, orderDate, filteredOrders.length]);

  useEffect(() => {
    setDeliveryPage(1);
  }, [delSearch, delDate, filteredDeliveries.length]);

  const ordersPageCount = effectivePageCount(
    filteredOrders.length,
    TABLE_PAGE_SIZE,
    ordersFiltered ? null : MAX_PAGES_DEFAULT
  );
  const deliveryPageCount = effectivePageCount(
    filteredDeliveries.length,
    TABLE_PAGE_SIZE,
    deliveryFiltered ? null : MAX_PAGES_DEFAULT
  );

  const safeOrdersPage = Math.min(ordersPage, ordersPageCount);
  const safeDeliveryPage = Math.min(deliveryPage, deliveryPageCount);

  const pagedOrders = pageSlice(filteredOrders, safeOrdersPage, TABLE_PAGE_SIZE);
  const pagedDeliveries = pageSlice(filteredDeliveries, safeDeliveryPage, TABLE_PAGE_SIZE);

  const ordersCapped =
    !ordersFiltered &&
    Math.ceil(filteredOrders.length / TABLE_PAGE_SIZE) > MAX_PAGES_DEFAULT;
  const deliveryCapped =
    !deliveryFiltered &&
    Math.ceil(filteredDeliveries.length / TABLE_PAGE_SIZE) > MAX_PAGES_DEFAULT;

  const progressPercent = (d) => {
    const done = d.steps.filter((s) => s.completed).length;
    return Math.round((done / d.steps.length) * 100);
  };

  const ship = async (id) => {
    await api.patch(`/admin/orders/${id}/ship`);
    await loadOrders();
    await loadDeliveries();
  };

  return (
    <div className="admin-page admin-orders-delivery">
      <AdminTopBar active="orders" />
      <div className="admin-split-panels">
        <section className="admin-white-panel split">
          <h1 className="admin-title">ORDERS</h1>

          <div className="admin-filter-bar">
            <span className="filter-search-wrap">
              <span className="filter-search-icon" aria-hidden>
                ⌕
              </span>
              <input
                type="search"
                placeholder="Search order #, name, or email"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </span>
            <select value={status} onChange={(e) => setStatus(e.target.value)} aria-label="Category">
              <option value="">Category: All</option>
              <option value="on_delivery">On delivery</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            <input
              type="date"
              value={orderDate}
              onChange={(e) => setOrderDate(e.target.value)}
              aria-label="Filter by date"
            />
          </div>

          <div className="mini-table-wrap">
            <table className="data-table compact">
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Customer</th>
                  <th>Email</th>
                  <th>Status</th>
                  <th>Ordered</th>
                  <th>Shipped / Done / Cancelled</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {filteredOrders.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-row">
                      No orders match your filters.
                    </td>
                  </tr>
                )}
                {pagedOrders.map((o) => (
                  <tr key={o._id} className={isAwaitingShip(o) ? 'order-row-awaiting-ship' : undefined}>
                    <td>{o.orderNumber}</td>
                    <td>{customerName(o)}</td>
                    <td className="cell-email">{customerEmail(o)}</td>
                    <td>
                      <span
                        className={`pill ${
                          isAwaitingShip(o) ? 'to-be-shipped' : o.status
                        }`}
                      >
                        {orderStatusLabel(o)}
                      </span>
                    </td>
                    <td>{fmt(o.createdAt)}</td>
                    <td>
                      {o.status === 'on_delivery' && fmt(o.shippedAt)}
                      {o.status === 'completed' && fmt(o.deliveredAt)}
                      {o.status === 'cancelled' && fmt(o.cancelledAt)}
                    </td>
                    <td className="row-actions">
                      <div className="row-actions-inner">
                        {isAwaitingShip(o) && (
                          <button type="button" className="btn-deliver" onClick={() => ship(o._id)}>
                            DELIVER
                          </button>
                        )}
                        {o.status === 'on_delivery' && o.shippedAt && (
                          <button
                            type="button"
                            className="danger sm"
                            onClick={() => api.patch(`/admin/orders/${o._id}/cancel`).then(loadOrders).then(loadDeliveries)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {ordersCapped && (
            <p className="pagination-hint">Showing first {MAX_PAGES_DEFAULT} pages — use search or filters for more.</p>
          )}
          <TablePagination
            id="orders"
            page={safeOrdersPage}
            totalPages={ordersPageCount}
            onPageChange={setOrdersPage}
          />
        </section>

        <section className="admin-white-panel split">
          <h1 className="admin-title">DELIVERY</h1>

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
                </tr>
              </thead>
              <tbody>
                {filteredDeliveries.length === 0 && (
                  <tr>
                    <td colSpan={7} className="empty-row">
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
    </div>
  );
}