import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import Home from './components/Home';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
