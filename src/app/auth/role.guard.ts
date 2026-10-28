import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Perfil } from './auth.service';

export function roleGuard(rolesPermitidas: Perfil[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    const role = authService.usuario()?.role;
    if (role && rolesPermitidas.includes(role)) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
}

export const superadminGuard: CanActivateFn = roleGuard(['SUPERADMIN']);
