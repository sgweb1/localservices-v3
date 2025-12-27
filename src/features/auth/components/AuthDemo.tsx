import { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function AuthDemo() {
  const { user, login, logout, register } = useAuth();
  const [email, setEmail] = useState('jan@example.com');
  const [password, setPassword] = useState('password');

  return (
    <div style={{ padding: 16 }}>
      <h2>Auth Demo</h2>
      <pre>User: {JSON.stringify(user, null, 2)}</pre>

      <div style={{ display: 'flex', gap: 8 }}>
        <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="email" />
        <Input value={password} onChange={(e) => setPassword(e.target.value)} placeholder="password" type="password" />
        <Button onClick={() => login({ email, password })} size="md">Login</Button>
        <Button onClick={() => logout()} size="md">Logout</Button>
        <Button
          onClick={() =>
            register({
              name: 'Jan',
              email,
              password,
              password_confirmation: password,
              user_type: 'customer',
            })
          }
          size="md"
        >
          Register demo
        </Button>
      </div>
    </div>
  );
}
