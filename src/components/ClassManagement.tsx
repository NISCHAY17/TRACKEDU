import { useState, useEffect } from 'react';
import {
  Accordion,
  Button,
  Modal,
  TextInput,
  Group,
  Title,
  Box,
  Text,
  Badge,
  ActionIcon,
  Menu,
  Loader,
  Center,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { collection, onSnapshot, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { IconPencil, IconTrash, IconDotsVertical, IconUsers, IconEye } from '@tabler/icons-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';

interface Class {
  id: string;
  name: string;
  teacher: string;
}

interface Student {
    id: string;
    name: string;
    class: string;
}

export default function ClassManagement() {
  const [user] = useAuthState(auth);
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentsByClass, setStudentsByClass] = useState<Record<string, Student[]>>({});
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const form = useForm({
    initialValues: {
      id: '',
      name: '',
      teacher: '',
    },
    validate: {
      id: (value) => (value.trim().length > 0 ? null : 'Class ID is required'),
      name: (value) => (value.trim().length > 0 ? null : 'Class name is required'),
      teacher: (value) => (value.trim().length > 0 ? null : 'Teacher name is required'),
    },
  });

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    };

    setLoading(true);

    const classesCollection = collection(db, 'classes');
    const studentsCollection = collection(db, 'students');

    const unsubscribeClasses = onSnapshot(classesCollection, (snapshot) => {
      const classList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Class));
      setClasses(classList);
      setLoading(false);
    }, (error) => {
        console.error("Error fetching classes:", error);
        setLoading(false);
    });

    const unsubscribeStudents = onSnapshot(studentsCollection, (snapshot) => {
      const studentList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Student));
      
      const groupedStudents = studentList.reduce((acc, student) => {
        const classId = student.class;
        if (classId) {
            if (!acc[classId]) {
            acc[classId] = [];
            }
            acc[classId].push(student);
        }
        return acc;
      }, {} as Record<string, Student[]>);
      setStudentsByClass(groupedStudents);

    }, (error) => {
        console.error("Error fetching students:", error);
    });


    return () => {
        unsubscribeClasses();
        unsubscribeStudents();
    };
  }, [user]);

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
    const classDocRef = doc(db, 'classes', values.id);
    await setDoc(classDocRef, { name: values.name, teacher: values.teacher }, { merge: true });
    setOpened(false);
  };

  const handleDelete = async (id: string) => {
    const classDocRef = doc(db, 'classes', id);
    await deleteDoc(classDocRef);
  };

  if (loading) {
    return <Center style={{ height: 200 }}><Loader /></Center>;
  }

  return (
    <Box>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Class Management</Title>
        <Button onClick={() => openModal()}>Add Class</Button>
      </Group>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Class' : 'Add New Class'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput 
            label="Class ID" 
            placeholder="e.g. Grade-10-A"
            {...form.getInputProps('id')} 
            required 
            disabled={isEditing}
          />
          <TextInput label="Class Name" {...form.getInputProps('name')} required mt="md" />
          <TextInput label="Teacher Name" {...form.getInputProps('teacher')} mt="md" required />
          <Group justify="flex-end" mt="lg">
            <Button variant="default" onClick={() => setOpened(false)}>Cancel</Button>
            <Button type="submit">{isEditing ? 'Update' : 'Create'}</Button>
          </Group>
        </form>
      </Modal>

      <Accordion variant="separated">
        {classes.map((cls) => {
            const classStudents = studentsByClass[cls.id] || [];
            return (
                <Accordion.Item key={cls.id} value={cls.id}>
                    <Accordion.Control>
                        <Group justify="space-between">
                            <Box>
                                <Text fw={500}>{cls.name} <Text span c="dimmed" size="xs">({cls.id})</Text></Text>
                                <Text size="sm" c="dimmed">Teacher: {cls.teacher}</Text>
                            </Box>
                            <Group gap="xs">
                                <Badge
                                  leftSection={<IconUsers size={12} />}
                                  variant="light"
                                >
                                  {classStudents.length} Students
                                </Badge>
                                <ActionIcon variant="subtle" onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/classes/${cls.id}`);
                                }}>
                                    <IconEye size={16} />
                                </ActionIcon>
                                <Menu shadow="md" width={200} withinPortal>
                                    <Menu.Target>
                                        <ActionIcon variant="subtle" onClick={(e) => e.stopPropagation()}><IconDotsVertical size={16} /></ActionIcon>
                                    </Menu.Target>
                                    <Menu.Dropdown>
                                        <Menu.Item leftSection={<IconPencil size={14} />} onClick={() => openModal(cls)}>
                                            Edit Class
                                        </Menu.Item>
                                        <Menu.Item color="red" leftSection={<IconTrash size={14} />} onClick={() => handleDelete(cls.id)}>
                                            Delete Class
                                        </Menu.Item>
                                    </Menu.Dropdown>
                                </Menu>
                            </Group>
                        </Group>
                    </Accordion.Control>
                    <Accordion.Panel>
                        {classStudents.length > 0 ? (
                            classStudents.map(student => (
                                <Box key={student.id} p="xs" component={Link} to={`/students/${student.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                   <Text>• {student.name}</Text>
                                </Box>
                            ))
                        ) : (
                            <Text c="dimmed" fs="italic" p="xs">No students enrolled in this class yet.</Text>
                        )}
                    </Accordion.Panel>
                </Accordion.Item>
            )
        })}
      </Accordion>
    </Box>
  );
}
