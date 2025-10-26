// src/lib/auth.ts

export type UserType = 'administrador' | 'operador' | 'secretaria' | 'municipe';

export function getUserTypeFromLevel(nivel_acesso: {
  municipe?: boolean;
  operador?: boolean;
  secretario?: boolean;
  administrador?: boolean;
}): UserType {
  if (nivel_acesso.administrador) return 'administrador';
  if (nivel_acesso.secretario) return 'secretaria';
  if (nivel_acesso.operador) return 'operador';
  if (nivel_acesso.municipe) return 'municipe';
  return 'municipe'; // fallback
}
