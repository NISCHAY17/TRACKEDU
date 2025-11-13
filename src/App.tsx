import { Routes, Route } from 'react-router-dom';
import StudentManagement from './components/StudentManagement';
import StudentDetailView from './pages/StudentDetailView';
import SignIn from './components/SignUp';
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
        <>
          <Route path="/" element={<StudentManagement />} />
          <Route path="/students/:id" element={<StudentDetailView />} />
        </>
      ) : (
        <Route path="*" element={<SignIn />} />
      )}
    </Routes>
  );
}
