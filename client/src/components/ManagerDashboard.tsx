'use client';
import { useEffect, useState } from "react";
import api from "../utils/api";
import FeedbackForm from "./FeedbackForm";
import { Table, Button, Title, Paper, Text, LoadingOverlay, Group } from "@mantine/core";
import { EmployeeWithFeedback, Feedback } from "../types/feedback";
import { useAuth } from "../utils/auth";

export default function ManagerDashboard() {
  const [team, setTeam] = useState<EmployeeWithFeedback[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<EmployeeWithFeedback | null>(null);
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [refresh, setRefresh] = useState(0);
  const [loading, setLoading] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedbackModalOpened, setFeedbackModalOpened] = useState(false);
  const { logout } = useAuth();

  useEffect(() => {
    const fetchTeam = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await api.get("/dashboard");
        setTeam(response.data.team);
      } catch (err) {
        setError("Failed to load team data");
        console.error("Error fetching team:", err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchTeam();
  }, [refresh]);

  const handleSelectEmployee = async (emp: EmployeeWithFeedback) => {
    setSelectedEmployee(emp);
    setFeedbackLoading(true);
    setError(null);
    try {
      const response = await api.get(`/feedback/${emp.employee.id}`);
      setFeedbacks(response.data);
    } catch (err) {
      setError("Failed to load feedback");
      console.error("Error fetching feedback:", err);
    } finally {
      setFeedbackLoading(false);
    }
  };

  const handleOpenFeedbackModal = (emp: EmployeeWithFeedback) => {
    setFeedbackModalOpened(true);
  };

  if (error) {
    return (
      <div style={{ maxWidth: 900, margin: "auto" }}>
        <Title order={2} mb="md">Manager Dashboard</Title>
        <Text color="red">{error}</Text>
        <Button mt="md" onClick={logout}>Logout</Button>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 900, margin: "auto" }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Title order={2} mb="md">Manager Dashboard</Title>
        <Button variant="outline" onClick={logout}>Logout</Button>
      </div>

      {feedbackModalOpened && selectedEmployee && (
        <FeedbackForm
          employeeId={selectedEmployee.employee.id}
          employeeName={selectedEmployee.employee.name}
          opened={feedbackModalOpened}
          onClose={() => setFeedbackModalOpened(false)}
          onSuccess={() => {
            setRefresh(r => r + 1); // Refresh team data
            setFeedbackModalOpened(false); // Close modal
          }}
        />
      )}

      <div style={{ display: "flex", gap: 32, position: 'relative' }}>
        <LoadingOverlay visible={loading} />
        
        <div style={{ flex: 1 }}>
          <Table striped highlightOnHover>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Feedback Count</th>
                <th>Sentiments</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {team.map((emp) => (
                <tr key={emp.employee.id}>
                  <td>{emp.employee.name}</td>
                  <td>{emp.employee.email}</td>
                  <td>{emp.feedback_count}</td>
                  <td>
                    +{emp.sentiments.POSITIVE} / ~{emp.sentiments.NEUTRAL} / -{emp.sentiments.NEGATIVE}
                  </td>
                  <td>
                    <Group gap="xs">
                      <Button 
                        size="xs" 
                        onClick={() => handleSelectEmployee(emp)}
                        disabled={loading}
                      >
                        View Details
                      </Button>
                      <Button 
                        size="xs" 
                        variant="outline"
                        onClick={() => {
                          setSelectedEmployee(emp);
                          handleOpenFeedbackModal(emp);
                        }}
                        disabled={loading}
                      >
                        Give Feedback
                      </Button>
                    </Group>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </div>

        {selectedEmployee && (
          <Paper p="md" style={{ flex: 1, position: 'relative' }}>
            <LoadingOverlay visible={feedbackLoading} />
            <Title order={4} mb="sm">Feedback for {selectedEmployee.employee.name}</Title>

            {feedbacks.length > 0 ? (
              <div style={{ marginTop: 16 }}>
                {feedbacks.map(fb => (
                  <Paper key={fb.id} p="sm" shadow="xs" mb="sm">
                    <Text fw={700} c={
                      fb.sentiment === 'POSITIVE' ? 'green' : 
                      fb.sentiment === 'NEGATIVE' ? 'red' : 'yellow'
                    }>
                      {fb.sentiment} | <Text span fw={400}>
                        {new Date(fb.createdAt).toLocaleString()}
                      </Text>
                    </Text>
                    <Text><Text span fw={600}>Strengths:</Text> {fb.strengths}</Text>
                    <Text><Text span fw={600}>Areas to Improve:</Text> {fb.areasToImprove}</Text>
                    <Text><Text span fw={600}>Acknowledged:</Text> {fb.acknowledged ? "Yes" : "No"}</Text>
                  </Paper>
                ))}
              </div>
            ) : (
              <Text mt="md">No feedback yet for this employee</Text>
            )}
          </Paper>
        )}
      </div>
    </div>
  );
}