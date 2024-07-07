import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PatientForm from './PatientForm';
import Dashboard from './Dashboard';
import PatientDetails from './PatientDetails';
import Login from './Login';
import NavBar from './NavBar';
import SubmissionSuccess from './SubmissionSuccess';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (token) {
      setIsAuthenticated(true);
      setUserRole(role);
    }
  }, []);

  //Sign out functionality
  const handleSignOut = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUserRole('');
    // Redirect to login page
  };


  return (
    <Router>
      {isAuthenticated && <NavBar onSignOut={handleSignOut} />}
      <Routes>
        <Route path="/" element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} setUserRole={setUserRole} /> : (userRole === 'admin' ? <Navigate to="/dashboard" /> : <Navigate to="/intake" />)} />
        <Route path="/intake" element={isAuthenticated && userRole !== 'admin' ? <PatientForm /> : <Navigate to="/" />} />
        <Route path="/dashboard" element={isAuthenticated && userRole === 'admin' ? <Dashboard /> : <Navigate to="/" />} />
        <Route path="/patient/:id" element={isAuthenticated && userRole === 'admin' ? <PatientDetails /> : <Navigate to="/" />} />
        <Route path="/submission-success" element={<SubmissionSuccess />} />
      </Routes>
  </Router>
  );
}

export default App;
