import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { ref, onValue, push, set, remove } from 'firebase/database';
import { Table, Button, Modal, TextInput, Group, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';

interface Student {
  id: string;
  name: string;
  studentId: string;
  class: string;
}

export default function StudentManagement() {
  const [students, setStudents] = useState<Student[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      studentId: '',
      class: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      studentId: (value) => (value.length < 2 ? 'Student ID must have at least 2 characters' : null),
      class: (value) => (value.length < 1 ? 'Class is required' : null),
    },
  });

  useEffect(() => {
    const studentsRef = ref(db, 'students');
    onValue(studentsRef, (snapshot) => {
      const data = snapshot.val();
      const studentList: Student[] = data ? Object.entries(data).map(([id, student]) => ({ id, ...(student as Omit<Student, 'id'>) })) : [];
      setStudents(studentList);
    });
  }, []);

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

  const handleSubmit = (values: typeof form.values) => {
    if (isEditing && selectedStudent) {
      const studentRef = ref(db, `students/${selectedStudent.id}`);
      set(studentRef, values)
        .then(() => {
          notifications.show({ title: 'Success', message: 'Student updated successfully', color: 'green' });
          setOpened(false);
        })
        .catch(() => notifications.show({ title: 'Error', message: 'Failed to update student', color: 'red' }));
    } else {
      const studentsRef = ref(db, 'students');
      push(studentsRef, values)
        .then(() => {
          notifications.show({ title: 'Success', message: 'Student added successfully', color: 'green' });
          setOpened(false);
        })
        .catch(() => notifications.show({ title: 'Error', message: 'Failed to add student', color: 'red' }));
    }
  };

  const handleDelete = (id: string) => {
    const studentRef = ref(db, `students/${id}`);
    remove(studentRef)
      .then(() => notifications.show({ title: 'Success', message: 'Student deleted successfully', color: 'green' }))
      .catch(() => notifications.show({ title: 'Error', message: 'Failed to delete student', color: 'red' }));
  };

  const rows = students.map((student) => (
    <Table.Tr key={student.id}>
      <Table.Td>{student.name}</Table.Td>
      <Table.Td>{student.studentId}</Table.Td>
      <Table.Td>{student.class}</Table.Td>
      <Table.Td>
        <Group>
          <Button size="xs" onClick={() => openModal(student)}>Edit</Button>
          <Button size="xs" color="red" onClick={() => handleDelete(student.id)}>Delete</Button>
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
          <TextInput label="Class" {...form.getInputProps('class')} required mt="md" />
          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Student</Button>
        </form>
      </Modal>
    </>
  );
}
