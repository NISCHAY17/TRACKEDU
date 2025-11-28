import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { db } from '../firebase';
import { doc, getDoc, collection, query, where, onSnapshot } from 'firebase/firestore';
import { Container, Title, Text, Button, Group, Paper, Loader, Alert, Table, Avatar, Divider } from '@mantine/core';
import { IconArrowLeft, IconUser, IconId } from '@tabler/icons-react';

interface ClassData {
  id: string;
  name: string;
  teacher: string;
}

interface Student {
  id: string;
  name: string;
  studentId: string;
  email?: string;
}

export default function ClassDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [classData, setClassData] = useState<ClassData | null>(null);
  const [students, setStudents] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchClassData = async () => {
      try {
        // Fetch Class Details
        const classRef = doc(db, 'classes', id);
        const classSnap = await getDoc(classRef);

        if (classSnap.exists()) {
          setClassData({ id: classSnap.id, ...classSnap.data() } as ClassData);
        } else {
          setError('Class not found.');
          setLoading(false);
          return;
        }

        // Fetch Students in this Class
        const studentsRef = collection(db, 'students');
        const q = query(studentsRef, where('class', '==', id));
        
        const unsubscribe = onSnapshot(q, (snapshot) => {
          const studentList: Student[] = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
          } as Student));
          setStudents(studentList);
          setLoading(false);
        });

        return unsubscribe;

      } catch (err) {
        console.error("Error fetching class data:", err);
        setError('Failed to load class details.');
        setLoading(false);
      }
    };

    fetchClassData();
  }, [id]);

  if (loading) {
    return <Container style={{ height: '100vh', display: 'flex', justifyContent: 'center', alignItems: 'center' }}><Loader /></Container>;
  }

  if (error) {
    return <Container mt="lg"><Alert color="red" title="Error">{error}</Alert></Container>;
  }

  return (
    <Container mt="lg">
      <Button variant="light" leftSection={<IconArrowLeft size={14} />} onClick={() => navigate(-1)} mb="lg">
        Back to Classes
      </Button>

      <Paper shadow="md" p="xl" radius="md" mb="xl">
        <Group justify="space-between">
          <div>
            <Title order={1}>{classData?.name}</Title>
            <Group mt="xs" c="dimmed">
                <Group gap="xs">
                    <IconUser size={16} />
                    <Text>Teacher: {classData?.teacher}</Text>
                </Group>
                <Divider orientation="vertical" />
                <Group gap="xs">
                    <IconId size={16} />
                    <Text>Class ID: {classData?.id}</Text>
                </Group>
            </Group>
          </div>
          {/* 'Edit Class' button here in the future */}
        </Group>
      </Paper>

      <Title order={3} mb="md">Enrolled Students ({students.length})</Title>
      
      {students.length > 0 ? (
        <Paper withBorder radius="md">
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Name</Table.Th>
                <Table.Th>Student ID</Table.Th>
                <Table.Th>Email</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {students.map((student) => (
                <Table.Tr key={student.id}>
                  <Table.Td>
                    <Group gap="sm">
                        <Avatar color="blue" radius="xl" size="sm">{student.name.charAt(0)}</Avatar>
                        <Text size="sm" fw={500}>{student.name}</Text>
                    </Group>
                  </Table.Td>
                  <Table.Td>{student.studentId}</Table.Td>
                  <Table.Td>{student.email || 'N/A'}</Table.Td>
                  <Table.Td>
                    <Button variant="light" size="xs" component={Link} to={`/students/${student.id}`}>
                      View Profile
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
        </Paper>
      ) : (
        <Alert color="blue">No students enrolled in this class yet.</Alert>
      )}
    </Container>
  );
}
