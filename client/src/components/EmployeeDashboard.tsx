'use client';
import { useEffect, useState } from "react";
import api from "../utils/api";
import { Paper, Title, Button, Loader } from "@mantine/core";
import { useAuth } from "../utils/auth";

export default function EmployeeDashboard() {
  const [timeline, setTimeline] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { logout } = useAuth();

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
    return <Loader size="xl" style={{ display: 'block', margin: 'auto' }} />;
  }

  return (
    <div style={{ maxWidth: 700, margin: "auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title order={2} mb="md">Feedback Timeline</Title>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>
      {timeline.map(fb => (
        <Paper key={fb.id} p="md" mb="sm" withBorder>
          <b>{fb.sentiment}</b> | <i>{new Date(fb.createdAt).toLocaleString()}</i>
          <br />
          <b>Strengths:</b> {fb.strengths}
          <br />
          <b>Areas to Improve:</b> {fb.areasToImprove}
          <br />
          <b>Acknowledged:</b> {fb.acknowledged ? "Yes" : (
            <Button size="xs" onClick={() => acknowledge(fb.id)}>Acknowledge</Button>
          )}
        </Paper>
      ))}
    </div>
  );
}