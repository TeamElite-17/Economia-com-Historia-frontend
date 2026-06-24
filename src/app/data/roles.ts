/** Papéis alinhados com o backend (UserRole enum). */
export type BackendUserRole =
  | 'ESTUDANTE'
  | 'ESCRITOR'
  | 'REVISOR'
  | 'APROVADOR'
  | 'ADMIN'
  | 'SUPERADMIN';

export const ROLE_LABELS: Record<BackendUserRole, string> = {
  ESTUDANTE: 'Estudante',
  ESCRITOR: 'Escritor / Professor',
  REVISOR: 'Revisor',
  APROVADOR: 'Aprovador',
  ADMIN: 'Administrador',
  SUPERADMIN: 'Super Administrador',
};

export function normalizeBackendRole(raw?: string | null): BackendUserRole {
  const value = String(raw ?? 'ESTUDANTE').toUpperCase().trim();
  const roles: BackendUserRole[] = [
    'SUPERADMIN',
    'ADMIN',
    'APROVADOR',
    'REVISOR',
    'ESCRITOR',
    'ESTUDANTE',
  ];
  if (roles.includes(value as BackendUserRole)) {
    return value as BackendUserRole;
  }
  if (value.includes('ADMIN')) return 'ADMIN';
  if (value.includes('ESCRITOR') || value === 'USER') return 'ESTUDANTE';
  return 'ESTUDANTE';
}

export function isStaffRole(role: BackendUserRole) {
  return role !== 'ESTUDANTE';
}

export function canAccessAdminPanel(role: BackendUserRole) {
  return role === 'ADMIN' || role === 'SUPERADMIN';
}

export function canPublishContent(role: BackendUserRole) {
  return role === 'ESCRITOR' || role === 'REVISOR' || role === 'APROVADOR' || canAccessAdminPanel(role);
}

export function canUploadMedia(role: BackendUserRole) {
  return canPublishContent(role);
}

export function canApproveContent(role: BackendUserRole) {
  return role === 'APROVADOR' || canAccessAdminPanel(role);
}

export function canReviewContent(role: BackendUserRole) {
  return role === 'REVISOR' || canApproveContent(role);
}

/** Pode ver a fila de pendentes (revisores e aprovadores) */
export function canSeePendingQueue(role: BackendUserRole) {
  return role === 'REVISOR' || canApproveContent(role);
}

/** Papéis atribuíveis ao criar utilizador no painel admin. */
export const ASSIGNABLE_ROLES: BackendUserRole[] = [
  'ESTUDANTE',
  'ESCRITOR',
  'REVISOR',
  'APROVADOR',
  'ADMIN',
  'SUPERADMIN',
];

/** Papéis que o Super Admin pode atribuir a outros utilizadores (promoção). */
export const PROMOTABLE_ROLES: BackendUserRole[] = [
  'ESTUDANTE',
  'ESCRITOR',
  'REVISOR',
  'APROVADOR',
  'ADMIN',
];

export function isSuperAdminRole(role: BackendUserRole) {
  return role === 'SUPERADMIN';
}
