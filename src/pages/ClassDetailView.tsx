import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot, addDoc, orderBy, serverTimestamp } from 'firebase/firestore';
import { Container, Title, Text, Button, Group, Paper, Loader, Alert, Table, Avatar, Divider, Tabs, Textarea, Card } from '@mantine/core';
import { IconArrowLeft, IconUser, IconId, IconMessage, IconUsers } from '@tabler/icons-react';

interface ClassData { id: string; name: string; teacher: string; }
interface Student { id: string; name: string; studentId: string; email?: string; }
interface Post { id: string; content: string; createdAt: any; author: string; }

export default function ClassDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [posts, setPosts] = useState<Post[]>([]);
  const [newPost, setNewPost] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!id) return;

    const fetchClassData = async () => {
      try {
        const classSnap = await getDoc(doc(db, 'classes', id));
        if (classSnap.exists()) {
          setClassData({ id: classSnap.id, ...classSnap.data() } as ClassData);
        } else {
          setError('Class not found.');
          setLoading(false);
          return;
        }

        const unsubStudents = onSnapshot(query(collection(db, 'students'), where('class', '==', id)), (snapshot) => {
          setStudents(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Student)));
        });

        const unsubPosts = onSnapshot(query(collection(db, 'classes', id, 'posts'), orderBy('createdAt', 'desc')), (snapshot) => {
          setPosts(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Post)));
          setLoading(false);
        });

        return () => { unsubStudents(); unsubPosts(); };
      } catch (err) {
        console.error(err);
        setError('Failed to load data.');
        setLoading(false);
      }
    };
    fetchClassData();
  }, [id]);

  const handlePost = async () => {
    if (!newPost.trim() || !id || !user) return;
    await addDoc(collection(db, 'classes', id, 'posts'), {
      content: newPost,
      createdAt: serverTimestamp(),
      author: user.email || 'Admin', 
    });
    setNewPost('');
  };

  if (loading) return <Container style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></Container>;
  if (error) return <Container mt="lg"><Alert color="red" title="Error">{error}</Alert></Container>;

  return (
    <Container mt="lg">
      <Button variant="light" leftSection={<IconArrowLeft size={14} />} onClick={() => navigate(-1)} mb="lg">Back</Button>
      <Paper shadow="md" p="xl" radius="md" mb="xl">
        <Title order={1}>{classData?.name}</Title>
        <Group mt="xs" c="dimmed">
            <Group gap="xs"><IconUser size={16} /><Text>Teacher: {classData?.teacher}</Text></Group>
            <Divider orientation="vertical" />
            <Group gap="xs"><IconId size={16} /><Text>ID: {classData?.id}</Text></Group>
        </Group>
      </Paper>

      <Tabs defaultValue="stream">
        <Tabs.List>
          <Tabs.Tab value="stream" leftSection={<IconMessage size={14} />}>Stream</Tabs.Tab>
          <Tabs.Tab value="people" leftSection={<IconUsers size={14} />}>People</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="stream" pt="lg">
          <Paper withBorder p="md" mb="lg">
            <Textarea placeholder="Announce something to your class" value={newPost} onChange={(e) => setNewPost(e.currentTarget.value)} autosize minRows={2} mb="sm" />
            <Group justify="flex-end"><Button onClick={handlePost} disabled={!newPost.trim()}>Post</Button></Group>
          </Paper>
          {posts.map(post => (
            <Card key={post.id} withBorder mb="sm" shadow="sm">
              <Group mb="xs" justify="space-between">
                <Text fw={500} size="sm">{post.author}</Text>
                <Text size="xs" c="dimmed">{post.createdAt?.toDate().toLocaleString()}</Text>
              </Group>
              <Text>{post.content}</Text>
            </Card>
          ))}
        </Tabs.Panel>

        <Tabs.Panel value="people" pt="lg">
          {students.length > 0 ? (
            <Paper withBorder radius="md">
              <Table striped>
                <Table.Thead><Table.Tr><Table.Th>Name</Table.Th><Table.Th>ID</Table.Th><Table.Th>Actions</Table.Th></Table.Tr></Table.Thead>
                <Table.Tbody>
                  {students.map((student) => (
                    <Table.Tr key={student.id}>
                      <Table.Td><Group gap="sm"><Avatar color="blue" radius="xl" size="sm">{student.name.charAt(0)}</Avatar><Text size="sm" fw={500}>{student.name}</Text></Group></Table.Td>
                      <Table.Td>{student.studentId}</Table.Td>
                      <Table.Td><Button variant="light" size="xs" component={Link} to={`/students/${student.id}`}>View</Button></Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Paper>
          ) : <Alert color="blue">No students enrolled.</Alert>}
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
