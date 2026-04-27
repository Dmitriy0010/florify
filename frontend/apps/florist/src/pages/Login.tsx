import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Имитация аутентификации 
    // В реальности здесь вызов API: axios.post('/api/auth/login', { email, password })
    console.log('Logging in...', { email, password });
    
    // Записываем токен как доказательство авторизации
    localStorage.setItem('token', 'fake-jwt-token-12345');
    localStorage.setItem('role', 'FLORIST');
    
    // Переход на защищенную страницу
    navigate('/orders');
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh', backgroundColor: '#F8F8F6' }}>
      <div style={{ padding: '2rem', backgroundColor: '#FFF', borderRadius: '12px', boxShadow: '0 4px 8px rgba(0,0,0,0.08)', width: '100%', maxWidth: '400px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '1.5rem', color: '#1A1917', fontFamily: 'sans-serif' }}>FlowerOS Florist</h1>
        <p style={{ textAlign: 'center', marginBottom: '1rem', color: '#6B6A66', fontSize: '0.875rem' }}>Введите любые данные для теста</p>
        <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B6A66', fontFamily: 'sans-serif' }}>Email</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E4E0', boxSizing: 'border-box' }}
            />
          </div>
          <div>
            <label style={{ display: 'block', marginBottom: '0.5rem', color: '#6B6A66', fontFamily: 'sans-serif' }}>Пароль</label>
            <input 
              type="password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
              required 
              style={{ width: '100%', padding: '0.5rem', borderRadius: '8px', border: '1px solid #E5E4E0', boxSizing: 'border-box' }}
            />
          </div>
          <button 
            type="submit" 
            style={{ marginTop: '1rem', padding: '0.75rem', backgroundColor: '#3D7A5E', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold' }}
          >
            Войти
          </button>
        </form>
      </div>
    </div>
  );
}
