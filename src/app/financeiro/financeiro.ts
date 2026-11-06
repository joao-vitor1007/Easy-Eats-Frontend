import { CurrencyPipe, DatePipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CarregandoComponent } from '../../components/carregando/carregando';
import { FiltroPeriodoComponent } from '../../components/filtro-periodo/filtro-periodo';
import { Venda, VendaService, filtrarPorPeriodo, identificacaoPedido } from '../novo-pedido/venda.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';
import { Periodo, PeriodoUtil } from '../utils/periodoUtil';

@Component({
  selector: 'app-financeiro',
  standalone: true,
  templateUrl: './financeiro.html',
  imports: [CurrencyPipe, DatePipe, CarregandoComponent, FiltroPeriodoComponent],
  styleUrls: ['./financeiro.scss'],
})
export class Financeiro implements OnInit {
  private vendaService = inject(VendaService);

  readonly identificacao = identificacaoPedido;

  carregando = signal(true);
  erro = signal<string | null>(null);
  private todos = signal<Venda[]>([]);
  periodo = signal<Periodo>(PeriodoUtil.resolver('hoje'));

  private pedidosPeriodo = computed(() => filtrarPorPeriodo(this.todos(), this.periodo().inicio, this.periodo().fim));
  relatorio = computed(() => VendaService.resumir(this.pedidosPeriodo()));

  /** Valor ainda em aberto (pedidos aguardando ou em preparo no período). */
  emAberto = computed(() =>
    this.pedidosPeriodo()
      .filter((p) => p.status === 'ABERTO' || p.status === 'EM_PREPARO')
      .reduce((soma, p) => soma + p.valorTotal, 0),
  );

  finalizados = computed(() =>
    this.pedidosPeriodo()
      .filter((p) => p.status === 'FINALIZADO')
      .sort((a, b) => (b.dataCriacao ?? '').localeCompare(a.dataCriacao ?? '')),
  );

  porDia = computed(() => {
    const mapa = new Map<string, { dia: string; quantidade: number; valor: number }>();
    for (const pedido of this.finalizados()) {
      const dia = (pedido.dataCriacao ?? '').slice(0, 10);
      const linha = mapa.get(dia) ?? { dia, quantidade: 0, valor: 0 };
      linha.quantidade++;
      linha.valor += pedido.valorTotal;
      mapa.set(dia, linha);
    }
    return [...mapa.values()].sort((a, b) => b.dia.localeCompare(a.dia));
  });

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);
    this.erro.set(null);

    this.vendaService.listar().subscribe({
      next: (pedidos) => {
        this.todos.set(pedidos);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar o faturamento.'));
        this.carregando.set(false);
      },
    });
  }

  dataDoDia(dia: string): Date {
    return new Date(`${dia}T00:00:00`);
  }
}
