import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import Profile from './components/Profile';
import CreateAccount from './components/CreateAccount';
import Home from './components/Home';
import EditProfile from './components/Edit-profile';
import Craft from './components/Craft';
import ProtectedRoute from './components/ProtectedRoute';
import TodoList from './components/TodoList';
import CreateItem from './components/CreateItem'
import CreateRecipe from './components/CreateRecipe';
import DeleteRecipe from './components/DeleteRecipe';
import Farm from './components/Farm';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/create-account" element={<CreateAccount />} />
          <Route path="/" element={<Home />} />
          <Route path="/home" element={<Home />} />
          <Route path="/craft" element={<Craft />} />
          <Route path="/todolist" element={<TodoList />} />
          <Route path='/createitem' element={<CreateItem/>} />
          <Route path='/createrecipe' element={<CreateRecipe/>} />
          <Route path='/deleterecipe' element={<DeleteRecipe/>} />
          <Route path="/farm" element={<Farm />} />

          {/* Protected Routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/edit-profile" element={
            <ProtectedRoute>
              <EditProfile />
            </ProtectedRoute>
          } />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
