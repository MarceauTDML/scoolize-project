import { Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Layout from "./components/Layout";
import ProtectedRoute from "./components/ProtectedRoute";
import ChatBotWidget from "./components/ChatBotWidget";

import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

import StudentDashboard from "./pages/student/StudentDashboard";
import ProfileOCR from "./pages/student/ProfileOCR";
import SearchFormation from "./pages/student/SearchFormation";
import MyCandidatures from "./pages/student/MyCandidatures";

import SchoolDashboard from "./pages/school/SchoolDashboard";
import ManageFormations from "./pages/school/ManageFormations";
import CandidatesList from "./pages/school/CandidatesList";

import FormationDetails from "./pages/tools/FormationDetails";
import Comparator from "./pages/tools/Comparator";
import FinanceSimulator from "./pages/tools/FinanceSimulator";

function App() {
  return (
    <AuthProvider>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />

          <Route path="/formation/:id" element={<FormationDetails />} />
          <Route path="/comparator" element={<Comparator />} />
          <Route path="/finance" element={<FinanceSimulator />} />

          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile-ocr"
            element={
              <ProtectedRoute>
                <ProfileOCR />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/search"
            element={
              <ProtectedRoute>
                <SearchFormation />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/candidatures"
            element={
              <ProtectedRoute>
                <MyCandidatures />
              </ProtectedRoute>
            }
          />

          <Route
            path="/school/dashboard"
            element={
              <ProtectedRoute>
                <SchoolDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/manage-formations"
            element={
              <ProtectedRoute>
                <ManageFormations />
              </ProtectedRoute>
            }
          />
          <Route
            path="/school/candidates"
            element={
              <ProtectedRoute>
                <CandidatesList />
              </ProtectedRoute>
            }
          />

          <Route
            path="*"
            element={
              <div style={{ textAlign: "center", padding: "50px" }}>
                <h2>404 - Page non trouvée</h2>
              </div>
            }
          />
        </Routes>
        <ChatBotWidget />
      </Layout>
    </AuthProvider>
  );
}

export default App;
