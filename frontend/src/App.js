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
import StudentGrades from './screens/student/StudentGrades';
import CalendarDetails from './screens/CalendarDetails';
import Favorites from './screens/student/Favorites';

import Navbar from './components/Navbar';
import Chatbot from './components/Chatbot';
import SideMenu from './components/SideMenu';

function App() {
  const isUserLoggedIn = () => {
    return !!localStorage.getItem("token");
  };

  return (
    <Router>
      <SideMenu />
      <div className="App">
        <Navbar />
        <div className="content-container">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/calendar-details" element={<CalendarDetails />} />
            <Route path="/school/:id" element={<SchoolDetails />} />
            <Route path="/map" element={<SchoolsMap />} />
            <Route path="/calendar" element={<StudentCalendar />} />
            <Route path="/favorites" element={<Favorites />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/student-profile" element={<StudentProfile />} />
            <Route path="/student-grades" element={<StudentGrades />} />
          </Routes>
        </div>

        {isUserLoggedIn() && <Chatbot />}
      </div>
    </Router>
  );
}

export default App;