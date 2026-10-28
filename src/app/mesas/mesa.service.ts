import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Mesa {
  id: number;
  numero: number;
  status: string;
}

interface ApiMesa {
  id: number;
  numero: number;
  flativo: string | null;
}

const API_URL = `${environment.apiUrl}/mesa`;

@Injectable({ providedIn: 'root' })
export class MesaService {
  constructor(private http: HttpClient) {}

  listar(): Observable<Mesa[]> {
    return this.http.get<ApiMesa[] | null>(API_URL).pipe(
      map((mesas) =>
        (mesas ?? []).map((mesa) => ({
          id: mesa.id,
          numero: mesa.numero,
          // O backend não possui status de ocupação; mesa ativa é exibida como livre.
          status: mesa.flativo === 'S' ? 'LIVRE' : 'INATIVA',
        })),
      ),
    );
  }
}
