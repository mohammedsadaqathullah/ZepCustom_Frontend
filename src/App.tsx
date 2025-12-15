import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useAuthStore } from './stores/authStore';
import Login from './pages/Login';
import Register from './pages/Register';
import SpacesList from './pages/SpacesList';
import SpaceRoom from './pages/SpaceRoom';
import WelcomeScreen from './pages/WelcomeScreen';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
}

function App() {
  const { isAuthenticated, fetchUser } = useAuthStore();
  // Show welcome screen if not shown in this session
  const [showWelcome, setShowWelcome] = useState(() => !sessionStorage.getItem('welcomeShown'));

  useEffect(() => {
    if (isAuthenticated) {
      fetchUser();
    }
  }, [isAuthenticated, fetchUser]);

  return (
    <>
      {showWelcome && (
        <WelcomeScreen
          onComplete={() => {
            setShowWelcome(false);
            sessionStorage.setItem('welcomeShown', 'true');
          }}
        />
      )}
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route
            path="/spaces"
            element={
              <PrivateRoute>
                <SpacesList />
              </PrivateRoute>
            }
          />
          <Route
            path="/space/:spaceId"
            element={
              <PrivateRoute>
                <SpaceRoom />
              </PrivateRoute>
            }
          />
          <Route path="/" element={<Navigate to={isAuthenticated ? "/spaces" : "/login"} />} />
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;
