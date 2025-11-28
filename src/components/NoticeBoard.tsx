import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, deleteDoc, doc, serverTimestamp, orderBy, query } from 'firebase/firestore';
import { Card, Text, Button, Group, Title, Loader, Modal, TextInput, Textarea, ActionIcon, Container } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPlus } from '@tabler/icons-react';

interface Notice {
  id: string;
  title: string;
  content: string;
  createdAt: any;
  author: string;
}

export default function NoticeBoard() {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [opened, setOpened] = useState(false);
  const [loading, setLoading] = useState(true);
  const user = auth.currentUser;

  const form = useForm({
    initialValues: {
      title: '',
      content: '',
    },
    validate: {
      title: (value) => (value.trim().length > 0 ? null : 'Title is required'),
      content: (value) => (value.trim().length > 0 ? null : 'Content is required'),
    },
  });

  useEffect(() => {
    const noticesCollection = collection(db, 'notices');
    const q = query(noticesCollection, orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const noticeList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Notice));
      setNotices(noticeList);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await addDoc(collection(db, 'notices'), {
        ...values,
        createdAt: serverTimestamp(),
        author: user?.email || 'Admin',
      });
      notifications.show({ title: 'Success', message: 'Notice posted successfully', color: 'green' });
      setOpened(false);
      form.reset();
    } catch (error) {
      console.error(error);
      notifications.show({ title: 'Error', message: 'Failed to post notice', color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this notice?')) return;
    try {
      await deleteDoc(doc(db, 'notices', id));
      notifications.show({ title: 'Success', message: 'Notice deleted', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete notice', color: 'red' });
    }
  };

  if (loading) return <Loader />;

  return (
    <Container>
      <Group justify="space-between" mb="lg">
        <Title order={2}>Notice Board</Title>
        <Button leftSection={<IconPlus size={16} />} onClick={() => setOpened(true)}>New Notice</Button>
      </Group>

      {notices.length === 0 ? (
        <Text c="dimmed" fs="italic">No notices posted yet.</Text>
      ) : (
        notices.map((notice) => (
          <Card key={notice.id} withBorder shadow="sm" radius="md" mb="md">
            <Group justify="space-between" mb="xs">
              <Text fw={500}>{notice.title}</Text>
              <ActionIcon color="red" variant="subtle" onClick={() => handleDelete(notice.id)}>
                <IconTrash size={16} />
              </ActionIcon>
            </Group>
            <Text size="sm" c="dimmed" mb="md">
              Posted on {notice.createdAt?.toDate().toLocaleDateString()} by {notice.author}
            </Text>
            <Text style={{ whiteSpace: 'pre-wrap' }}>{notice.content}</Text>
          </Card>
        ))
      )}

      <Modal opened={opened} onClose={() => setOpened(false)} title="Create New Notice">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Title" placeholder="Important Announcement" {...form.getInputProps('title')} required />
          <Textarea label="Content" placeholder="Enter notice details..." minRows={4} mt="md" {...form.getInputProps('content')} required />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button type="submit">Post Notice</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
