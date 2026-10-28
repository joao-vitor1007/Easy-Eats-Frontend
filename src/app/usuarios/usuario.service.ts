import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Perfil } from '../auth/auth.service';

export interface Usuario {
  id: number;
  nome: string;
  email: string;
  role: Perfil;
  flAtivo: boolean | null;
}

export interface UsuarioPayload {
  nome: string;
  email: string;
  senha: string;
  role: Perfil;
  flAtivo: boolean;
}

interface ApiUsuario {
  username: string;
  roles: string[];
}

const API_URL = `${environment.apiUrl}/usuarios`;

@Injectable({ providedIn: 'root' })
export class UsuarioService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Usuario[]> {
    return this.http.get<ApiUsuario[]>(API_URL).pipe(
      map((usuarios) => usuarios.map((usuario) => this.mapear(usuario))),
    );
  }

  criar(usuario: UsuarioPayload): Observable<Usuario> {
    const role = usuario.role === 'SUPERADMIN' || usuario.role === 'ADMINISTRADOR'
      ? 'ADMIN'
      : 'USER';

    return this.http.post<void>(API_URL, {
      username: usuario.email || usuario.nome,
      password: usuario.senha,
      roles: [role],
    }).pipe(
      switchMap(() =>
        this.http.get<ApiUsuario[]>(API_URL).pipe(
          map((usuarios) => {
            const criado = usuarios.find((item) => item.username === (usuario.email || usuario.nome));
            return criado
              ? this.mapear(criado)
              : {
                  id: 0,
                  nome: usuario.nome,
                  email: usuario.email,
                  role: usuario.role,
                  flAtivo: true,
                };
          }),
        ),
      ),
    );
  }

  private mapear(usuario: ApiUsuario): Usuario {
    const administrador = (usuario.roles ?? []).some((role) => role.toUpperCase().includes('ADMIN'));

    return {
      id: 0,
      nome: usuario.username,
      email: usuario.username,
      role: administrador ? 'ADMINISTRADOR' : 'OPERADOR',
      flAtivo: true,
    };
  }
}
