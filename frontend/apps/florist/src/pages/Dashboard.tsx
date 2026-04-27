import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  return (
    <div style={{ padding: '2rem', fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto' }}>
      <h1>Рабочий стол флориста</h1>
      <p style={{ padding: '1rem', background: '#EAF4EF', borderRadius: '8px', border: '1px solid #3D7A5E', color: '#2F6249' }}>
        Вы успешно авторизованы и прошли через "Замок" (RequireAuth). Токен сохранен в localStorage.
      </p>
      
      <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
        <button onClick={() => navigate('/orders')} style={{ padding: '0.5rem 1rem', background: '#1A1917', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Мои заказы →
        </button>
        <button onClick={() => {
            localStorage.removeItem('token');
            localStorage.removeItem('role');
            navigate('/login');
        }} style={{ padding: '0.5rem 1rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>
          Выйти (Очистить токен)
        </button>
      </div>
    </div>
  );
}
