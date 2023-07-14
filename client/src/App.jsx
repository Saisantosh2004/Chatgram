import axios from 'axios';
import React from 'react'
import Routes from "./Routes.jsx";
import UserContextProvider from './UserContext.jsx';
function App() {
  axios.defaults.baseURL='http://localhost:5000';
  axios.defaults.withCredentials=true;
  return (
    <UserContextProvider>
      <Routes/>
    </UserContextProvider>
  )
}

export default App;
