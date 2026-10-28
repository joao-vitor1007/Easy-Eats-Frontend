import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CarregandoComponent } from '../../components/carregando/carregando';
import { ActivatedRoute } from '@angular/router';
import { Produto, ProdutoService } from '../cadastro-produto/produto.service';
import { Mesa, MesaService } from '../mesas/mesa.service';
import { customizacaoVazia, CustomizacaoProduto } from './carrinho.model';
import { STATUS_PEDIDO, VendaService } from './venda.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';

const ICONE_POR_CATEGORIA: Record<string, string> = {
  Lanches: 'bi-egg-fried',
  Acompanhamentos: 'bi-basket3',
  Bebidas: 'bi-cup-straw',
};

interface ItemCarrinho {
  id: number;
  produto: Produto;
  qtd: number;
  customizacao: CustomizacaoProduto;
}

let proximoIdCarrinho = 0;

@Component({
  selector: 'app-novo-pedido',
  standalone: true,
  imports: [CommonModule, FormsModule, CarregandoComponent],
  templateUrl: './novo-pedido.html',
  styleUrls: ['./novo-pedido.scss'],
})
export class NovoPedido implements OnInit {
  private produtoService = inject(ProdutoService);
  private mesaService = inject(MesaService);
  private vendaService = inject(VendaService);
  private route = inject(ActivatedRoute);

  cliente = '';
  mesaSelecionada: number | null = null;
  produtos: Produto[] = [];
  mesas: Mesa[] = [];

  avisoPosPedido: string | null = null;
  categorias: string[] = ['Todos'];
  categoriaSelecionada = 'Todos';

  carregando = true;
  enviando = false;
  erro: string | null = null;
  sucesso = false;
  carrinho: ItemCarrinho[] = [];

  // O backend fornecido exige uma mesa para criar um pedido.
  get usaMesa(): boolean {
    return true;
  }

  ngOnInit(): void {
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos.filter((produto) => produto.flAtivo);
        const nomesCategorias = new Set(
          this.produtos.map((produto) => produto.categoria?.nome).filter((nome): nome is string => !!nome),
        );
        this.categorias = ['Todos', ...nomesCategorias];
        this.carregando = false;
      },
      error: (erro) => {
        this.erro = MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar os produtos.');
        this.carregando = false;
      },
    });

    this.mesaService.listar().subscribe({
      next: (mesas) => {
        this.mesas = mesas;
        const mesaDaRota = Number(this.route.snapshot.queryParamMap.get('mesa'));
        if (mesaDaRota && mesas.some((mesa) => mesa.id === mesaDaRota)) {
          this.mesaSelecionada = mesaDaRota;
        }
      },
      error: () => {
        this.erro = 'Não foi possível carregar as mesas.';
      },
    });
  }

  selecionarCategoria(categoria: string): void {
    this.categoriaSelecionada = categoria;
  }

  iconeCategoria(nomeCategoria?: string | null): string {
    if (!nomeCategoria) return 'bi-basket3';
    return ICONE_POR_CATEGORIA[nomeCategoria] ?? 'bi-basket3';
  }

  produtosFiltrados(): Produto[] {
    if (this.categoriaSelecionada === 'Todos') return this.produtos;
    return this.produtos.filter((produto) => produto.categoria?.nome === this.categoriaSelecionada);
  }

  adicionarAoCarrinho(produto: Produto): void {
    const existente = this.carrinho.find((item) => item.produto.id === produto.id);
    if (existente) {
      existente.qtd++;
      return;
    }
    this.carrinho.push({
      id: proximoIdCarrinho++,
      produto,
      qtd: 1,
      customizacao: customizacaoVazia(),
    });
  }

  precoUnitario(item: ItemCarrinho): number {
    // A API calcula o preço a partir do preço ativo do produto; não aceita
    // adicionais ou preço unitário enviados pelo frontend.
    return item.produto.preco;
  }

  aumentarQtd(index: number): void {
    this.carrinho[index].qtd++;
  }

  diminuirQtd(index: number): void {
    if (this.carrinho[index].qtd > 1) {
      this.carrinho[index].qtd--;
    } else {
      this.carrinho.splice(index, 1);
    }
  }

  total(): number {
    return this.carrinho.reduce((soma, item) => soma + this.precoUnitario(item) * item.qtd, 0);
  }

  podeFinalizar(): boolean {
    return this.carrinho.length > 0 && this.mesaSelecionada !== null;
  }

  confirmarPedido(): void {
    const mesaId = this.mesaSelecionada;
    if (this.enviando || this.carrinho.length === 0 || mesaId === null) {
      if (mesaId === null) {
        this.erro = 'Selecione uma mesa para criar o pedido.';
      }
      return;
    }

    this.enviando = true;
    this.erro = null;

    this.vendaService.criar({
      status: STATUS_PEDIDO.AGUARDANDO,
      mesaId,
      cliente: this.cliente.trim() || null,
      itens: this.carrinho.map((item) => ({
        produtoId: item.produto.id,
        quantidade: item.qtd,
      })),
    }).subscribe({
      next: () => this.finalizarComSucesso(),
      error: (erro) => {
        this.enviando = false;
        this.erro = MensagemErroApiUtil.extrair(
          erro,
          'Não foi possível criar o pedido. Confira a mesa, os produtos e tente novamente.',
        );
      },
    });
  }

  private finalizarComSucesso(): void {
    this.enviando = false;
    this.sucesso = true;
    this.carrinho = [];
    this.cliente = '';
    this.mesaSelecionada = null;
    setTimeout(() => (this.sucesso = false), 4000);
    setTimeout(() => (this.avisoPosPedido = null), 8000);
  }
}
