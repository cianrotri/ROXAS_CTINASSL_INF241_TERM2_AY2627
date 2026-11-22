import { useEffect, useState } from 'react';
import api from '../../api';

export default function DeliveryPage() {
  const [deliveries, setDeliveries] = useState([]);

  const load = async () => {
    const { data } = await api.get('/admin/deliveries');
    setDeliveries(data);
  };

  useEffect(() => {
    load();
  }, []);

  const advance = async (id) => {
    await api.patch(`/admin/deliveries/${id}/advance`);
    load();
  };

  const progressPercent = (d) => {
    const done = d.steps.filter((s) => s.completed).length;
    return Math.round((done / d.steps.length) * 100);
  };

  return (
    <div>
      <h1>Delivery overview</h1>
      <p className="muted">
        Simulated tracking (TikTok-style progress). For production, hook an aggregator API — see README.
      </p>
      <div className="delivery-grid">
        {deliveries.map((d) => (
          <article key={d._id} className="delivery-card">
            <header>
              <strong>{d.order?.orderNumber}</strong>
              <span>{d.trackingNumber}</span>
            </header>
            <p>
              Rider: <strong>{d.riderName}</strong> · {d.carrier}
            </p>
            <p className="muted">
              {d.order?.user?.fullName} — {d.order?.customerSnapshot?.address || d.order?.user?.address}
            </p>
            <div className="progress-track">
              <div className="progress-fill" style={{ width: `${progressPercent(d)}%` }} />
            </div>
            <ol className="delivery-steps">
              {d.steps.map((step, i) => (
                <li key={step.label} className={step.completed ? 'done' : i === d.currentStepIndex ? 'current' : ''}>
                  {step.label}
                  {step.completedAt && (
                    <small>{new Date(step.completedAt).toLocaleString()}</small>
                  )}
                </li>
              ))}
            </ol>
            {d.currentStepIndex < d.steps.length - 1 && (
              <button type="button" className="btn-secondary" onClick={() => advance(d._id)}>
                Simulate next step
              </button>
            )}
          </article>
        ))}
        {deliveries.length === 0 && <p>No active deliveries yet. Ship an order from Orders.</p>}
      </div>
    </div>
  );
}