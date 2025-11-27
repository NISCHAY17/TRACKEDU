import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { Title, TextInput, NumberInput, Button, Paper, Group, Switch, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

export default function Manage() {
  const [loading, setLoading] = useState(true);
  const form = useForm({
    initialValues: {
      useScheme: true,
      prefix: '',
      nextId: 1,
    },
    validate: (values) => {
      if (values.useScheme) {
        return {
          prefix: values.prefix.trim() === '' ? 'Prefix is required' : null,
          nextId: values.nextId < 1 ? 'Starting number must be at least 1' : null,
        };
      }
      return {};
    },
  });

  useEffect(() => {
    const fetchScheme = async () => {
      const docRef = doc(db, 'config', 'studentIdScheme');
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        form.setValues(docSnap.data());
      }
      setLoading(false);
    };
    fetchScheme();
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      const docRef = doc(db, 'config', 'studentIdScheme');
      await setDoc(docRef, values);
      notifications.show({ title: 'Success', message: 'Student ID scheme saved successfully', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to save scheme', color: 'red' });
    }
  };

  const { useScheme, prefix, nextId } = form.values;

  return (
    <>
      <Title order={2} mb="lg">Manage Student ID Scheme</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Switch
            label="Use automatic Student ID generation scheme"
            checked={useScheme}
            {...form.getInputProps('useScheme')}
          />

          {useScheme && (
            <>
              <TextInput label="Student ID Prefix" placeholder="e.g., STU-" {...form.getInputProps('prefix')} mt="md" required />
              <NumberInput label="Next Student ID Number" placeholder="e.g., 101" {...form.getInputProps('nextId')} mt="md" min={1} required />
              <Text mt="sm" size="sm" c="dimmed">
                Preview of next ID: {prefix}{nextId}
              </Text>
            </>
          )}

          <Group justify="flex-end" mt="lg">
            <Button type="submit" loading={loading}>Save Scheme</Button>
          </Group>
        </form>
      </Paper>
    </>
  );
}
