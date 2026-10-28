import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService, Funcionalidade } from './auth.service';

export function funcionalidadeGuard(codigos: Funcionalidade[]): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      router.navigate(['/login']);
      return false;
    }

    if (codigos.some((codigo) => authService.temFuncionalidade(codigo))) {
      return true;
    }

    router.navigate(['/home']);
    return false;
  };
}
