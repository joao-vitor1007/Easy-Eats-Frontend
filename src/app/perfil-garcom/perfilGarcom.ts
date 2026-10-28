import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-perfil-garcom',
  imports: [],
  templateUrl: './perfilGarcom.html',
  styleUrl: './perfilGarcom.scss',
})
export class PerfilGarcom {
  private router = inject(Router);
  private authService = inject(AuthService);

  get usuario() {
    return this.authService.usuario();
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
