'use client';
import { useState, useEffect } from "react";
import api from "../utils/api";
import { Textarea, Select, Button, Text, Modal, Paper, Group, LoadingOverlay } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCheck, IconX } from "@tabler/icons-react";

interface FeedbackFormProps {
  employeeId: number;
  employeeName: string;
  opened: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type Sentiment = 'POSITIVE' | 'NEUTRAL' | 'NEGATIVE';

interface FormValues {
  strengths: string;
  areasToImprove: string;
  sentiment: Sentiment;
}

export default function FeedbackForm({ 
  employeeId, 
  employeeName,
  opened,
  onClose,
  onSuccess 
}: FeedbackFormProps) {
  const form = useForm<FormValues>({
    initialValues: {
      strengths: '',
      areasToImprove: '',
      sentiment: 'POSITIVE',
    },
    validate: {
      strengths: (value) => (value.trim().length < 5 ? 'Strengths must be at least 5 characters' : null),
      areasToImprove: (value) => (value.trim().length < 5 ? 'Areas to improve must be at least 5 characters' : null),
    },
  });

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: FormValues) => {
    setLoading(true);
    
    try {
      await api.post("/feedback", { 
        ...values, 
        employee_id: employeeId 
      });

      notifications.show({
        title: 'Success!',
        message: 'Feedback submitted successfully',
        color: 'teal',
        icon: <IconCheck />,
      });

      form.reset();
      onSuccess?.();
      onClose();
    } catch (err) {
      notifications.show({
        title: 'Error',
        message: 'Failed to submit feedback',
        color: 'red',
        icon: <IconX />,
      });
    } finally {
      setLoading(false);
    }
  };

  // Reset form when modal closes
  useEffect(() => {
    if (!opened) {
      form.reset();
    }
  }, [opened]);

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title={`Feedback for ${employeeName}`}
      size="lg"
      overlayProps={{
        blur: 4,
      }}
      centered
      closeOnClickOutside={!loading}
      closeOnEscape={!loading}
    >
      <Paper p="md" pos="relative">
        <LoadingOverlay visible={loading} />
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <Textarea
            label="Strengths"
            placeholder="Describe the employee's strengths..."
            withAsterisk
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps('strengths')}
            mb="md"
          />
          
          <Textarea
            label="Areas to Improve"
            placeholder="Suggest areas for improvement..."
            withAsterisk
            minRows={3}
            maxRows={6}
            autosize
            {...form.getInputProps('areasToImprove')}
            mb="md"
          />
          
          <Select
            label="Overall Sentiment"
            withAsterisk
            data={[
              { value: "POSITIVE", label: "Positive" },
              { value: "NEUTRAL", label: "Neutral" },
              { value: "NEGATIVE", label: "Negative" },
            ]}
            {...form.getInputProps('sentiment')}
            mb="xl"
          />

          <Group justify="flex-end" mt="md">
            <Button 
              variant="outline" 
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              loading={loading}
            >
              Submit Feedback
            </Button>
          </Group>
        </form>
      </Paper>
    </Modal>
  );
}