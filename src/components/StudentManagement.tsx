import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot, addDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { Table, Button, Modal, TextInput, Group, Title, Select, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import  { IconTrash, IconEye } from '@tabler/icons-react';
import { useNavigate } from 'react-router-dom';

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
  phone?: string;
  email?: string;
  dob?: Date | null;
}

interface Class {
  id: string;
  name: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const user = auth.currentUser;
  const navigate = useNavigate();

  const form = useForm<{
    name: string;
    studentId: string;
    class: string;
    phone: string;
    email: string;
    dob: Date | null;
  }>({ 
    initialValues: {
      name: '',
      studentId: '',
      class: '',
      phone: '',
      email: '',
      dob: null,
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      studentId: (value) => (value.length < 2 ? 'Student ID must have at least 2 characters' : null),
      class: (value) => (value.length < 1 ? 'Class is required' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    if (!user) return;
    const studentsCollection = collection(db, `users/${user.uid}/students`);
    const unsubscribe = onSnapshot(studentsCollection, (snapshot) => {
      const studentList: Student[] = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          ...data,
          dob: data.dob && data.dob.toDate ? data.dob.toDate() : null,
        } as Student;
      });
      setStudents(studentList);
    });
    return unsubscribe;
  }, [user]);

  useEffect(() => {
    if (!user) return;
    const classesCollection = collection(db, `users/${user.uid}/classes`);
    const unsubscribe = onSnapshot(classesCollection, (snapshot) => {
      const classList: Class[] = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setAvailableClasses(classList);
    });
    return unsubscribe;
  }, [user]);

  const openModal = (student?: Student) => {
    if (student) {
      setIsEditing(true);
      setSelectedStudent(student);
      form.setValues(student);
    } else {
      setIsEditing(false);
      setSelectedStudent(null);
      form.reset();
    }
    setOpened(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    if (!user) return;
    const studentsCollection = collection(db, `users/${user.uid}/students`);
    try {
      const submissionValues = { ...values };
      if (isEditing && selectedStudent) {
        const studentDoc = doc(db, `users/${user.uid}/students`, selectedStudent.id);
        await setDoc(studentDoc, submissionValues);
        notifications.show({ title: 'Success', message: 'Student updated successfully', color: 'green' });
      } else {
        await addDoc(studentsCollection, submissionValues);
        notifications.show({ title: 'Success', message: 'Student added successfully', color: 'green' });
      }
      setOpened(false);
    } catch (error) {
      console.error("Error saving student: ", error);
      notifications.show({ title: 'Error', message: 'Failed to save student', color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;
    const studentDoc = doc(db, `users/${user.uid}/students`, id);
    try {
      await deleteDoc(studentDoc);
      notifications.show({ title: 'Success', message: 'Student deleted successfully', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete student', color: 'red' });
    }
  };

  const rows = students.map((student) => (
    <Table.Tr key={student.id}>
      <Table.Td>{student.name}</Table.Td>
      <Table.Td>{student.studentId}</Table.Td>
      <Table.Td>{student.class}</Table.Td>
      <Table.Td>
        <Group>
          <ActionIcon variant="light" onClick={() => navigate(`/students/${student.id}`)}><IconEye size={16} /></ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => handleDelete(student.id)}><IconTrash size={16} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2} mb="lg">Student Management</Title>
      <Button onClick={() => openModal()} mb="lg">Add Student</Button>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Student ID</Table.Th>
            <Table.Th>Class</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Student ID" {...form.getInputProps('studentId')} required mt="md" />
          <Select
            label="Class"
            placeholder='Select Class'
            data={availableClasses.map(cls => ({ value: cls.id, label: `${cls.name}` }))}
            {...form.getInputProps('class')}
            required
            mt='md'
          />
          <DatePickerInput
            label="Date of Birth"
            placeholder="Select a date"
            popoverProps={{ withinPortal: true }}
            {...form.getInputProps('dob')}
            mt="md"
          />
          <TextInput label="Phone" {...form.getInputProps('phone')} mt="md" />
          <TextInput label="Email" {...form.getInputProps('email')} mt="md" />

          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Student</Button>
        </form>
      </Modal>
    </>
  );
}
