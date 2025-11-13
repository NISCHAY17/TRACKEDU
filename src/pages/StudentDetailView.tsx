import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';
import { Container, Card, Title, Text, Button, Group, Paper, Avatar, Divider, Loader, Alert } from '@mantine/core';
import { IconArrowLeft, IconPhone, IconMail, IconCake } from '@tabler/icons-react';

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  phone?: string;
  email?: string;
  dob?: { toDate: () => Date } | null; 
}

export default function StudentDetailView() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [student, setStudent] = useState<Student | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const user = auth.currentUser;

  useEffect(() => {
    if (!user || !id) {
      setError('User not found or student ID is missing.');
      setLoading(false);
      return;
    }

    const fetchStudent = async () => {
      try {
        const studentDocRef = doc(db, `users/${user.uid}/students`, id);
        const studentDoc = await getDoc(studentDocRef);

        if (studentDoc.exists()) {
          setStudent({ id: studentDoc.id, ...studentDoc.data() } as Student);
        } else {
          setError('Student not found.');
        }
      } catch (err) {
        console.error("Error fetching student: ", err);
        setError('Failed to fetch student data.');
      } finally {
        setLoading(false);
      }
    };

    fetchStudent();
  }, [id, user]);

  if (loading) {
    return <Container style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}><Loader /></Container>;
  }

  if (error) {
    return <Container mt="lg"><Alert color="red" title="Error">{error}</Alert></Container>;
  }

  const studentNameInitial = student?.name ? student.name.charAt(0).toUpperCase() : '?';
  const dob = student?.dob?.toDate ? student.dob.toDate().toLocaleDateString() : 'Not specified';

  return (
    <Container mt="lg">
      <Button variant="light" leftSection={<IconArrowLeft size={14} />} onClick={() => navigate(-1)} mb="lg">
        Back to Student List
      </Button>
      <Paper shadow="md" p="xl" radius="md">
        <Group >
          <Avatar color="blue" size="xl" radius="50%">
            {studentNameInitial}
          </Avatar>
          <div>
            <Title order={1}>{student?.name}</Title>
            <Text c="dimmed">Student ID: {student?.studentId}</Text>
            <Text c="dimmed">Class: {student?.class}</Text>
          </div>
        </Group>

        <Divider my="xl" />

        <Title order={3} mb="md">Contact Information</Title>
        <Group >
          <IconMail size={20} />
          <Text>{student?.email || 'Not specified'}</Text>
        </Group>
        <Group mt="sm" >
          <IconPhone size={20} />
          <Text>{student?.phone || 'Not specified'}</Text>
        </Group>
        <Group mt="sm">
            <IconCake size={20} />
            <Text>Birthday: {dob}</Text>
        </Group>

        {}

      </Paper>
    </Container>
  );
}
