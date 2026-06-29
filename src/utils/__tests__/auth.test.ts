import { describe, it, expect, beforeEach } from 'vitest';
import {
  login,
  logout,
  getCurrentUser,
  canAdd,
  canEdit,
  canDelete,
  addUser,
  removeUser,
  updateUserRole,
  resetUserPassword,
} from '../auth';

describe('auth', () => {
  beforeEach(() => {
    // Only clear the auth session key, NOT the users key.
    // The module auto-initializes the admin user on load,
    // so the default admin with password 'admin123' stays intact.
    localStorage.removeItem('mapa-terremoto-auth');
  });

  describe('login', () => {
    it('returns success with valid credentials', () => {
      const result = login('admin', 'admin123');
      expect(result.success).toBe(true);
      expect(result.user).toBeDefined();
      expect(result.user?.username).toBe('admin');
      expect(result.user?.role).toBe('admin');
    });

    it('returns error with wrong password', () => {
      const result = login('admin', 'wrongpass');
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('returns error with non-existent user', () => {
      const result = login('nonexistent', 'pass');
      expect(result.success).toBe(false);
    });

    it('persists user in localStorage', () => {
      login('admin', 'admin123');
      const user = getCurrentUser();
      expect(user).not.toBeNull();
      expect(user?.username).toBe('admin');
    });
  });

  describe('logout', () => {
    it('clears current user', () => {
      login('admin', 'admin123');
      expect(getCurrentUser()).not.toBeNull();
      logout();
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('getCurrentUser', () => {
    it('returns null when not logged in', () => {
      expect(getCurrentUser()).toBeNull();
    });
  });

  describe('role-based access', () => {
    it('admin can add, edit, and delete', () => {
      const admin = { username: 'admin', role: 'admin' as const, displayName: 'Admin' };
      expect(canAdd(admin)).toBe(true);
      expect(canEdit(admin)).toBe(true);
      expect(canDelete(admin)).toBe(true);
    });

    it('editor can add, edit, but not delete', () => {
      const editor = { username: 'editor', role: 'editor' as const, displayName: 'Editor' };
      expect(canAdd(editor)).toBe(true);
      expect(canEdit(editor)).toBe(true);
      expect(canDelete(editor)).toBe(false);
    });

    it('viewer cannot add, edit, or delete', () => {
      const viewer = { username: 'viewer', role: 'viewer' as const, displayName: 'Viewer' };
      expect(canAdd(viewer)).toBe(false);
      expect(canEdit(viewer)).toBe(false);
      expect(canDelete(viewer)).toBe(false);
    });

    it('null user cannot add, edit, or delete', () => {
      expect(canAdd(null)).toBe(false);
      expect(canEdit(null)).toBe(false);
      expect(canDelete(null)).toBe(false);
    });
  });

  describe('addUser', () => {
    it('adds a new user successfully', () => {
      const result = addUser('newuser', 'pass123', 'editor', 'New User');
      expect(result.success).toBe(true);
    });

    it('rejects duplicate username', () => {
      addUser('duplicate', 'pass123', 'editor', 'Dup');
      const result = addUser('duplicate', 'pass123', 'editor', 'Dup 2');
      expect(result.success).toBe(false);
      expect(result.error).toContain('ya existe');
    });
  });

  describe('removeUser', () => {
    it('removes a non-admin user', () => {
      addUser('todelete', 'pass', 'viewer', 'Delete Me');
      const result = removeUser('todelete');
      expect(result.success).toBe(true);
    });

    it('prevents removing the admin user', () => {
      const result = removeUser('admin');
      expect(result.success).toBe(false);
      expect(result.error).toContain('administrador');
    });
  });

  describe('updateUserRole', () => {
    it('updates a user role', () => {
      addUser('roleuser', 'pass', 'viewer', 'Role User');
      const result = updateUserRole('roleuser', 'admin');
      expect(result.success).toBe(true);
    });

    it('prevents changing admin role from admin', () => {
      const result = updateUserRole('admin', 'editor');
      expect(result.success).toBe(false);
    });
  });

  describe('resetUserPassword', () => {
    it('resets password for existing user', () => {
      addUser('passuser', 'oldpass', 'editor', 'Pass User');
      const result = resetUserPassword('passuser', 'newpass');
      expect(result.success).toBe(true);
      // Verify new password works
      const loginResult = login('passuser', 'newpass');
      expect(loginResult.success).toBe(true);
    });

    it('returns error for non-existent user', () => {
      const result = resetUserPassword('ghost', 'pass');
      expect(result.success).toBe(false);
    });
  });
});
