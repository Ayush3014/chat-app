import { useState } from 'react';
import axios from 'axios';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          try {
            const res = await axios.post('/register', { username, password });
          } catch (error) {
            console.error(error);
          }
        }}
        className="w-64 mx-auto mb-12"
      >
        <input
          onChange={(e) => {
            setUsername(e.target.value);
          }}
          type="text"
          placeholder="username"
          className="block  w-full rounded p-2 mb-2 border"
        />
        <input
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          type="password"
          placeholder="password"
          className="block w-full rounded p-2 mb-2 border"
        />
        <button className="bg-blue-500 text-white w-full rounded-md p-2">
          Register
        </button>
      </form>
    </div>
  );
}
