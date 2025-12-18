import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';

export function AuthDemo() {
  const { user, login, logout, register } = useAuth();
  const [email, setEmail] = useState('jan@example.com');
  const [password, setPassword] = useState('password');

  return (
    <div style={{ padding: 16 }}>
      <h2>Auth Demo</h2>
      <pre>User: {JSON.stringify(user, null, 2)}</pre>

      <div style={{ display: 'flex', gap: 8 }}>
        <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <button onClick={() => login({ email, password })}>Login</button>
        <button onClick={() => logout()}>Logout</button>
        <button
          onClick={() =>
            register({
              name: 'Jan',
              email,
              password,
              password_confirmation: password,
              user_type: 'customer',
            })
          }
        >
          Register demo
        </button>
      </div>
    </div>
  );
}
