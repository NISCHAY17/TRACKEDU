import { AppShell, Title, NavLink, Burger, Group } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { IconHome2, IconUsers, IconClipboardText, IconSchool, IconSettings, IconListDetails } from '@tabler/icons-react';
import StudentManagement from './StudentManagement';
import ClassManagement from './ClassManagement';
import Settings from './Settings';
import StudentDetailView from '../pages/StudentDetailView';
import Manage from './Manage';

const DashboardHome = () => <Title>Welcome to TrackEdu</Title>;
const NoticeBoard = () => <Title>Notice Board</Title>;

export default function Dashboard() {
  const [mobileOpened, { toggle: toggleMobile }] = useDisclosure();
  const [desktopOpened, { toggle: toggleDesktop }] = useDisclosure(true);
  const location = useLocation();

  const navLinks = [
    { icon: IconHome2, label: 'Dashboard', path: '/' },
    { icon: IconUsers, label: 'Students', path: '/students' },
    { icon: IconSchool, label: 'Classes', path: '/classes' },
    { icon: IconClipboardText, label: 'Notice Board', path: '/notice-board' },
    { icon: IconListDetails, label: 'Manage', path: '/manage' },
    { icon: IconSettings, label: 'Settings', path: '/settings' },
  ];

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{
        width: 300,
        breakpoint: 'sm',
        collapsed: { mobile: !mobileOpened, desktop: !desktopOpened },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md">
          <Burger opened={mobileOpened} onClick={toggleMobile} hiddenFrom="sm" size="sm" />
          <Burger opened={desktopOpened} onClick={toggleDesktop} visibleFrom="sm" size="sm" />
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
              active={location.pathname === link.path || (link.path !== '/' && location.pathname.startsWith(link.path))}
              onClick={() => {
                  // Close mobile menu on navigation
                  if (mobileOpened) toggleMobile();
              }}
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
          <Route path="/manage" element={<Manage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </AppShell.Main>
    </AppShell>
  );
}
