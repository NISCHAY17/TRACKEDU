import { Routes, Route } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import SignUp from './components/SignUp'; 
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from './firebase';
import { Loader, Center } from '@mantine/core';

export default function App() {
  const [user, loading] = useAuthState(auth);

  if (loading) {
    return (
      <Center style={{ height: '100vh' }}>
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Routes>
      {user ? (
        <Route path="/*" element={<Dashboard />} />
      ) : (
        <>
          <Route path="/signup" element={<SignUp />} />
          <Route path="*" element={<Login />} />
        </>
      )}
    </Routes>
  );
}
