import { useState } from 'react';
import HysteriaAdminPanel from './HysteriaAdminPanel';
import './index.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(() => localStorage.getItem('loggedIn'));
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const login = async () => {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      setLoggedIn(true);
      localStorage.setItem('loggedIn', '1');
    } else {
      alert('Invalid password');
    }
  };

  if (!loggedIn) {
    return (
      <div className="p-4 space-y-2">
        <input type="text" className="border p-1" placeholder="Username" value={username} onChange={e=>setUsername(e.target.value)} />
        <input type="password" className="border p-1" placeholder="Password" value={password} onChange={e=>setPassword(e.target.value)} />
        <button className="bg-blue-500 text-white px-2 py-1" onClick={login}>Login</button>
      </div>
    );
  }

  return <HysteriaAdminPanel />;
}

export default App;
