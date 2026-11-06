import { DatePipe, NgTemplateOutlet } from '@angular/common';
import { Component, DestroyRef, OnInit, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { interval } from 'rxjs';
import { CarregandoComponent } from '../../components/carregando/carregando';
import {
  PROXIMO_STATUS,
  Venda,
  VendaService,
  identificacaoPedido,
} from '../novo-pedido/venda.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';

const INTERVALO_ATUALIZACAO_MS = 10000;

@Component({
  selector: 'app-tela-cozinha',
  standalone: true,
  imports: [DatePipe, NgTemplateOutlet, CarregandoComponent],
  templateUrl: './tela-cozinha.html',
  styleUrl: './tela-cozinha.scss',
})
export class TelaCozinha implements OnInit {
  private vendaService = inject(VendaService);
  private destroyRef = inject(DestroyRef);

  readonly identificacao = identificacaoPedido;

  vendas = signal<Venda[]>([]);
  carregando = signal(true);
  erro = signal<string | null>(null);
  processandoId = signal<number | null>(null);

  aguardando = computed(() => this.ordenar(this.vendas().filter((v) => v.status === 'ABERTO')));
  preparando = computed(() => this.ordenar(this.vendas().filter((v) => v.status === 'EM_PREPARO')));

  ngOnInit() {
    this.carregar();
    interval(INTERVALO_ATUALIZACAO_MS)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.carregar(false));
  }

  carregar(mostrarCarregando = true) {
    if (mostrarCarregando) {
      this.carregando.set(true);
    }

    this.vendaService.listar().subscribe({
      next: (vendas) => {
        this.vendas.set(vendas.filter((v) => v.status === 'ABERTO' || v.status === 'EM_PREPARO'));
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar os pedidos.'));
        this.carregando.set(false);
      },
    });
  }

  avancar(venda: Venda): void {
    const proximoStatus = PROXIMO_STATUS[venda.status];
    if (!proximoStatus || this.processandoId() !== null) {
      return;
    }

    this.processandoId.set(venda.id);
    this.erro.set(null);

    this.vendaService.atualizarStatus(venda.id, proximoStatus).subscribe({
      next: () => {
        this.processandoId.set(null);
        this.carregar(false);
      },
      error: (erro) => {
        this.processandoId.set(null);
        this.erro.set(
          MensagemErroApiUtil.extrair(
            erro,
            `Não foi possível atualizar o pedido #${venda.id}. Verifique o estoque dos ingredientes.`,
          ),
        );
      },
    });
  }

  abrirNovaJanela() {
    window.open(`${window.location.origin}/tela-cozinha`, '_blank', 'width=1400,height=900,noopener,noreferrer');
  }

  private ordenar(lista: Venda[]): Venda[] {
    return [...lista].sort((a, b) => (a.dataCriacao ?? '').localeCompare(b.dataCriacao ?? ''));
  }
}
