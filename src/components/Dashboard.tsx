import { AppShell, Title, NavLink, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { IconHome2, IconUsers, IconClipboardText, IconSchool, IconSettings } from '@tabler/icons-react'; 
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import Settings from './Settings';

const DashboardHome = () => <Title>Dashboard Home</Title>;
const NoticeBoard = () => <Title>Notice Board</Title>;

export default function Dashboard() {
  const [opened, { toggle }] = useDisclosure();
  const location = useLocation();


  const navLinks = [
    { icon: IconHome2, label: 'Dashboard', path: '/dashboard' },
    { icon: IconUsers, label: 'Students', path: '/dashboard/students' },
    { icon: IconSchool, label: 'Classes', path: '/dashboard/classes' },
    { icon: IconClipboardText, label: 'Notice Board', path: '/dashboard/notice-board' },
    { icon: IconSettings, label: 'Settings', path: '/dashboard/settings' },
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
              to={link.path}
              active={location.pathname.startsWith(link.path)}
              onClick={toggle}
            />
          ))}
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        <Routes>
          <Route path="/" element={<DashboardHome />} />
          <Route path="/students" element={<StudentManagement />} />
          <Route path="/classes" element={<ClassManagement />} /> 
          <Route path="/notice-board" element={<NoticeBoard />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
