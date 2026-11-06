import { CurrencyPipe } from '@angular/common';
import { Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { CarregandoComponent } from '../../components/carregando/carregando';
import { Produto, ProdutoService } from '../cadastro-produto/produto.service';
import { Mesa, MesaService } from '../mesas/mesa.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';
import { VendaService } from './venda.service';

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Lanches: 'bi-egg-fried',
  Acompanhamentos: 'bi-basket3',
  Bebidas: 'bi-cup-straw',
  Sobremesas: 'bi-cake2',
};

interface ItemCarrinho {
  produto: Produto;
  qtd: number;
}

@Component({
  selector: 'app-novo-pedido',
  standalone: true,
  imports: [CurrencyPipe, FormsModule, RouterLink, CarregandoComponent],
  templateUrl: './novo-pedido.html',
  styleUrls: ['./novo-pedido.scss'],
})
export class NovoPedido implements OnInit {
  private produtoService = inject(ProdutoService);
  private mesaService = inject(MesaService);
  private vendaService = inject(VendaService);
  private route = inject(ActivatedRoute);

  cliente = '';
  mesaSelecionada = signal<number | null>(null);
  busca = signal('');
  categoriaSelecionada = signal('Todos');

  produtos = signal<Produto[]>([]);
  mesas = signal<Mesa[]>([]);
  carrinho = signal<ItemCarrinho[]>([]);

  carregando = signal(true);
  enviando = signal(false);
  erro = signal<string | null>(null);
  sucesso = signal<string | null>(null);

  categorias = computed(() => {
    const nomes = new Set(
      this.produtos()
        .map((produto) => produto.categoria?.nome)
        .filter((nome): nome is string => !!nome),
    );
    return ['Todos', ...nomes];
  });

  produtosFiltrados = computed(() => {
    const termo = this.busca().trim().toLowerCase();
    const categoria = this.categoriaSelecionada();
    return this.produtos().filter(
      (produto) =>
        (categoria === 'Todos' || produto.categoria?.nome === categoria) &&
        (!termo || produto.nome.toLowerCase().includes(termo)),
    );
  });

  total = computed(() => this.carrinho().reduce((soma, item) => soma + item.produto.preco * item.qtd, 0));
  quantidadeItens = computed(() => this.carrinho().reduce((soma, item) => soma + item.qtd, 0));
  podeFinalizar = computed(() => this.carrinho().length > 0 && this.mesaSelecionada() !== null && !this.enviando());

  ngOnInit(): void {
    forkJoin({
      produtos: this.produtoService.listar(),
      mesas: this.mesaService.listar(),
    }).subscribe({
      next: ({ produtos, mesas }) => {
        this.produtos.set(produtos);
        this.mesas.set(mesas);

        const mesaDaRota = Number(this.route.snapshot.queryParamMap.get('mesa'));
        if (mesaDaRota && mesas.some((mesa) => mesa.id === mesaDaRota)) {
          this.mesaSelecionada.set(mesaDaRota);
        }
        this.carregando.set(false);
      },
      error: (erro) => {
        this.erro.set(MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar produtos e mesas.'));
        this.carregando.set(false);
      },
    });
  }

  iconeCategoria(nomeCategoria?: string | null): string {
    return (nomeCategoria && ICONE_POR_CATEGORIA[nomeCategoria]) || 'bi-basket3';
  }

  semPreco(produto: Produto): boolean {
    return !(produto.preco > 0);
  }

  quantidadeNoCarrinho(produto: Produto): number {
    return this.carrinho().find((item) => item.produto.id === produto.id)?.qtd ?? 0;
  }

  adicionarAoCarrinho(produto: Produto): void {
    if (this.semPreco(produto)) return;

    this.carrinho.update((itens) => {
      const existente = itens.find((item) => item.produto.id === produto.id);
      return existente
        ? itens.map((item) => (item === existente ? { ...item, qtd: item.qtd + 1 } : item))
        : [...itens, { produto, qtd: 1 }];
    });
  }

  alterarQtd(item: ItemCarrinho, delta: number): void {
    this.carrinho.update((itens) =>
      itens
        .map((atual) => (atual === item ? { ...atual, qtd: atual.qtd + delta } : atual))
        .filter((atual) => atual.qtd > 0),
    );
  }

  remover(item: ItemCarrinho): void {
    this.carrinho.update((itens) => itens.filter((atual) => atual !== item));
  }

  limparCarrinho(): void {
    this.carrinho.set([]);
  }

  confirmarPedido(): void {
    const mesaId = this.mesaSelecionada();
    if (mesaId === null) {
      this.erro.set('Selecione uma mesa para criar o pedido.');
      return;
    }
    if (!this.podeFinalizar()) return;

    this.enviando.set(true);
    this.erro.set(null);

    this.vendaService
      .criar({
        status: 'ABERTO',
        mesaId,
        cliente: this.cliente.trim() || null,
        itens: this.carrinho().map((item) => ({ produtoId: item.produto.id, quantidade: item.qtd })),
      })
      .subscribe({
        next: (pedido) => {
          this.enviando.set(false);
          this.carrinho.set([]);
          this.cliente = '';
          this.mesaSelecionada.set(null);
          this.sucesso.set(`Pedido #${pedido.id} enviado para a cozinha!`);
          setTimeout(() => this.sucesso.set(null), 5000);
        },
        error: (erro) => {
          this.enviando.set(false);
          this.erro.set(
            MensagemErroApiUtil.extrair(
              erro,
              'Não foi possível criar o pedido. Confira a mesa, o estoque dos ingredientes e tente novamente.',
            ),
          );
        },
      });
  }
}
