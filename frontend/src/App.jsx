import { Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/Layout';
import { PrivateRoute } from './components/PrivateRoute';
import { RoleGate } from './components/RoleGate';
import { Home } from './pages/Home';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Permits } from './pages/Permits';
import { Seedlings } from './pages/Seedlings';
import { Sites } from './pages/Sites';
import { Reports } from './pages/Reports';
import { Profile } from './pages/Profile';
import { Staff } from './pages/Staff';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/permits"
          element={
            <PrivateRoute>
              <RoleGate
                roles={['FRU', 'MES']}
                fallback={
                  <div className="page">
                    <div className="alert alert-error">Access denied. FRU or MES role required.</div>
                  </div>
                }
              >
                <Permits />
              </RoleGate>
            </PrivateRoute>
          }
        />

        <Route
          path="/seedlings"
          element={
            <PrivateRoute>
              <RoleGate
                roles={['NGP', 'MES']}
                fallback={
                  <div className="page">
                    <div className="alert alert-error">Access denied. NGP or MES role required.</div>
                  </div>
                }
              >
                <Seedlings />
              </RoleGate>
            </PrivateRoute>
          }
        />

        <Route
          path="/sites"
          element={
            <PrivateRoute>
              <RoleGate
                roles={['NGP', 'MES']}
                fallback={
                  <div className="page">
                    <div className="alert alert-error">Access denied. NGP or MES role required.</div>
                  </div>
                }
              >
                <Sites />
              </RoleGate>
            </PrivateRoute>
          }
        />

        <Route
          path="/reports"
          element={
            <PrivateRoute>
              <RoleGate
                roles={['MES']}
                fallback={
                  <div className="page">
                    <div className="alert alert-error">Access denied. MES role required.</div>
                  </div>
                }
              >
                <Reports />
              </RoleGate>
            </PrivateRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <PrivateRoute>
              <Profile />
            </PrivateRoute>
          }
        />

        <Route
          path="/staff"
          element={
            <PrivateRoute>
              <RoleGate
                roles={['ADMIN']}
                fallback={
                  <div className="page">
                    <div className="alert alert-error">Access denied. ADMIN role required.</div>
                  </div>
                }
              >
                <Staff />
              </RoleGate>
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
}