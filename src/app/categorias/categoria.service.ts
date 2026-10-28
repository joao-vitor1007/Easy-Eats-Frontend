import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Categoria {
  id: number;
  nome: string;
  descricao: string | null;
  flativo: boolean | null;
}

export interface CategoriaPayload {
  nome: string;
  descricao: string | null;
  flativo: boolean;
}

interface ApiCategoria {
  id: number;
  nome: string;
  flativo: string | null;
}

const API_URL = `${environment.apiUrl}/categorias`;

@Injectable({ providedIn: 'root' })
export class CategoriaService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Categoria[]> {
    return this.http.get<ApiCategoria[]>(API_URL).pipe(
      map((categorias) => categorias.map((categoria) => this.mapear(categoria))),
    );
  }

  criar(categoria: CategoriaPayload): Observable<Categoria> {
    return this.http.post<ApiCategoria>(API_URL, this.paraApi(categoria)).pipe(
      map((resultado) => this.mapear(resultado)),
    );
  }

  atualizar(id: number, categoria: CategoriaPayload): Observable<Categoria> {
    return this.http.put<ApiCategoria>(`${API_URL}/${id}`, this.paraApi(categoria)).pipe(
      map((resultado) => this.mapear(resultado)),
    );
  }

  excluir(id: number): Observable<void> {
    // A API usa exclusão lógica por PATCH /{id}/inativar.
    return this.http.patch<ApiCategoria>(`${API_URL}/${id}/inativar`, {}).pipe(map(() => undefined));
  }

  private paraApi(categoria: CategoriaPayload) {
    return {
      nome: categoria.nome,
      flativo: categoria.flativo ? 'S' : 'N',
    };
  }

  private mapear(categoria: ApiCategoria): Categoria {
    return {
      id: categoria.id,
      nome: categoria.nome,
      descricao: null,
      flativo: categoria.flativo === 'S',
    };
  }
}
