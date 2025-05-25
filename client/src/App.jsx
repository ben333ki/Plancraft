import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import CreateAccount from './components/CreateAccount';
import Login from './components/Login';
import Home from './components/Home';
import Profile from './components/Profile';
import EditProfile from './components/Edit-profile';
import Craft from './components/Craft';
import TodoList from './components/TodoList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/create-account" element={<CreateAccount />} />
        <Route path="/login" element={<Login />} />
        <Route path="/home" element={<Home />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/craft" element={<Craft />} />
        <Route path="/to do list" element={<TodoList />} />
      </Routes>
    </Router>
  );
}

export default App;
