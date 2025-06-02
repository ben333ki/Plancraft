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
import FarmDetail from './components/FarmDetail';
import Calculator from './components/Calculator';
import CreateFarm from './components/CreateFarm';
import DeleteFarm from './components/DeleteFarm';
import AdminRoute from './components/AdminRoute';

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
          <Route path="/farm" element={<Farm />} />
          <Route path="/farm/:farmId" element={<FarmDetail />} />
          <Route path='/calculator' element={<Calculator />} />

          <Route path='/createitem' element={
            <AdminRoute>
              <CreateItem/>
            </AdminRoute>
          } />
          <Route path='/createrecipe' element={
            <AdminRoute>
              <CreateRecipe/>
            </AdminRoute>
          } />
          <Route path='/createfarm' element={
            <AdminRoute>
              <CreateFarm/>
            </AdminRoute>
          } />
          <Route path='/deleterecipe' element={
            <AdminRoute>
              <DeleteRecipe/>
            </AdminRoute>
          } />
          <Route path='/deletefarm' element={
            <AdminRoute>
              <DeleteFarm/>
            </AdminRoute>
          } />

          {/* Protected Routes */}
          <Route path="/todolist" element={
            <ProtectedRoute>
              <TodoList />
            </ProtectedRoute>
          } />
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
