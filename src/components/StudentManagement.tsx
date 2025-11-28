import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, onSnapshot, addDoc, doc, updateDoc, deleteDoc, runTransaction, Timestamp } from 'firebase/firestore';
import { Table, Button, Modal, TextInput, Group, Title, Select, ActionIcon, Anchor } from '@mantine/core';
import { useForm, type FormErrors } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import { DatePickerInput } from '@mantine/dates';
import { IconTrash, IconEye } from '@tabler/icons-react';
import { useNavigate, Link } from 'react-router-dom';

// Interfaces
interface Student { id: string; name: string; studentId: string; class: string; phone?: string; email?: string; dob?: Date | null; }
interface Class { id: string; name: string; }
interface StudentIdScheme { useScheme: boolean; prefix: string; nextId: number; }
interface StudentFormValues { name: string; studentId: string; class: string; phone: string; email: string; dob: Date | null; }

export default function StudentManagement() {
  // State
  const [students, setStudents] = useState<Student[]>([]);
  const [opened, setOpened] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [availableClasses, setAvailableClasses] = useState<Class[]>([]);
  const [idScheme, setIdScheme] = useState<StudentIdScheme | null>(null);
  const navigate = useNavigate();

  // Form
  const form = useForm<StudentFormValues>({
    initialValues: { name: '', studentId: '', class: '', phone: '', email: '', dob: null, },
    validate: (values) => {
        const errors: FormErrors = {};
        if (values.name.length < 2) {
            errors.name = 'Name must have at least 2 letters';
        }
        if (values.class.length < 1) {
            errors.class = 'Class is required';
        }
        if (!/^\S+@\S+$/.test(values.email)) {
            errors.email = 'Invalid email';
        }
        if (idScheme && !idScheme.useScheme && !isEditing && values.studentId.trim() === '') {
            errors.studentId = 'Student ID is required';
        }
        return errors;
    },
  });

  // Effects
  useEffect(() => {
    const unsubStudents = onSnapshot(collection(db, 'students'), (snapshot) => {
      const studentList: Student[] = snapshot.docs.map(doc => {
        const data = doc.data();
        let dob: Date | null = null;

        // Robust date parsing
        if (data.dob) {
            if (typeof data.dob.toDate === 'function') {

                dob = data.dob.toDate();
            } else if (data.dob instanceof Date) {
          
                dob = data.dob;
            } else if (typeof data.dob === 'string' || typeof data.dob === 'number') {
          
                dob = new Date(data.dob);
            }
        }

        return { id: doc.id, ...data, dob } as Student;
      });
      setStudents(studentList);
    });
    const unsubClasses = onSnapshot(collection(db, 'classes'), (snapshot) => {
      const classList: Class[] = snapshot.docs.map(doc => ({ id: doc.id, name: doc.data().name }));
      setAvailableClasses(classList);
    });
    const unsubScheme = onSnapshot(doc(db, 'config', 'studentIdScheme'), (doc) => {
      setIdScheme(doc.data() as StudentIdScheme);
    });
    return () => { unsubStudents(); unsubClasses(); unsubScheme(); };
  }, []);

  // Handlers
  const openModal = async (student?: Student) => {
    if (student) {
      setIsEditing(true);
      setSelectedStudent(student);
      form.setValues(student);
    } else {
      setIsEditing(false);
      setSelectedStudent(null);
      form.reset();
      if (idScheme?.useScheme) {
        if (!idScheme.prefix) {
          notifications.show({
            title: 'Configuration Required',
            message: <>Please <Anchor component={Link} to="/manage">set a prefix</Anchor> for the student ID scheme first.</>,
            color: 'red',
          });
          return;
        }
        form.setFieldValue('studentId', `${idScheme.prefix}${idScheme.nextId}`);
      }
    }
    setOpened(true);
  };

  const handleSubmit = async (values: StudentFormValues) => {
    try {
      if (isEditing && selectedStudent) {
        // Cast values to any to bypass strict type checking for updateDoc, as we know the structure is compatible
        await updateDoc(doc(db, 'students', selectedStudent.id), values as any);
        notifications.show({ title: 'Success', message: 'Student updated successfully', color: 'green' });
      } else {
        if (idScheme?.useScheme) {
          await runTransaction(db, async (transaction) => {
            const schemeRef = doc(db, 'config', 'studentIdScheme');
            const schemeDoc = await transaction.get(schemeRef);
            if (!schemeDoc.exists() || !schemeDoc.data().prefix) throw new Error("Student ID scheme not configured!");
            const scheme = schemeDoc.data();
            const newStudentId = `${scheme.prefix}${scheme.nextId}`;
            const newStudentRef = doc(collection(db, "students"));
            transaction.set(newStudentRef, { ...values, studentId: newStudentId });
            transaction.update(schemeRef, { nextId: scheme.nextId + 1 });
          });
        } else {
          await addDoc(collection(db, 'students'), values);
        }
        notifications.show({ title: 'Success', message: 'Student added successfully', color: 'green' });
      }
      setOpened(false);
    } catch (error: any) {
      notifications.show({ title: 'Error', message: `Failed to save student: ${error.message}`, color: 'red' });
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'students', id));
      notifications.show({ title: 'Success', message: 'Student deleted successfully', color: 'green' });
    } catch (error) {
      notifications.show({ title: 'Error', message: 'Failed to delete student', color: 'red' });
    }
  };

  const isAutoIdActive = !isEditing && (idScheme?.useScheme ?? false);

  return (
    <>
      <Title order={2} mb="lg">Student Management</Title>
      <Button onClick={() => openModal()} mb="lg">Add Student</Button>
      <Table withTableBorder withColumnBorders>
        <Table.Thead>
          <Table.Tr><Table.Th>Name</Table.Th><Table.Th>Student ID</Table.Th><Table.Th>Class</Table.Th><Table.Th>Actions</Table.Th></Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {students.map((student) => (
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
          ))}
        </Table.Tbody>
      </Table>

      <Modal opened={opened} onClose={() => setOpened(false)} title={isEditing ? 'Edit Student' : 'Add Student'}>
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput label="Name" {...form.getInputProps('name')} required />
          <TextInput label="Student ID" {...form.getInputProps('studentId')} required mt="md" disabled={isEditing || isAutoIdActive} />
          <Select
            label="Class"
            placeholder='Select Class'
            data={availableClasses.map(cls => ({ value: cls.id, label: cls.name }))}
            {...form.getInputProps('class')}
            required
            mt='md'
          />
          <DatePickerInput label="Date of Birth" {...form.getInputProps('dob')} mt="md" />
          <TextInput label="Phone" {...form.getInputProps('phone')} mt="md" />
          <TextInput label="Email" {...form.getInputProps('email')} required mt="md" />

          <Button type="submit" mt="lg">{isEditing ? 'Update' : 'Add'} Student</Button>
        </form>
      </Modal>
    </>
  );
}
