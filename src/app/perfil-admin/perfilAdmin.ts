import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-perfil-admin',
  imports: [FormsModule],
  templateUrl: './perfilAdmin.html',
  styleUrl: './perfilAdmin.scss',
})
export class PerfilAdmin {
  currentYear: number = new Date().getFullYear();
  private router = inject(Router);
  private authService = inject(AuthService);

  usuario = {
    nome: this.authService.usuario()?.nome ?? '',
    email: this.authService.usuario()?.email ?? '',
    telefone: '(00) 00000-0000',
    cpf: '000.000.000-00',
  };

  modoEdicao = false;

  toggleEdicao() {
    this.modoEdicao = !this.modoEdicao;
  }

  salvarAlteracoes() {
    this.modoEdicao = false;
    console.log('Alterações salvas:', this.usuario);
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }

  protected acessarRota(rota: string) {
    this.router.navigate([rota]);
  }
}
