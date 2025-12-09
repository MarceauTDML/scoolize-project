import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Login from './screens/auth/Login';
import Register from './screens/auth/Register';
import Dashboard from './screens/auth/Dashboard';
import Home from './screens/Home';
import SchoolDetails from './screens/SchoolDetails';
import AdminDashboard from './screens/admin/AdminDashboard';
import SchoolsMap from './screens/SchoolsMap';
import StudentCalendar from './screens/StudentCalendar';
import StudentProfile from './screens/student/StudentProfile';

import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/school/:id" element={<SchoolDetails />} />
            <Route path="/map" element={<SchoolsMap />} />
            <Route path="/calendar" element={<StudentCalendar />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}
export default App;