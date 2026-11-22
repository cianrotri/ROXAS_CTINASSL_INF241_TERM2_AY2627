import { useEffect, useState } from 'react';
import api from '../../api';
import AdminTopBar from '../../components/AdminTopBar';
import { getProductVisual } from '../../data/productThumbs';

export default function InventoryPage() {
  const [products, setProducts] = useState([]);
  const [modal, setModal] = useState(null);
  const [history, setHistory] = useState([]);
  const [historyFor, setHistoryFor] = useState(null);
  const [qty, setQty] = useState('');
  const [note, setNote] = useState('');

  const load = async () => {
    const { data } = await api.get('/admin/inventory');
    setProducts(data);
  };

  useEffect(() => {
    load();
  }, []);

  const openRestock = (product) => {
    setModal(product);
    setQty('');
    setNote('');
  };

  const submitRestock = async () => {
    await api.post(`/admin/inventory/${modal._id}/restock`, { quantity: qty, note });
    setModal(null);
    load();
  };

  const openHistory = async (product) => {
    setHistoryFor(product);
    const { data } = await api.get(`/admin/inventory/${product._id}/history`);
    setHistory(data);
  };

  const fmtDate = (d) => (d ? new Date(d).toLocaleDateString() : '—');

  return (
    <div className="admin-page">
      <AdminTopBar active="inventory" />
      <div className="admin-white-panel">
        <h1 className="admin-title">INVENTORY</h1>
        <div className="inventory-grid-mockup">
          {products.map((p) => (
            <article key={p._id} className="inventory-card">
              <div className="inventory-thumb">
                <img src={p.imageUrl || getProductVisual(p.name).image} alt="" />
              </div>
              <div className="inventory-meta">
                <h3>{p.name}</h3>
                <p>
                  <span>last restock:</span> {fmtDate(p.lastRestock)}
                </p>
                <p>
                  <span>stock:</span> {p.stock}
                </p>
                <div className="inventory-actions">
                  <button type="button" className="btn-tan" onClick={() => openRestock(p)}>
                    UPDATE
                  </button>
                  <button type="button" className="btn-tan outline" onClick={() => openHistory(p)}>
                    HISTORY
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {modal && (
        <div className="modal-backdrop" role="presentation" onClick={() => setModal(null)}>
          <div className="modal" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Restock — {modal.name}</h2>
            <label>
              Quantity to add
              <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} />
            </label>
            <label>
              Note (optional)
              <input value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div className="modal-actions">
              <button type="button" className="btn-tan outline" onClick={() => setModal(null)}>
                Cancel
              </button>
              <button type="button" className="btn-tan" onClick={submitRestock}>
                Add batch
              </button>
            </div>
          </div>
        </div>
      )}

      {historyFor && (
        <div className="modal-backdrop" role="presentation" onClick={() => setHistoryFor(null)}>
          <div className="modal wide" role="dialog" onClick={(e) => e.stopPropagation()}>
            <h2>Stock history — {historyFor.name}</h2>
            <ul className="history-list">
              {history.length === 0 && <li>No restocks yet.</li>}
              {history.map((h) => (
                <li key={h._id}>
                  +{h.quantityAdded} ({h.previousStock} → {h.newStock}) — {new Date(h.createdAt).toLocaleString()}
                  {h.note && <span className="muted"> — {h.note}</span>}
                </li>
              ))}
            </ul>
            <button type="button" className="btn-tan" onClick={() => setHistoryFor(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
}