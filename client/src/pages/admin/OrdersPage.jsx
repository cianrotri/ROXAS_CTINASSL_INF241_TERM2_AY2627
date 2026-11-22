import { useEffect, useState } from 'react';
import api from '../../api';

const STATUS_OPTIONS = [
  { value: '', label: 'All' },
  { value: 'on_delivery', label: 'On delivery' },
  { value: 'completed', label: 'Completed' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');

  const load = async () => {
    const params = { search, status, from, to };
    const { data } = await api.get('/admin/orders', { params });
    setOrders(data);
  };

  useEffect(() => {
    load();
  }, []);

  const fmt = (d) => (d ? new Date(d).toLocaleString() : '—');

  return (
    <div>
      <h1>Orders</h1>
      <motionFilters
        search={search}
        setSearch={setSearch}
        status={status}
        setStatus={setStatus}
        from={from}
        setFrom={setFrom}
        to={to}
        setTo={setTo}
        onApply={load}
        options={STATUS_OPTIONS}
      />
      <div className="data-table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Order #</th>
              <th>Customer</th>
              <th>Status</th>
              <th>Ordered</th>
              <th>Shipped / Done / Cancelled</th>
              <th>Total</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o._id}>
                <td>{o.orderNumber}</td>
                <td>{o.user?.fullName || o.customerSnapshot?.fullName}</td>
                <td>
                  <span className={`pill ${o.status}`}>{o.status.replace('_', ' ')}</span>
                </td>
                <td>{fmt(o.createdAt)}</td>
                <td>
                  {o.status === 'on_delivery' && fmt(o.shippedAt)}
                  {o.status === 'completed' && fmt(o.deliveredAt)}
                  {o.status === 'cancelled' && fmt(o.cancelledAt)}
                </td>
                <td>₱{o.total.toFixed(2)}</td>
                <td className="row-actions">
                  {o.status === 'on_delivery' && (
                    <>
                      <button type="button" onClick={() => api.patch(`/admin/orders/${o._id}/ship`).then(load)}>
                        Mark shipped
                      </button>
                      <button
                        type="button"
                        className="btn-ghost"
                        onClick={() => api.patch(`/admin/orders/${o._id}/complete`).then(load)}
                      >
                        Complete
                      </button>
                      <button
                        type="button"
                        className="danger"
                        onClick={() => api.patch(`/admin/orders/${o._id}/cancel`).then(load)}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function motionFilters({ search, setSearch, status, setStatus, from, setFrom, to, setTo, onApply, options }) {
  return (
    <motionFiltersInner
      search={search}
      setSearch={setSearch}
      status={status}
      setStatus={setStatus}
      from={from}
      setFrom={setFrom}
      to={to}
      setTo={setTo}
      onApply={onApply}
      options={options}
    />
  );
}

function motionFiltersInner(props) {
  return (
    <motionFiltersForm {...props} />
  );
}

function motionFiltersForm({
  search,
  setSearch,
  status,
  setStatus,
  from,
  setFrom,
  to,
  setTo,
  onApply,
  options,
}) {
  return (
    <div className="filters-bar">
      <input
        placeholder="Search order # or customer"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <select value={status} onChange={(e) => setStatus(e.target.value)}>
        {options.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </select>
      <input type="date" value={from} onChange={(e) => setFrom(e.target.value)} />
      <input type="date" value={to} onChange={(e) => setTo(e.target.value)} />
      <button type="button" className="btn-primary" onClick={onApply}>
        Apply
      </button>
    </div>
  );
}