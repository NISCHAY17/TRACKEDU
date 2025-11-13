import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db, auth } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { notifications } from '@mantine/notifications';
import { Container, Card, Title, Text, Button, Group, Paper, Avatar, Divider, Loader, Alert, Modal, TextInput, Select } from '@mantine/core';
import { DatePickerInput } from '@mantine/dates';
import { useForm } from '@mantine/form';
import { IconArrowLeft, IconPhone, IconMail, IconCake, IconPencil } from '@tabler/icons-react';

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
  const [isEditModalOpen, setEditModalOpen] = useState(false);
  const user = auth.currentUser;

  const form = useForm({
    initialValues: {
      name: '',
      studentId: '',
      class: '',
      email: '',
      phone: '',
      dob: null as Date | null,
    },
  });

  const fetchStudent = async () => {
    if (!user || !id) {
      setError('User not found or student ID is missing.');
      setLoading(false);
      return;
    }
    try {
      const studentDocRef = doc(db, `users/${user.uid}/students`, id);
      const studentDoc = await getDoc(studentDocRef);

      if (studentDoc.exists()) {
        const studentData = { id: studentDoc.id, ...studentDoc.data() } as Student;
        setStudent(studentData);
        form.setValues({
          name: studentData.name,
          studentId: studentData.studentId,
          class: studentData.class,
          email: studentData.email || '',
          phone: studentData.phone || '',
          dob: studentData.dob?.toDate() || null,
        });
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

  useEffect(() => {
    fetchStudent();
  }, [id, user]);

  const handleUpdateStudent = async (values: typeof form.values) => {
    if (!user || !student) return;

    const studentDocRef = doc(db, `users/${user.uid}/students`, student.id);

    try {
      await updateDoc(studentDocRef, {
        ...values,
        dob: values.dob ? new Date(values.dob) : null,
      });
      notifications.show({
        title: 'Success',
        message: 'Student details updated successfully!',
        color: 'green',
      });
      setEditModalOpen(false);
      fetchStudent(); 
    } catch (error) {
      console.error('Error updating student: ', error);
      notifications.show({
        title: 'Error',
        message: 'Failed to update student details.',
        color: 'red',
      });
    }
  };

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
        <Group justify="space-between">
          <Group>
            <Avatar color="blue" size="xl" radius="50%">
              {studentNameInitial}
            </Avatar>
            <div>
              <Title order={1}>{student?.name}</Title>
              <Text c="dimmed">Student ID: {student?.studentId}</Text>
              <Text c="dimmed">Class: {student?.class}</Text>
            </div>
          </Group>
          <Button leftSection={<IconPencil size={14}/>} onClick={() => setEditModalOpen(true)}>Edit</Button>
        </Group>

        <Divider my="xl" />

        <Title order={3} mb="md">Contact Information</Title>  
        <Group>
          <IconMail size={20} />
          <Text>{student?.email || 'Not specified'}</Text>
        </Group>
        <Group mt="sm">
          <IconPhone size={20} />
          <Text>{student?.phone || 'Not specified'}</Text>
        </Group>
        <Group mt="sm">
            <IconCake size={20} />
            <Text>Birthday: {dob}</Text>
        </Group>

      </Paper>

      <Modal opened={isEditModalOpen} onClose={() => setEditModalOpen(false)} title="Edit Student Details">
        <form onSubmit={form.onSubmit(handleUpdateStudent)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Student ID" {...form.getInputProps('studentId')} required />
           <TextInput label="Class" {...form.getInputProps('class')} required />
          <TextInput label="Email" type="email" {...form.getInputProps('email')} />
          <TextInput label="Phone" {...form.getInputProps('phone')} />
          <DatePickerInput label="Date of Birth" {...form.getInputProps('dob')} />
          <Group justify="flex-end" mt="md">
            <Button variant="default" onClick={() => setEditModalOpen(false)}>Cancel</Button>
            <Button type="submit">Update Student</Button>
          </Group>
        </form>
      </Modal>
    </Container>
  );
}
