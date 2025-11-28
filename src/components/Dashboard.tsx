import { useState, useEffect } from 'react';
import { db, auth } from '../firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Card, Text, Group, Title, RingProgress, Center, Loader, SimpleGrid } from '@mantine/core';
import { IconUsers, IconChalkboard, IconLicense } from '@tabler/icons-react';

export default function Dashboard() {
  const [user] = useAuthState(auth);
  const [totalStudents, setTotalStudents] = useState(0);
  const [totalClasses, setTotalClasses] = useState(0);
  const [totalTeachers, setTotalTeachers] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
        setLoading(false);
        return;
    }
    setLoading(true);

    const studentsCollection = collection(db, 'students');
    const classesCollection = collection(db, 'classes');

    const unsubscribeStudents = onSnapshot(studentsCollection, (snapshot) => {
      setTotalStudents(snapshot.size);
    }, (error) => {
        console.error("Error fetching students count:", error);
    });

    const unsubscribeClasses = onSnapshot(classesCollection, (snapshot) => {
        const classes = snapshot.docs.map(doc => doc.data());
        const uniqueTeachers = new Set(classes.map(c => c.teacher));
        setTotalClasses(snapshot.size);
        setTotalTeachers(uniqueTeachers.size);
        setLoading(false);
    }, (error) => {
        console.error("Error fetching classes count:", error);
        setLoading(false);
    });

    return () => {
        unsubscribeStudents();
        unsubscribeClasses();
    };
  }, [user]);

  if (loading) {
    return <Center style={{ height: 200 }}><Loader /></Center>;
  }

  return (
    <div>
      <Title order={2} mb="lg">Dashboard</Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }}>
        <Card withBorder p="lg" radius="md">
            <Group >
                <RingProgress
                    sections={[{ value: 100, color: 'cyan' }]}
                    label={
                        <Center>
                            <IconUsers size="1.4rem" />
                        </Center>
                    }
                />
                <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        Total Students
                    </Text>
                    <Text fz="xl" fw={700}>
                        {totalStudents}
                    </Text>
                </div>
            </Group>
        </Card>
        <Card withBorder p="lg" radius="md">
            <Group >
                <RingProgress
                    sections={[{ value: 100, color: 'orange' }]}
                    label={
                        <Center>
                            <IconChalkboard size="1.4rem" />
                        </Center>
                    }
                />
                <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        Total Classes
                    </Text>
                    <Text fz="xl" fw={700}>
                        {totalClasses}
                    </Text>
                </div>
            </Group>
        </Card>
        <Card withBorder p="lg" radius="md">
            <Group >
                <RingProgress
                    sections={[{ value: 100, color: 'grape' }]}
                    label={
                        <Center>
                            <IconLicense size="1.4rem" />
                        </Center>
                    }
                />
                <div>
                    <Text c="dimmed" size="xs" tt="uppercase" fw={700}>
                        Total Teachers
                    </Text>
                    <Text fz="xl" fw={700}>
                        {totalTeachers}
                    </Text>
                </div>
            </Group>
        </Card>
      </SimpleGrid>
    </div>
  );
}
