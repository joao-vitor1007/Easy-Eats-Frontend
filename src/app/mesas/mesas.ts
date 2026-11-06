import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { CurrencyPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { catchError, forkJoin, of } from 'rxjs';
import { CarregandoComponent } from '../../components/carregando/carregando';
import { AuthService, PERFIS_GESTAO } from '../auth/auth.service';
import { Venda, VendaService } from '../novo-pedido/venda.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';
import { Mesa, MesaService } from './mesa.service';

interface MesaComOcupacao extends Mesa {
  pedidosAbertos: Venda[];
}

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, CarregandoComponent],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss',
})
export class Mesas implements OnInit {
  private mesaService = inject(MesaService);
  private vendaService = inject(VendaService);
  private router = inject(Router);
  readonly podeGerenciar = inject(AuthService).temPerfil(PERFIS_GESTAO);

  carregando = signal(true);
  salvando = signal(false);
  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  private mesas = signal<Mesa[]>([]);
  private pedidos = signal<Venda[]>([]);

  numero: number | null = null;
  editando = signal<Mesa | null>(null);

  mesasComOcupacao = computed<MesaComOcupacao[]>(() =>
    this.mesas().map((mesa) => ({
      ...mesa,
      pedidosAbertos: this.pedidos().filter(
        (p) => p.mesa?.id === mesa.id && (p.status === 'ABERTO' || p.status === 'EM_PREPARO'),
      ),
    })),
  );

  totalOcupadas = computed(() => this.mesasComOcupacao().filter((m) => m.pedidosAbertos.length > 0).length);
  totalLivres = computed(() => this.mesas().length - this.totalOcupadas());

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando.set(true);

    forkJoin({
      mesas: this.mesaService.listar(),
      pedidos: this.vendaService.listar().pipe(catchError(() => of([] as Venda[]))),
    }).subscribe({
      next: ({ mesas, pedidos }) => {
        this.mesas.set(mesas);
        this.pedidos.set(pedidos);
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar as mesas.'));
        this.carregando.set(false);
      },
    });
  }

  totalMesa(mesa: MesaComOcupacao): number {
    return mesa.pedidosAbertos.reduce((soma, pedido) => soma + pedido.valorTotal, 0);
  }

  novoPedido(mesa: Mesa): void {
    this.router.navigate(['/novo-pedido'], { queryParams: { mesa: mesa.id } });
  }

  salvar(): void {
    const numero = Number(this.numero);
    if (!Number.isInteger(numero) || numero <= 0) {
      this.erro.set('Informe um número de mesa inteiro e maior que zero.');
      return;
    }

    const editando = this.editando();
    this.salvando.set(true);
    this.erro.set(null);

    const requisicao = editando
      ? this.mesaService.atualizar(editando.id, numero)
      : this.mesaService.criar(numero);

    requisicao.subscribe({
      next: () => {
        this.salvando.set(false);
        this.mostrarSucesso(editando ? `Mesa ${numero} atualizada.` : `Mesa ${numero} cadastrada.`);
        this.cancelarEdicao();
        this.carregar();
      },
      error: (erro) => {
        this.salvando.set(false);
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível salvar a mesa.'));
      },
    });
  }

  editar(mesa: Mesa): void {
    this.editando.set(mesa);
    this.numero = mesa.numero;
  }

  cancelarEdicao(): void {
    this.editando.set(null);
    this.numero = null;
  }

  excluir(mesa: MesaComOcupacao): void {
    if (mesa.pedidosAbertos.length > 0) {
      this.erro.set(`A mesa ${mesa.numero} tem pedidos em andamento e não pode ser excluída agora.`);
      return;
    }
    if (!confirm(`Excluir a mesa ${mesa.numero}?`)) {
      return;
    }

    this.mesaService.excluir(mesa.id).subscribe({
      next: () => {
        this.mostrarSucesso(`Mesa ${mesa.numero} excluída.`);
        this.carregar();
      },
      error: (erro) => this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível excluir a mesa.')),
    });
  }

  private mostrarSucesso(mensagem: string): void {
    this.sucesso.set(mensagem);
    setTimeout(() => this.sucesso.set(null), 4000);
  }
}
