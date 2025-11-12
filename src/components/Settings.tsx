import { Card, Title, Text, Group, Switch, Button } from '@mantine/core';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';

export default function Settings() {
  const user = auth.currentUser;
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate('/login');
  };

  return (
    <>
      <Title order={2} mb="lg">Settings</Title>

      <Card withBorder radius="md" p="lg" mb="lg">
        <Title order={4} mb="md">User Profile</Title>
        <Group>
          <Text>Email:</Text>
          <Text c="dimmed">{user ? user.email : 'Not logged in'}</Text>
        </Group>
      </Card>

      <Card withBorder radius="md" p="lg" mb="lg">
        <Title order={4} mb="md">Appearance</Title>
        <Group justify="space-between">
          <Text>Theme</Text>
          {/* This is a placeholder. To Make it  make it functional later. */}
          <Switch size="lg" onLabel="DARK" offLabel="LIGHT" disabled />
        </Group>
      </Card>

      <Card withBorder radius="md" p="lg">
        <Title order={4} mb="md">Account</Title>
        <Button color="red" onClick={handleLogout}>
          Logout
        </Button>
      </Card>
    </>
  );
}
