import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, deleteDoc, updateDoc } from 'firebase/firestore';
import { Table, Button, Modal, TextInput, Group, Title, ActionIcon } from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { IconTrash, IconPencil } from '@tabler/icons-react';

interface Teacher {
  id: string;
  name: string;
  email: string;
  subject: string;
  phone: string;
}

export default function TeacherManagement() {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      subject: '',
      phone: '',
    },
    validate: {
      name: (value) => (value.length < 2 ? 'Name must have at least 2 letters' : null),
      email: (value) => (/^\S+@\S+$/.test(value) ? null : 'Invalid email'),
    },
  });

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, 'teachers'), (snapshot) => {
      const teacherList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Teacher));
      setTeachers(teacherList);
    });
    return unsubscribe;
  }, []);

  const openModal = (teacher?: Teacher) => {
    if (teacher) {
      setIsEditing(true);
      setSelectedTeacher(teacher);
      form.setValues(teacher);
    } else {
      setIsEditing(false);
      setSelectedTeacher(null);
      form.reset();
    }
    setOpened(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    try {
      if (isEditing && selectedTeacher) {
        await updateDoc(doc(db, 'teachers', selectedTeacher.id), values);
        notifications.show({ title: 'Success', message: 'Teacher updated successfully', color: 'green' });
      } else {
        await addDoc(collection(db, 'teachers'), values);
        notifications.show({ title: 'Success', message: 'Teacher added successfully', color: 'green' });
      }
      setOpened(false);
    } catch (error: any) {
      notifications.show({ title: 'Error', message: error.message, color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'teachers', id));
      notifications.show({ title: 'Success', message: 'Teacher deleted successfully', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete teacher', color: 'red' });
    }
  };

  const rows = teachers.map((teacher) => (
    <Table.Tr key={teacher.id}>
      <Table.Td>{teacher.name}</Table.Td>
      <Table.Td>{teacher.email}</Table.Td>
      <Table.Td>{teacher.subject}</Table.Td>
      <Table.Td>{teacher.phone}</Table.Td>
      <Table.Td>
        <Group>
          <ActionIcon variant="light" onClick={() => openModal(teacher)}><IconPencil size={16} /></ActionIcon>
          <ActionIcon variant="light" color="red" onClick={() => handleDelete(teacher.id)}><IconTrash size={16} /></ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2} mb="lg">Teacher Management</Title>
      <Button onClick={() => openModal()} mb="lg">Add Teacher</Button>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Subject</Table.Th>
            <Table.Th>Phone</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Teacher' : 'Add Teacher'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Email" {...form.getInputProps('email')} required mt="md" />
          <TextInput label="Subject" {...form.getInputProps('subject')} mt="md" />
          <TextInput label="Phone" {...form.getInputProps('phone')} mt="md" />
          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Teacher</Button>
        </form>
      </Modal>
    </>
  );
}
