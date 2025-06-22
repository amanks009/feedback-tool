'use client';
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Paper, Title, Button, Loader, Group, Text, Badge, Stack, Card, Avatar } from "@mantine/core";
import { useAuth } from "../utils/auth";
import { IconCheck, IconX, IconUser, IconCalendar, IconThumbUp, IconThumbDown, IconMoodNeutral } from "@tabler/icons-react";

export default function EmployeeDashboard() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout, user } = useAuth();

  useEffect(() => {
    const fetchTimeline = async () => {
      try {
        const res = await api.get("/employee-dashboard");
        setTimeline(res.data.timeline);
      } catch (error) {
        console.error('Error fetching timeline:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchTimeline();
  }, []);

  const acknowledge = async (id: number) => {
    try {
      await api.post(`/acknowledge/${id}`);
      setTimeline(timeline =>
        timeline.map(fb =>
          fb.id === id ? { ...fb, acknowledged: true } : fb
        )
      );
    } catch (error) {
      console.error('Acknowledge error:', error);
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <Loader size="xl" variant="bars" />
      </div>
    );
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return <IconThumbUp size={18} />;
      case 'NEGATIVE':
        return <IconThumbDown size={18} />;
      default:
        return <IconMoodNeutral size={18} />;
    }
  };

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'POSITIVE':
        return 'green';
      case 'NEGATIVE':
        return 'red';
      default:
        return 'yellow';
    }
  };

  return (
    <div style={{ maxWidth: 800, margin: "auto", padding: '1rem' }}>
      <Group justify="space-between" mb="xl">
        <Title order={2}>Your Feedback Timeline</Title>
        <Button 
          variant="outline" 
          onClick={logout}
          leftSection={<IconX size={16} />}
        >
          Logout
        </Button>
      </Group>

      <Stack gap="md">
        {timeline.length === 0 ? (
          <Card shadow="sm" p="lg" radius="md" withBorder>
            <Text ta="center" c="dimmed">No feedback received yet</Text>
          </Card>
        ) : (
          timeline.map(fb => (
            <Card key={fb.id} shadow="sm" p="lg" radius="md" withBorder>
              <Group justify="space-between" mb="xs">
                <Group gap="xs">
                  <Avatar color={getSentimentColor(fb.sentiment)} radius="xl">
                    {getSentimentIcon(fb.sentiment)}
                  </Avatar>
                  <Badge 
                    color={getSentimentColor(fb.sentiment)}
                    variant="filled"
                    size="lg"
                  >
                    {fb.sentiment}
                  </Badge>
                </Group>
                <Group gap="xs">
                  <IconCalendar size={16} />
                  <Text size="sm" c="dimmed">
                    {new Date(fb.createdAt).toLocaleDateString()}
                  </Text>
                </Group>
              </Group>

              <Stack gap="xs" mt="md">
                <div>
                  <Text fw={600}>Strengths:</Text>
                  <Text>{fb.strengths}</Text>
                </div>
                <div>
                  <Text fw={600}>Areas to Improve:</Text>
                  <Text>{fb.areasToImprove}</Text>
                </div>
              </Stack>

              <Group justify="flex-end" mt="md">
                {fb.acknowledged ? (
                  <Badge 
                    color="teal" 
                    leftSection={<IconCheck size={14} />}
                    variant="outline"
                  >
                    Acknowledged
                  </Badge>
                ) : (
                  <Button 
                    size="compact-md"
                    variant="light"
                    onClick={() => acknowledge(fb.id)}
                    leftSection={<IconCheck size={16} />}
                  >
                    Acknowledge
                  </Button>
                )}
              </Group>
            </Card>
          ))
        )}
      </Stack>
    </div>
  );
}