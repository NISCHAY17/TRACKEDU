import { BrowserRouter as Router, Routes, Route, Navigate, Link } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Title, Center, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconChalkboard, IconUsers } from '@tabler/icons-react';
import Dashboard from './components/Dashboard';
import ClassManagement from './components/ClassManagement';
import StudentManagement from './components/StudentManagement';
import StudentDetail from './pages/StudentDetailView';
import ClassDetail from './pages/ClassDetailView'; 
import Login from './components/Login';
import SignUp from './components/SignUp';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';

function App() {
  const [user, loading] = useAuthState(auth);
  const [opened, { toggle }] = useDisclosure();

  if (loading) {
    return <Center style={{ height: '100vh' }}><Loader size="xl" /></Center>;
  }

  const privateRoutes = (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 250, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title order={3}>Admin Dashboard</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <NavLink component={Link} to="/" label="Dashboard" leftSection={<IconHome size="1rem" stroke={1.5} />} />
        <NavLink component={Link} to="/classes" label="Class Management" leftSection={<IconChalkboard size="1rem" stroke={1.5} />} />
        <NavLink component={Link} to="/students" label="Student Management" leftSection={<IconUsers size="1rem" stroke={1.5} />} />
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/classes/:id" element={<ClassDetail />} /> 
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/students/:id" element={<StudentDetail />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );

  return (
    <Router>
      <Routes>
        {!user ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="*" element={<Navigate to="/login" />} />
          </>
        ) : (
          <Route path="/*" element={privateRoutes} />
        )}
      </Routes>
    </Router>
  );
}

export default App;
