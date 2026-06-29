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

/** Solo editor/admin pueden agregar */
export function canAdd(user: User | null): boolean {
  return user !== null && (user.role === 'admin' || user.role === 'editor');
}

/** Solo editor/admin pueden editar marcadores existentes */
export function canEdit(user: User | null): boolean {
  return user !== null && (user.role === 'admin' || user.role === 'editor');
}

/** Solo admin puede eliminar marcadores */
export function canDelete(user: User | null): boolean {
  return user !== null && user.role === 'admin';
}

// ===== USER MANAGEMENT (Admin) =====

function getAllStoredUsers(): StoredUser[] {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [];
}

function saveUsers(users: StoredUser[]): void {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

export function getAllUsers(): (Omit<StoredUser, 'passwordHash'>)[] {
  return getAllStoredUsers().map(({ passwordHash, ...rest }) => rest);
}

export function addUser(
  username: string,
  password: string,
  role: UserRole,
  displayName: string
): { success: boolean; error?: string } {
  const users = getAllStoredUsers();
  if (users.find(u => u.username === username)) {
    return { success: false, error: 'El usuario ya existe' };
  }
  users.push({
    username,
    passwordHash: simpleHash(password),
    role,
    displayName: displayName || username,
  });
  saveUsers(users);
  return { success: true };
}

export function removeUser(username: string): { success: boolean; error?: string } {
  if (username === 'admin') {
    return { success: false, error: 'No puedes eliminar al administrador principal' };
  }
  const users = getAllStoredUsers().filter(u => u.username !== username);
  saveUsers(users);
  return { success: true };
}

export function updateUserRole(
  username: string,
  role: UserRole
): { success: boolean; error?: string } {
  if (username === 'admin' && role !== 'admin') {
    return { success: false, error: 'El administrador principal debe mantener su rol' };
  }
  const users = getAllStoredUsers();
  const user = users.find(u => u.username === username);
  if (!user) return { success: false, error: 'Usuario no encontrado' };
  user.role = role;
  saveUsers(users);
  return { success: true };
}

export function resetUserPassword(
  username: string,
  newPassword: string
): { success: boolean; error?: string } {
  const users = getAllStoredUsers();
  const user = users.find(u => u.username === username);
  if (!user) return { success: false, error: 'Usuario no encontrado' };
  user.passwordHash = simpleHash(newPassword);
  saveUsers(users);
  return { success: true };
}
