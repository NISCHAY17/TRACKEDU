import { AppShell, Title, NavLink, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation, Outlet } from 'react-router-dom';
import { IconHome2, IconUsers, IconClipboardText, IconSchool, IconSettings } from '@tabler/icons-react';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import Settings from './Settings';
import StudentDetailView from '../pages/StudentDetailView'; 

const DashboardHome = () => <Title>Welcome to TrackEdu</Title>;
const NoticeBoard = () => <Title>Notice Board</Title>;

export default function Dashboard() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();

  const navLinks = [
    { icon: IconHome2, label: 'Dashboard', path: '/' },
    { icon: IconUsers, label: 'Students', path: '/students' },
    { icon: IconSchool, label: 'Classes', path: '/classes' },
    { icon: IconClipboardText, label: 'Notice Board', path: '/notice-board' },
    { icon: IconSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
          <Title>TrackEdu Admin</Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <AppShell.Section grow>
          {navLinks.map((link) => (
            <NavLink
              key={link.label}
              label={link.label}
              leftSection={<link.icon size={16} />}
              component={Link}
              to={link.path} // Link to the correct, simple path
              active={location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))}
              onClick={toggle}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/students/:id" element={<StudentDetailView />} /> 
          <Route path="/classes" element={<ClassManagement />} />
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
