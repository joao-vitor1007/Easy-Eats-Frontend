import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarregandoComponent } from '../../components/carregando/carregando';
import {
  PROXIMO_STATUS,
  STATUS_PEDIDO_LABEL,
  StatusPedido,
  TODOS_STATUS_PEDIDO,
  Venda,
  VendaService,
  identificacaoPedido,
} from '../novo-pedido/venda.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';

type FiltroStatus = 'TODOS' | StatusPedido;

@Component({
  selector: 'app-historico-vendas',
  standalone: true,
  templateUrl: './historico-vendas.html',
  styleUrls: ['./historico-vendas.scss'],
  imports: [CurrencyPipe, DatePipe, FormsModule, CarregandoComponent],
})
export class HistoricoVendasComponent implements OnInit {
  private vendaService = inject(VendaService);

  readonly statusLabel = STATUS_PEDIDO_LABEL;
  readonly filtros: { valor: FiltroStatus; label: string }[] = [
    { valor: 'TODOS', label: 'Todos' },
    ...TODOS_STATUS_PEDIDO.map((status) => ({ valor: status as FiltroStatus, label: STATUS_PEDIDO_LABEL[status] })),
  ];
  readonly identificacao = identificacaoPedido;

  busca = signal('');
  filtroSelecionado = signal<FiltroStatus>('TODOS');
  carregando = signal(true);
  erro = signal<string | null>(null);
  processandoId = signal<number | null>(null);
  vendas = signal<Venda[]>([]);

  vendasFiltradas = computed(() => {
    const termo = this.busca().toLowerCase().trim().replace(/^#/, '');
    const filtro = this.filtroSelecionado();

    return this.vendas()
      .filter((venda) => filtro === 'TODOS' || venda.status === filtro)
      .filter(
        (venda) =>
          !termo ||
          identificacaoPedido(venda).toLowerCase().includes(termo) ||
          (venda.nomeCliente ?? '').toLowerCase().includes(termo) ||
          venda.id.toString() === termo,
      )
      .sort((a, b) => (b.dataCriacao ?? '').localeCompare(a.dataCriacao ?? ''));
  });

  totalFiltrado = computed(() =>
    this.vendasFiltradas()
      .filter((venda) => venda.status !== 'CANCELADO')
      .reduce((total, venda) => total + venda.valorTotal, 0),
  );

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando.set(true);
    this.vendaService.listar().subscribe({
      next: (vendas) => {
        this.vendas.set(vendas);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar o histórico de pedidos.'));
        this.carregando.set(false);
      },
    });
  }

  proximoStatus(venda: Venda): StatusPedido | undefined {
    return PROXIMO_STATUS[venda.status];
  }

  podeCancelar(venda: Venda): boolean {
    return venda.status === 'ABERTO' || venda.status === 'EM_PREPARO';
  }

  avancar(venda: Venda) {
    const proximo = this.proximoStatus(venda);
    if (proximo) this.alterarStatus(venda, proximo);
  }

  cancelar(venda: Venda) {
    const aviso =
      venda.status === 'EM_PREPARO'
        ? ' Os ingredientes já baixados do estoque não são devolvidos automaticamente.'
        : '';
    if (confirm(`Cancelar o pedido #${venda.id}?${aviso}`)) {
      this.alterarStatus(venda, 'CANCELADO');
    }
  }

  private alterarStatus(venda: Venda, status: StatusPedido) {
    this.processandoId.set(venda.id);
    this.erro.set(null);

    this.vendaService.atualizarStatus(venda.id, status).subscribe({
      next: (atualizada) => {
        this.vendas.update((lista) => lista.map((v) => (v.id === atualizada.id ? atualizada : v)));
        this.processandoId.set(null);
      },
      error: (erro) => {
        this.processandoId.set(null);
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível atualizar o status do pedido.'));
      },
    });
  }
}
