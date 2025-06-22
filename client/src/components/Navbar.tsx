'use client';
import { useAuth } from "../utils/auth";
import Link from "next/link";
import { Group, Button, Text } from "@mantine/core";

export default function Navbar() {
  const { user, logout } = useAuth();
  return (
    <Group justify="space-between" p="md" style={{ borderBottom: "1px solid #eee", marginBottom: 24 }}>
      <Group>
        <Link href="/">Home</Link>
        {user && user.role === "Manager" && <Link href="/manager-dashboard">Manager Dashboard</Link>}
        {user && user.role === "Employee" && <Link href="/employee-dashboard">Employee Dashboard</Link>}
      </Group>
      <Group>
        {user ? (
          <>
            <Text c="dimmed">{user.email}</Text>
            <Button variant="outline" size="xs" onClick={logout}>Logout</Button>
          </>
        ) : (
          <>
            <Link href="/login">Login</Link>
            <Link href="/register">Register</Link>
          </>
        )}
      </Group>
    </Group>
  );
}