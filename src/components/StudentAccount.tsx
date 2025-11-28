import { useState, useEffect } from 'react';
import { Card, Button, TextInput, Title, Text, Alert, Group, Loader, Center } from '@mantine/core';
import { useForm } from '@mantine/form';
import { ref, get, set } from 'firebase/database';
import { rtdb } from '../firebase';
import { notifications } from '@mantine/notifications';

interface StudentAccountProps {
  studentId: string;
  studentEmail?: string; 
  hasAccount: boolean; 
}

export default function StudentAccount({ studentId }: StudentAccountProps) {
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [existingCredentials, setExistingCredentials] = useState<{username?: string, password?: string} | null>(null);

  const form = useForm({
    initialValues: {
      username: '',
      password: '',
    },
    validate: {
      username: (value) => (value.length < 3 ? 'Username must be at least 3 characters' : null),
      password: (value) => (value.length < 4 ? 'Password must be at least 4 characters' : null),
    },
  });

  // Fetch existing credentials from Realtime Database
  useEffect(() => {
    let isMounted = true;
    const fetchCredentials = async () => {
      // Set a timeout to avoid getting stuck on loading if DB is not configured
      const timeoutId = setTimeout(() => {
        if (isMounted && fetching) {
          console.warn("Fetching credentials timed out. Showing form.");
          setFetching(false);
        }
      }, 3000); // 3 second timeout

      try {
        const credentialsRef = ref(rtdb, `student_credentials/${studentId}`);
        const snapshot = await get(credentialsRef);
        if (isMounted && snapshot.exists()) {
          const data = snapshot.val();
          setExistingCredentials({
            username: data.username,
            password: data.password
          });
          form.setValues({
            username: data.username,
            password: data.password
          });
        }
      } catch (error) {
        console.error("Error fetching credentials:", error);
      } finally {
        if (isMounted) {
          clearTimeout(timeoutId);
          setFetching(false);
        }
      }
    };
    fetchCredentials();

    return () => { isMounted = false; };
  }, [studentId]);

  const handleSaveAccount = async (values: typeof form.values) => {
    setLoading(true);
    try {
      const credentialsRef = ref(rtdb, `student_credentials/${studentId}`);
      // Save directly to Realtime Database
      await set(credentialsRef, {
        username: values.username,
        password: values.password
      });

      setExistingCredentials({
        username: values.username,
        password: values.password
      });

      notifications.show({
        title: 'Success',
        message: 'Student login credentials saved to Realtime Database!',
        color: 'green',
      });

    } catch (err: any) {
      console.error(err);
      notifications.show({
        title: 'Error',
        message: 'Failed to save login details. Check your connection or database rules.',
        color: 'red',
      });
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
      <Card withBorder mt="md">
         <Center p="xl">
            <Loader size="sm" mr="sm"/>
            <Text>Checking for existing account...</Text>
         </Center>
      </Card>
    );
  }

  return (
    <Card withBorder mt="md">
      <Title order={4} mb="md">Student Login (Realtime DB)</Title>
      <Text size="sm" mb="lg" c="dimmed">
        Set the username and password for the student portal. These details are stored in the Realtime Database.
      </Text>

      {existingCredentials && (
        <Alert color="blue" title="Active Credentials" mb="lg">
          <Group>
            <Text fw={700}>Username:</Text> <Text>{existingCredentials.username}</Text>
          </Group>
          <Group>
            <Text fw={700}>Password:</Text> <Text>{existingCredentials.password}</Text>
          </Group>
        </Alert>
      )}

      <form onSubmit={form.onSubmit(handleSaveAccount)}>
        <TextInput
          label="Username"
          placeholder="e.g., student101"
          required
          {...form.getInputProps('username')}
        />
        <TextInput
          label="Password"
          placeholder="Set a password"
          required
          mt="md"
          {...form.getInputProps('password')}
        />
        <Button type="submit" mt="lg" loading={loading}>
          {existingCredentials ? 'Update Credentials' : 'Create Credentials'}
        </Button>
      </form>
    </Card>
  );
}
