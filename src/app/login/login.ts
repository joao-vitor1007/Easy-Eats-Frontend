import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { CampoSenhaComponent } from '../../components/campo-senha/campo-senha';
import { CampoTextoComponent } from '../../components/campo-texto/campo-texto';
import { AuthService } from '../auth/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.html',
  styleUrls: ['./login.scss'],
  imports: [CommonModule, ReactiveFormsModule, CampoSenhaComponent, CampoTextoComponent],
  standalone: true,
})
export class Login {
  modoRecuperarSenha = false;
  currentYear: number = new Date().getFullYear();

  enviando = false;
  erro: string | null = null;

  private fb = inject(FormBuilder);
  private router = inject(Router);
  private authService = inject(AuthService);

  form = this.fb.group({
    email: ['', Validators.required],
    password: ['', Validators.required],
  });

  mensagensValidacoes = {
    email: { required: 'Usuário é obrigatório.' },
    password: { required: 'Senha obrigatória.' },
  };

  abrirRecuperarSenha() {
    this.modoRecuperarSenha = true;
    this.erro = null;
  }

  voltarParaLogin() {
    this.modoRecuperarSenha = false;
  }


  handleLogin(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password } = this.form.getRawValue();

    if (!email || !password) {
      return;
    }

    this.enviando = true;
    this.erro = null;

    this.authService.login(email, password).subscribe({
      next: () => {
        this.enviando = false;
        this.router.navigate(['/home']);
      },
      error: () => {
        this.enviando = false;
        this.erro = 'E-mail ou senha inválidos.';
      },
    });
  }

}
