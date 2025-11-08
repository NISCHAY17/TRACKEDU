import { useState } from 'react';
import { Table, Button, Modal, TextInput, Group, Title } from '@mantine/core';
import { useForm } from '@mantine/form';

// Mock data for now
const mockClasses = [
  { id: '1', name: 'Batch A', teacher: 'Mr. Smith' },
  { id: '2', name: 'Batch B', teacher: 'Ms. Jones' },
  { id: '3', name: 'Batch C', teacher: 'Mr. Davis' },
];

interface Class {
  id: string;
  name: string;
  teacher: string;
}

export default function ClassManagement() {
  const [classes, setClasses] = useState<Class[]>(mockClasses);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);

  const form = useForm({
    initialValues: {
      name: '',
      teacher: '',
    },
  });

  const openModal = (cls?: Class) => {
    if (cls) {
      setIsEditing(true);
      setSelectedClass(cls);
      form.setValues(cls);
    } else {
      setIsEditing(false);
      setSelectedClass(null);
      form.reset();
    }
    setOpened(true);
  };

  const handleSubmit = (values: typeof form.values) => {
    // This will be connected to Firestore later
    if (isEditing && selectedClass) {
      setClasses(classes.map(c => c.id === selectedClass.id ? { ...c, ...values } : c));
    } else {
      setClasses([...classes, { id: (classes.length + 1).toString(), ...values }]);
    }
    setOpened(false);
  };

  const handleDelete = (id: string) => {
    // This will be connected to Firestore later
    setClasses(classes.filter(c => c.id !== id));
  };

  const rows = classes.map((cls) => (
    <Table.Tr key={cls.id}>
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
            <Table.Th>Class Name</Table.Th>
            <Table.Th>Teacher</Table.Th>
            <Table.Th>Actions</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>{rows}</Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Class' : 'Add Class'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Class Name" {...form.getInputProps('name')} required />
          <TextInput label="Teacher" {...form.getInputProps('teacher')} required mt="md" />
          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Class</Button>
        </form>
      </Modal>
    </>
  );
}
