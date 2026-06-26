export type UserRole = 'admin' | 'editor' | 'viewer';

export interface User {
  username: string;
  role: UserRole;
  displayName: string;
}

interface StoredUser {
  username: string;
  passwordHash: string;
  role: UserRole;
  displayName: string;
}

const AUTH_KEY = 'mapa-terremoto-auth';
const USERS_KEY = 'mapa-terremoto-users';

// Simple synchronous hash for demo purposes (NOT production-grade)
function simpleHash(str: string): string {
  let hash = 0;
  const salt = 'mapa-salt-2026';
  const salted = salt + str + salt;
  for (let i = 0; i < salted.length; i++) {
    const char = salted.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return 'h_' + Math.abs(hash).toString(36);
}

// Initialize default users synchronously if none exist
function initializeDefaultUsers(): void {
  const stored = localStorage.getItem(USERS_KEY);
  if (!stored) {
    const defaultUsers: StoredUser[] = [
      {
        username: 'admin',
        passwordHash: simpleHash('admin123'),
        role: 'admin',
        displayName: 'Administrador',
      },
      {
        username: 'editor',
        passwordHash: simpleHash('admin123'),
        role: 'editor',
        displayName: 'Editor',
      },
    ];
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
  }
}

// Initialize on module load
initializeDefaultUsers();

export function getCurrentUser(): User | null {
  try {
    const data = localStorage.getItem(AUTH_KEY);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function setCurrentUser(user: User | null): void {
  if (user) {
    localStorage.setItem(AUTH_KEY, JSON.stringify(user));
  } else {
    localStorage.removeItem(AUTH_KEY);
  }
}

export function login(
  username: string,
  password: string
): { success: boolean; error?: string; user?: User } {
  const stored = localStorage.getItem(USERS_KEY);
  const users: StoredUser[] = stored ? JSON.parse(stored) : [];

  const passwordHash = simpleHash(password);
  const found = users.find(
    (u) => u.username === username && u.passwordHash === passwordHash
  );

  if (!found) {
    return { success: false, error: 'Usuario o contraseña incorrectos' };
  }

  const user: User = {
    username: found.username,
    role: found.role,
    displayName: found.displayName,
  };

  setCurrentUser(user);
  return { success: true, user };
}

export function logout(): void {
  setCurrentUser(null);
}

export function canEdit(user: User | null): boolean {
  return user !== null && (user.role === 'admin' || user.role === 'editor');
}

export function canDelete(user: User | null): boolean {
  return user !== null && user.role === 'admin';
}
