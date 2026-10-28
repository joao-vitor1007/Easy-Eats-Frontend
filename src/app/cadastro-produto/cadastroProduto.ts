import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ToggleSwitchComponent } from '../../components/toggle-switch/toggle-switch';
import { CarregandoComponent } from '../../components/carregando/carregando';
import { ModalCadastroProduto } from '../../components/modal-cadastro-produto/modal-cadastro-produto';
import { Categoria, CategoriaService } from '../categorias/categoria.service';
import { Produto, ProdutoService } from './produto.service';
import { MensagemErroApiUtil } from '../utils/mensagemErroApiUtil';

@Component({
  selector: 'app-cadastro-produto',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ToggleSwitchComponent,
    CarregandoComponent,
    ModalCadastroProduto,
  ],
  templateUrl: './cadastroProduto.html',
  styleUrls: ['./cadastroProduto.scss'],
})
export class CadastroProdutoComponent implements OnInit {
  categorias: Categoria[] = [];
  produtos: Produto[] = [];
  carregando = true;
  enviando = false;
  erro: string | null = null;
  produtoParaConfirmar: Produto | null = null;

  form = new FormGroup({
    nome: new FormControl('', { nonNullable: true, validators: Validators.required }),
    descricao: new FormControl('', { nonNullable: true }),
    categoriaId: new FormControl<number | null>(null, Validators.required),
    preco: new FormControl<number | null>(null, [Validators.required, Validators.min(0.01)]),
    flAtivo: new FormControl(true, { nonNullable: true }),
  });

  constructor(
    private produtoService: ProdutoService,
    private categoriaService: CategoriaService,
  ) {}

  ngOnInit(): void {
    this.categoriaService.listar().subscribe({
      next: (categorias) => (this.categorias = categorias),
      error: () => {
        this.erro = 'Não foi possível carregar as categorias.';
      },
    });
    this.carregarProdutos();
  }

  private carregarProdutos(): void {
    this.carregando = true;
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.carregando = false;
      },
      error: (erro) => {
        this.erro = MensagemErroApiUtil.extrair(erro, 'Não foi possível carregar os produtos cadastrados.');
        this.carregando = false;
      },
    });
  }

  salvar(): void {
    if (this.form.invalid || this.enviando) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    this.enviando = true;
    this.erro = null;

    this.produtoService.criar({
      nome: valores.nome,
      descricao: valores.descricao || null,
      preco: valores.preco!,
      custo: null,
      flAtivo: valores.flAtivo,
      natureza: 'REVENDA',
      categoria: { id: valores.categoriaId! },
    }).subscribe({
      next: (produtoCriado) => {
        this.enviando = false;
        this.produtos = [produtoCriado, ...this.produtos];
        this.produtoParaConfirmar = produtoCriado;
        this.form.reset({ nome: '', descricao: '', categoriaId: null, preco: null, flAtivo: true });
      },
      error: (erro) => {
        this.enviando = false;
        this.erro = MensagemErroApiUtil.extrair(
          erro,
          'Não foi possível cadastrar o produto. Verifique os dados e tente novamente.',
        );
      },
    });
  }

  fecharModalConfirmacao(): void {
    this.produtoParaConfirmar = null;
  }
}
