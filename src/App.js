import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './pages/Home/Home';
import Login from './pages/Login/Login';
import Register from './pages/register/Register';
import PrivateRoute from './components/PrivetRoute/PrivateRoute'; // Import PrivateRoute
import Profile from './pages/Profile/Profile';

const App = () => (
  
  <Routes>
    <Route
      path="/"
      element={
        <PrivateRoute>
          <Home />
        </PrivateRoute>
      }
    />
    <Route path='/profile' element={<PrivateRoute> <Profile/> </PrivateRoute>}/>
    <Route path="/login" element={<Login />} />
    <Route path="/register" element={<Register />} />
  </Routes>
);

export default App;
