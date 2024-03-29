import { useContext, useState } from 'react';
import axios from 'axios';
import { UserContext } from '../UserContext';

export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isRegistered, setIsRegistered] = useState(false);
  const { setUsername: setLoggedInUsername, setId } = useContext(UserContext);

  return (
    <div className="bg-blue-50 h-screen flex items-center">
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          const url = isRegistered === true ? '/login' : '/register';
          try {
            const { data } = await axios.post(url, {
              username,
              password,
            });
            setLoggedInUsername(username);
            setId(data.id);
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
          {isRegistered ? 'LogIn' : 'Register'}
        </button>

        <div className="text-center mt-2">
          {isRegistered ? 'Not a member? ' : 'Already a member? '}
          <button
            onClick={() => {
              setIsRegistered(!isRegistered);
            }}
          >
            <span className="text-blue-500 underline">
              {isRegistered ? 'Register' : 'Login'}
            </span>
          </button>
        </div>
      </form>
    </div>
  );
}
