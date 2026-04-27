import { Link } from 'react-router-dom';

export default function KanbanOrders() {
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', backgroundColor: '#F8F8F6', minHeight: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h2 style={{ margin: 0 }}>Заказы на сборку</h2>
        <Link to="/" style={{ textDecoration: 'none', color: '#3B82F6', fontWeight: 'bold' }}>← На главную</Link>
      </div>
      <div style={{ display: 'flex', gap: '1rem' }}>
        <div style={{ flex: 1, padding: '1rem', background: '#EFF6FF', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0, color: '#3B82F6' }}>Новые</h3>
          <div style={{ background: 'white', padding: '1rem', margin: '1rem 0', borderRadius: '8px', boxShadow: '0 1px 2px rgba(0,0,0,0.06)' }}>
            <p style={{ margin: '0 0 0.5rem 0' }}><strong>Заказ #001</strong></p>
            <p style={{ margin: 0, color: '#6B6A66' }}>Розы белые x 25</p>
          </div>
        </div>
        <div style={{ flex: 1, padding: '1rem', background: '#ECFDF5', borderRadius: '12px' }}>
          <h3 style={{ marginTop: 0, color: '#10B981' }}>Собранные</h3>
        </div>
      </div>
    </div>
  );
}
