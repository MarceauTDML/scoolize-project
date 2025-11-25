import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import Register from './pages/Register';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SchoolDashboard from './pages/SchoolDashboard';
import './App.css';

function App() {
  const isConnected = !!localStorage.getItem('token');
  const role = localStorage.getItem('role');

  const handleLogout = () => {
    localStorage.clear();
    window.location.href = '/login';
  };

  return (
    <BrowserRouter>
      <header className="navbar">
        <div className="logo">Scoolize</div>
        <nav>
            <Link to="/">Accueil</Link>
            
            {role === 'admin' && (
                <Link to="/admin" style={{color: '#ff9800'}}>Dashboard Admin</Link>
            )}
            
            {role === 'user' && (
                <Link to="/student-dashboard">Mon Espace</Link>
            )}

            {role === 'school' && (
                <Link to="/school-dashboard">Ma Gestion</Link>
            )}

            {isConnected ? (
                <button onClick={handleLogout} style={{marginLeft: '1rem'}}>Déconnexion</button>
            ) : (
                <>
                    <Link to="/login">Se connecter</Link>
                    <Link to="/register">S'inscrire</Link>
                </>
            )}
        </nav>
      </header>

      <main className="container">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/register" element={<Register />} />
          <Route path="/login" element={<Login />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/student-dashboard" element={<StudentDashboard />} />
          <Route path="/school-dashboard" element={<SchoolDashboard />} />
        </Routes>
      </main>
    </BrowserRouter>
  )
}

export default App;