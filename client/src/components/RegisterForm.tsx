'use client';
import { useState } from "react";
import { useAuth } from "../utils/auth";
import { useRouter } from "next/navigation";
import { 
  TextInput, 
  PasswordInput, 
  Button, 
  Paper, 
  Title, 
  Text, 
  Select, 
  NumberInput,
  Stack,
  Box,
  Alert,
  rem
} from "@mantine/core";
import { IconAlertCircle, IconUser, IconMail, IconLock, IconShield } from "@tabler/icons-react";

interface RegisterData {
  name: string;
  email: string;
  password: string;
  role: "Manager" | "Employee";
  manager_id?: number;
}

export default function RegisterForm() {
  const { register } = useAuth();
  const [form, setForm] = useState<RegisterData>({
    name: "",
    email: "",
    password: "",
    role: "Employee",
    manager_id: undefined,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleChange = (field: keyof RegisterData, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    
    try {
      const data: Omit<RegisterData, "manager_id"> & { manager_id?: number } = {
        name: form.name,
        email: form.email,
        password: form.password,
        role: form.role,
      };
      
      if (form.role === "Employee") {
        if (!form.manager_id) {
          setError("Manager ID is required for employees");
          setLoading(false);
          return;
        }
        data.manager_id = form.manager_id;
      }

      await register(data);
      router.push("/login");
    } catch (err) {
      console.error("Registration error:", err);
      setError(err instanceof Error ? err.message : "Registration failed. Please check your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maw={460} mx="auto" py="xl">
      <Title order={2} ta="center" mb="lg">
        Create an Account
      </Title>
      
      <Paper withBorder shadow="sm" p="xl" radius="md">
        {error && (
          <Alert 
            icon={<IconAlertCircle size={rem(18)} />} 
            title="Error" 
            color="red" 
            mb="xl"
            variant="light"
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            <TextInput
              label="Full Name"
              placeholder="Your name"
              value={form.name}
              required
              onChange={(e) => handleChange("name", e.target.value)}
              leftSection={<IconUser size={rem(16)} />}
              radius="md"
            />

            <TextInput
              label="Email"
              placeholder="your@email.com"
              type="email"
              value={form.email}
              required
              onChange={(e) => handleChange("email", e.target.value)}
              leftSection={<IconMail size={rem(16)} />}
              radius="md"
            />

            <PasswordInput
              label="Password"
              placeholder="Your password"
              value={form.password}
              required
              onChange={(e) => handleChange("password", e.target.value)}
              leftSection={<IconLock size={rem(16)} />}
              radius="md"
            />

            <Select
              label="Role"
              placeholder="Select your role"
              data={[
                { value: "Employee", label: "Employee" },
                { value: "Manager", label: "Manager" },
              ]}
              value={form.role}
              onChange={(value) => handleChange("role", value as "Manager" | "Employee")}
              leftSection={<IconShield size={rem(16)} />}
              radius="md"
            />

            {form.role === "Employee" && (
              <NumberInput
                label="Manager ID"
                placeholder="Enter your manager's ID"
                value={form.manager_id || ""}
                onChange={(value) => handleChange("manager_id", Number(value))}
                required
                min={1}
                radius="md"
              />
            )}

            <Button 
              type="submit" 
              fullWidth 
              mt="md" 
              loading={loading}
              radius="md"
              size="md"
            >
              Register
            </Button>

            <Text c="dimmed" size="sm" ta="center" mt="sm">
              Already have an account?{' '}
              <Text 
                component="a" 
                href="/login" 
                c="blue" 
                style={{ cursor: 'pointer' }}
              >
                Log in
              </Text>
            </Text>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}