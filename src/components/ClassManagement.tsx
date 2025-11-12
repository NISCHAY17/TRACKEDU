import { useState, useEffect } from 'react';
import { Table, Button, Modal, TextInput, Group, Title } from '@mantine/core';
import { useForm } from '@mantine/form';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

interface Class {
  id: string;
  name: string;
  teacher: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const form = useForm({
    initialValues: {
      id: '',
      name: '',
      teacher: '',
    },
  });

  useEffect(() => {
    const classesCollection = collection(db, 'classes');
    const unsubscribe = onSnapshot(classesCollection, (snapshot) => {
      const classList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Class));
      setClasses(classList);
    });
    return unsubscribe;
  }, []);

  const openModal = (cls?: Class) => {
    if (cls) {
      setIsEditing(true);
      form.setValues(cls);
    } else {
      setIsEditing(false);
      form.reset();
    }
    setOpened(true);
  };

  const handleSubmit = async (values: typeof form.values) => {
    const { id, name, teacher } = values;

    if (!id) {
      alert('Class ID is required.');
      return;
    }

    const classData = { name, teacher };

    try {
      const classDoc = doc(db, 'classes', id);
      await setDoc(classDoc, classData);
    } catch (error) {
      console.error("Error saving class: ", error);
    }
    setOpened(false);
  };

  const handleDelete = async (id: string) => {
    try {
      const classDoc = doc(db, 'classes', id);
      await deleteDoc(classDoc);
    } catch (error) {
      console.error("Error deleting class: ", error);
    }
  };

  const rows = classes.map((cls) => (
    <Table.Tr key={cls.id}>
      <Table.Td>{cls.id}</Table.Td>
      <Table.Td>{cls.name}</Table.Td>
      <Table.Td>{cls.teacher}</Table.Td>
      <Table.Td>
        <Group>
          <Button size="xs" onClick={() => openModal(cls)}>Edit</Button>
          <Button size="xs" color="red" onClick={() => handleDelete(cls.id)}>Delete</Button>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (
    <>
      <Title order={2} mb="lg">Class Management</Title>
      <Button onClick={() => openModal()} mb="lg">Add Class</Button>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Class ID</Table.Th>
            <Table.Th>Class Name</Table.Th>
            <Table.Th>Teacher</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            label="Class ID"
            placeholder="e.g., 2024-Fall-Batch-A"
            {...form.getInputProps('id')}
            disabled={isEditing}
            required
          />
          <TextInput label="Class Name" {...form.getInputProps('name')} required mt="md" />
          <TextInput label="Teacher" {...form.getInputProps('teacher')} required mt="md" />
          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Class</Button>
        </form>
      </Modal>
    </>
  );
}

