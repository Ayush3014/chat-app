import axios from 'axios';
import Routes from './components/Routes';
import { UserContextProvider } from './UserContext';

function App() {
  axios.defaults.baseURL = 'http://localhost:3000';
  axios.defaults.withCredentials = true;
  return (
    <div>
      <UserContextProvider>
        <Routes />
      </UserContextProvider>
    </div>
  );
}

export default App;
