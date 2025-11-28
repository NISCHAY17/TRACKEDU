import { Routes, Route, Navigate, Link, useLocation } from 'react-router-dom';
import { AppShell, Burger, Group, NavLink, Title, Center, Loader } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { IconHome, IconChalkboard, IconUsers, IconClipboardText, IconListDetails, IconSettings, IconSchool } from '@tabler/icons-react';
import Dashboard from './components/Dashboard';
import ClassManagement from './components/ClassManagement';
import StudentManagement from './components/StudentManagement';
import TeacherManagement from './components/TeacherManagement'; 
import NoticeBoard from './components/NoticeBoard'; 
import StudentDetail from './pages/StudentDetailView';
import ClassDetail from './pages/ClassDetailView'; 
import Manage from './components/Manage';
import Settings from './components/Settings';
import Login from './components/Login';
import SignUp from './components/SignUp';
import { auth } from './firebase';
import { useAuthState } from 'react-firebase-hooks/auth';
import logo from './assets/LOGO1.png'; 

function App() {
  const [user, loading] = useAuthState(auth);
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();

  if (loading) {
    return <Center style={{ height: '100vh' }}><Loader size="xl" /></Center>;
  }

  const navLinks = [
    { icon: IconHome, label: 'Dashboard', path: '/' },
    { icon: IconChalkboard, label: 'Classes', path: '/classes' },
    { icon: IconSchool, label: 'Teachers', path: '/teachers' },
    { icon: IconUsers, label: 'Students', path: '/students' },
    { icon: IconClipboardText, label: 'Notice Board', path: '/notice-board' },
    { icon: IconListDetails, label: 'Manage', path: '/manage' },
    { icon: IconSettings, label: 'Settings', path: '/settings' },
  ];

  const privateRoutes = (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 250,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
          <img src={logo} alt="TrackEdu" style={{ height: 30 }} /> 
          <Title order={3}>Admin Dashboard</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        {navLinks.map((link) => (
            <NavLink 
                key={link.path}
                component={Link} 
                to={link.path} 
                label={link.label} 
                leftSection={<link.icon size="1rem" stroke={1.5} />} 
                active={location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))}
                onClick={() => {
                    if (mobileOpened) toggleMobile();
                }}
            />
        ))}
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/classes/:id" element={<ClassDetail />} /> 
          <Route path="/teachers" element={<TeacherManagement />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/students/:id" element={<StudentDetail />} />
          <Route path="/manage" element={<Manage />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/notice-board" element={<NoticeBoard />} /> 
        </Routes>
      </AppShell.Main>
    </AppShell>
  );

  return (
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
  );
}

export default App;
