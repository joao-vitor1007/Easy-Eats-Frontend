import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export type Perfil = 'SUPERADMIN' | 'ADMINISTRADOR' | 'OPERADOR' | 'GARCOM' | 'COZINHEIRO';

export type Funcionalidade =
  | 'OPERACAO' | 'PEDIDO' | 'COZINHA' | 'DELIVERY' | 'ESTOQUE' | 'COMPRAS'
  | 'FINANCEIRO' | 'PRODUTOS' | 'CLIENTES' | 'USUARIOS' | 'CONFIGURACOES'
  | 'CAIXA' | 'CUPONS';

export interface UsuarioLogado {
  id: number;
  nome: string;
  email: string;
  role: Perfil;
  funcionalidades: Funcionalidade[];
}

const CHAVE_TOKEN = 'easyeats.token';
const CHAVE_USUARIO = 'easyeats.usuario';
const API_URL = `${environment.apiUrl}/auth`;
const TODAS_FUNCIONALIDADES: Funcionalidade[] = [
  'OPERACAO', 'PEDIDO', 'COZINHA', 'DELIVERY', 'ESTOQUE', 'COMPRAS',
  'FINANCEIRO', 'PRODUTOS', 'CLIENTES', 'USUARIOS', 'CONFIGURACOES',
  'CAIXA', 'CUPONS',
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  usuario = signal<UsuarioLogado | null>(this.recuperarUsuario());

  constructor(private http: HttpClient) {}

  login(username: string, senha: string): Observable<string> {
    const params = new URLSearchParams({ username, password: senha });

    return this.http.post(`${API_URL}/login`, params.toString(), {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      responseType: 'text',
    }).pipe(
      tap((token) => {
        sessionStorage.setItem(CHAVE_TOKEN, token);
        const usuario = this.usuarioDoToken(token);
        sessionStorage.setItem(CHAVE_USUARIO, JSON.stringify(usuario));
        this.usuario.set(usuario);
      }),
    );
  }

  logout(): void {
    sessionStorage.removeItem(CHAVE_TOKEN);
    sessionStorage.removeItem(CHAVE_USUARIO);
    this.usuario.set(null);
  }

  getToken(): string | null {
    return sessionStorage.getItem(CHAVE_TOKEN);
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  isAdministrador(): boolean {
    return this.usuario()?.role === 'ADMINISTRADOR' || this.usuario()?.role === 'SUPERADMIN';
  }

  isSuperadmin(): boolean {
    return this.usuario()?.role === 'SUPERADMIN';
  }

  isGarcom(): boolean {
    return this.usuario()?.role === 'GARCOM';
  }

  isCozinheiro(): boolean {
    return this.usuario()?.role === 'COZINHEIRO';
  }

  isOperador(): boolean {
    return this.usuario()?.role === 'OPERADOR';
  }

  /**
   * O backend fornecido autentica por roles (ROLE_USER/ROLE_ADMIN), não por
   * funcionalidades do frontend. Enquanto a API não expuser permissões por
   * módulo, usuários autenticados podem navegar pelas áreas do sistema.
   */
  temFuncionalidade(_codigo: Funcionalidade): boolean {
    return this.isAuthenticated();
  }

  private usuarioDoToken(token: string): UsuarioLogado {
    const payload = JSON.parse(this.decodificarBase64Url(token.split('.')[1])) as {
      sub?: string;
      roles?: string[];
    };
    const username = payload.sub ?? 'Usuário';
    const roles = payload.roles ?? [];
    const administrador = roles.some((role) => role.toUpperCase().includes('ADMIN'));

    return {
      id: 0,
      nome: username,
      email: username,
      role: administrador ? 'ADMINISTRADOR' : 'OPERADOR',
      funcionalidades: TODAS_FUNCIONALIDADES,
    };
  }

  private decodificarBase64Url(valor: string): string {
    const base64 = valor.replace(/-/g, '+').replace(/_/g, '/');
    const preenchido = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
    return decodeURIComponent(
      Array.from(atob(preenchido))
        .map((caractere) => `%${caractere.charCodeAt(0).toString(16).padStart(2, '0')}`)
        .join(''),
    );
  }

  private recuperarUsuario(): UsuarioLogado | null {
    const bruto = sessionStorage.getItem(CHAVE_USUARIO);
    if (!bruto) return null;
    try {
      return JSON.parse(bruto) as UsuarioLogado;
    } catch {
      return null;
    }
  }
}
