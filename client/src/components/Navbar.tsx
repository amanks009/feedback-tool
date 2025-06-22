'use client';
import { useAuth } from "../utils/auth";
import Link from "next/link";
import { Group, Button, Text, Box, rem } from "@mantine/core";
import { IconLogout, IconHome, IconDashboard } from "@tabler/icons-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  
  return (
    <Box 
      px="md" 
      py="sm" 
      style={{ 
        borderBottom: `${rem(1)} solid light-dark(var(--mantine-color-gray-2), var(--mantine-color-dark-5))`,
        backgroundColor: 'light-dark(var(--mantine-color-white), var(--mantine-color-dark-7))',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <Group justify="space-between" maw={1200} mx="auto">
        <Group gap="xl">
          <Link 
            href="/" 
            style={{
              textDecoration: 'none',
              color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: rem(6),
            }}
          >
            <IconHome size={16} />
            Home
          </Link>
          {user && user.role === "Manager" && (
            <Link 
              href="/manager-dashboard" 
              style={{
                textDecoration: 'none',
                color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: rem(6),
              }}
            >
              <IconDashboard size={16} />
              Manager Dashboard
            </Link>
          )}
          {user && user.role === "Employee" && (
            <Link 
              href="/employee-dashboard" 
              style={{
                textDecoration: 'none',
                color: 'light-dark(var(--mantine-color-gray-7), var(--mantine-color-dark-0))',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: rem(6),
              }}
            >
              <IconDashboard size={16} />
              Employee Dashboard
            </Link>
          )}
        </Group>

        <Group gap="lg">
          {user ? (
            <>
              <Text 
                fw={500} 
                size="sm" 
                c="dimmed"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: rem(4),
                }}
              >
                {user.email}
              </Text>
              <Button 
                variant="light" 
                size="sm" 
                onClick={logout}
                leftSection={<IconLogout size={14} />}
                color="red"
              >
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button 
                component={Link} 
                href="/login" 
                variant="outline" 
                size="sm"
              >
                Login
              </Button>
              <Button 
                component={Link} 
                href="/register" 
                variant="filled" 
                size="sm"
                color="blue"
              >
                Register
              </Button>
            </>
          )}
        </Group>
      </Group>
    </Box>
  );
}