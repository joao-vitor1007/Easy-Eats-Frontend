import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, forkJoin, map, of, switchMap } from 'rxjs';
import { environment } from '../../environments/environment';
import { Mesa, MesaService } from '../mesas/mesa.service';
import { Produto, ProdutoService } from '../cadastro-produto/produto.service';

export const STATUS_PEDIDO = {
  AGUARDANDO: 'Aguardando',
  PREPARANDO: 'Preparando',
  PRONTO: 'Pronto',
  ENTREGUE: 'Entregue',
} as const;

export type StatusPedido = (typeof STATUS_PEDIDO)[keyof typeof STATUS_PEDIDO];

export interface ItemVendaResumo {
  id: number;
  quantidade: number;
  preco_unitario: number;
  valor_total: number | null;
  observacao?: string | null;
  composicaoRemovida?: { composicaoItem: { id: number; nome: string } }[] | null;
  adicionais?: { id: number; nome: string; preco: number; quantidade: number }[] | null;
  produto: Produto;
}

export interface RelatorioFaturamento {
  totalFaturado: number;
  ticketMedio: number;
  quantidadeVendas: number;
}

export interface Venda {
  id: number;
  status: string;
  tipo: string;
  origem: string | null;
  valor_total: number | null;
  desconto: number | null;
  dataCriacao: string | null;
  mesa: { id: number; numero: number } | null;
  nomeCliente: string | null;
  cliente: { id: number; nome: string; saldoCashback: number | null } | null;
  cupom: { id: number; codigo: string } | null;
  usuario: { id: number; nome: string } | null;
  itens: ItemVendaResumo[] | null;
}

/** Payload correspondente ao PedidoDto do backend Spring Boot. */
export interface VendaPayload {
  status: string;
  mesaId: number;
  cliente: string | null;
  itens: { produtoId: number; quantidade: number }[];
}

interface ApiItemPedido {
  id: number;
  pedidoId: number;
  produtoId: number;
  quantidade: number;
  valorUnitario: number;
}

interface ApiPedido {
  id: number;
  dataCriacao: string | null;
  dataAlteracao?: string | null;
  mesaId: number | null;
  cliente: string | null;
  status: string;
  valorTotal: number | null;
  itens: ApiItemPedido[] | null;
}

const API_URL = `${environment.apiUrl}/pedido`;

@Injectable({ providedIn: 'root' })
export class VendaService {
  constructor(
    private http: HttpClient,
    private produtoService: ProdutoService,
    private mesaService: MesaService,
  ) {}

  listar(): Observable<Venda[]> {
    return forkJoin({
      pedidos: this.http.get<ApiPedido[] | null>(API_URL).pipe(
        catchError((erro) => {
          // O backend responde 204 quando não há pedidos.
          if (erro.status === 204) return of([]);
          throw erro;
        }),
      ),
      produtos: this.produtoService.listar().pipe(catchError(() => of([] as Produto[]))),
      mesas: this.mesaService.listar().pipe(catchError(() => of([] as Mesa[]))),
    }).pipe(
      map(({ pedidos, produtos, mesas }) =>
        (pedidos ?? []).map((pedido) => this.mapearPedido(pedido, produtos, mesas)),
      ),
    );
  }

  buscarPorId(id: number): Observable<Venda> {
    return forkJoin({
      pedido: this.http.get<ApiPedido>(`${API_URL}/${id}`),
      produtos: this.produtoService.listar().pipe(catchError(() => of([] as Produto[]))),
      mesas: this.mesaService.listar().pipe(catchError(() => of([] as Mesa[]))),
    }).pipe(
      map(({ pedido, produtos, mesas }) => this.mapearPedido(pedido, produtos, mesas)),
    );
  }

  criar(venda: VendaPayload): Observable<Venda> {
    const payload: ApiPedido = {
      id: 0,
      dataCriacao: null,
      mesaId: venda.mesaId,
      cliente: venda.cliente,
      status: this.statusParaApi(venda.status),
      valorTotal: null,
      itens: venda.itens.map((item) => ({
        id: 0,
        pedidoId: 0,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        valorUnitario: 0,
      })),
    };

    return this.http.post<ApiPedido>(API_URL, payload).pipe(
      switchMap((pedido) => this.mapearPedidoComDados(pedido)),
    );
  }

  alterar(id: number, venda: VendaPayload): Observable<Venda> {
    const payload = {
      id,
      dataCriacao: null,
      dataAlteracao: null,
      mesaId: venda.mesaId,
      cliente: venda.cliente,
      status: this.statusParaApi(venda.status),
      valorTotal: null,
      itens: venda.itens.map((item) => ({
        id: null,
        pedidoId: id,
        produtoId: item.produtoId,
        quantidade: item.quantidade,
        valorUnitario: null,
      })),
    };

    return this.http.put<ApiPedido>(`${API_URL}/${id}`, payload).pipe(
      switchMap((pedido) => this.mapearPedidoComDados(pedido)),
    );
  }

  atualizarStatus(id: number, status: string): Observable<Venda> {
    const statusCodificado = encodeURIComponent(this.statusParaApi(status));

    return this.http.patch<ApiPedido>(
      `${API_URL}/${id}/status/${statusCodificado}`,
      null,
    ).pipe(switchMap(() => this.buscarPorId(id)));
  }

  excluir(id: number): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }

  listarPorStatus(status: string, antesDe?: string): Observable<Venda[]> {
    let params = new HttpParams().set('status', this.statusParaApi(status));

    if (antesDe) {
      params = params.set('antesDe', antesDe);
    }

    return this.http.get<ApiPedido[] | null>(API_URL, { params }).pipe(
      map((pedidos) => pedidos ?? []),
      switchMap((pedidos) =>
        forkJoin({
          produtos: this.produtoService.listar().pipe(catchError(() => of([] as Produto[]))),
          mesas: this.mesaService.listar().pipe(catchError(() => of([] as Mesa[]))),
        }).pipe(
          map(({ produtos, mesas }) =>
            pedidos.map((pedido) => this.mapearPedido(pedido, produtos, mesas)),
          ),
        ),
      ),
    );
  }

  /**
   * O backend fornecido não expõe rota de relatório. O resumo é calculado
   * a partir dos pedidos retornados por GET /pedido; considera concluídos
   * como faturamento realizado.
   */
  relatorio(inicio: string, fim: string): Observable<RelatorioFaturamento> {
    return this.listar().pipe(
      map((pedidos) => {
        const dataInicio = new Date(`${inicio}T00:00:00`);
        const dataFim = new Date(`${fim}T23:59:59.999`);
        const concluidos = pedidos.filter((pedido) => {
          if (pedido.status !== STATUS_PEDIDO.ENTREGUE || !pedido.dataCriacao) {
            return false;
          }
          const data = new Date(pedido.dataCriacao);
          return data >= dataInicio && data <= dataFim;
        });
        const totalFaturado = concluidos.reduce(
          (total, pedido) => total + (pedido.valor_total ?? 0),
          0,
        );

        return {
          totalFaturado,
          quantidadeVendas: concluidos.length,
          ticketMedio: concluidos.length ? totalFaturado / concluidos.length : 0,
        };
      }),
    );
  }

  private mapearPedidoComDados(pedido: ApiPedido): Observable<Venda> {
    return forkJoin({
      produtos: this.produtoService.listar().pipe(catchError(() => of([] as Produto[]))),
      mesas: this.mesaService.listar().pipe(catchError(() => of([] as Mesa[]))),
    }).pipe(
      map(({ produtos, mesas }) => this.mapearPedido(pedido, produtos, mesas)),
    );
  }

  private mapearPedido(pedido: ApiPedido, produtos: Produto[], mesas: Mesa[]): Venda {
    const mesa = pedido.mesaId == null ? null : mesas.find((m) => m.id === pedido.mesaId);
    const itens = (pedido.itens ?? []).map((item) => {
      const produto = produtos.find((p) => p.id === item.produtoId) ?? {
        id: item.produtoId,
        nome: `Produto #${item.produtoId}`,
        descricao: null,
        preco: item.valorUnitario,
        custo: null,
        flAtivo: true,
        natureza: null,
        categoria: null,
      };

      return {
        id: item.id,
        quantidade: item.quantidade,
        preco_unitario: item.valorUnitario,
        valor_total: item.valorUnitario * item.quantidade,
        produto,
      };
    });

    return {
      id: pedido.id,
      status: this.statusDoBackend(pedido.status),
      tipo: 'Mesa',
      origem: null,
      valor_total: pedido.valorTotal,
      desconto: 0,
      dataCriacao: pedido.dataCriacao,
      mesa: mesa ? { id: mesa.id, numero: mesa.numero } : pedido.mesaId == null ? null : { id: pedido.mesaId, numero: pedido.mesaId },
      nomeCliente: pedido.cliente,
      cliente: null,
      cupom: null,
      usuario: null,
      itens,
    };
  }

  private statusParaApi(status: string): string {
    switch (status) {
      case STATUS_PEDIDO.AGUARDANDO:
      case 'ABERTO':
        return 'ABERTO';
      case STATUS_PEDIDO.PREPARANDO:
      case 'EM_PREPARO':
        return 'EM_PREPARO';
      case STATUS_PEDIDO.PRONTO:
      case STATUS_PEDIDO.ENTREGUE:
      case 'FINALIZADO':
        return 'FINALIZADO';
      case 'CANCELADO':
        return 'CANCELADO';
      default:
        return status.toUpperCase();
    }
  }

  private statusDoBackend(status: string): string {
    switch (status) {
      case 'ABERTO':
        return STATUS_PEDIDO.AGUARDANDO;
      case 'EM_PREPARO':
        return STATUS_PEDIDO.PREPARANDO;
      case 'FINALIZADO':
        return STATUS_PEDIDO.ENTREGUE;
      case 'CANCELADO':
        return 'Cancelado';
      default:
        return status;
    }
  }
}
