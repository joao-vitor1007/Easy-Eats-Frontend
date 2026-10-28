import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Funcionalidade } from '../auth/auth.service';
import { FUNCIONALIDADE_LABELS, Segmento, SegmentoService } from './segmento.service';

@Component({
  selector: 'app-superadmin-segmentos',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: './superadmin-segmentos.html',
  styleUrl: './superadmin-segmentos.scss',
})
export class SuperadminSegmentos implements OnInit {
  private fb = inject(FormBuilder);
  private segmentoService = inject(SegmentoService);

  segmentos: Segmento[] = [];
  termoBusca = '';
  editandoId: number | null = null;
  carregando = false;
  erro: string | null = null;

  readonly todasFuncionalidades = Object.keys(FUNCIONALIDADE_LABELS) as Funcionalidade[];
  readonly funcionalidadeLabels = FUNCIONALIDADE_LABELS;

  form = this.fb.group({
    nome: ['', Validators.required],
    descricao: [''],
    flAtivo: [true],
  });

  funcionalidadesSelecionadas = new Set<Funcionalidade>();

  ngOnInit() {
    this.carregar();
  }

  carregar() {
    this.carregando = true;
    this.erro = null;
    this.segmentoService.listar().subscribe({
      next: (segmentos) => {
        this.segmentos = segmentos;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar os segmentos.';
        this.carregando = false;
      },
    });
  }

  get segmentosFiltrados(): Segmento[] {
    const termo = this.termoBusca.trim().toLowerCase();
    if (!termo) {
      return this.segmentos;
    }
    return this.segmentos.filter((s) => s.nome.toLowerCase().includes(termo));
  }

  alternarFuncionalidade(codigo: Funcionalidade) {
    if (this.funcionalidadesSelecionadas.has(codigo)) {
      this.funcionalidadesSelecionadas.delete(codigo);
    } else {
      this.funcionalidadesSelecionadas.add(codigo);
    }
  }

  funcionalidadeMarcada(codigo: Funcionalidade): boolean {
    return this.funcionalidadesSelecionadas.has(codigo);
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { nome, descricao, flAtivo } = this.form.value;
    const payload = {
      nome: nome!,
      descricao: descricao || null,
      flAtivo: flAtivo ?? true,
      funcionalidades: Array.from(this.funcionalidadesSelecionadas),
    };

    const operacao =
      this.editandoId !== null
        ? this.segmentoService.atualizar(this.editandoId, payload)
        : this.segmentoService.criar(payload);

    operacao.subscribe({
      next: () => {
        this.cancelarEdicao();
        this.carregar();
      },
      error: () => {
        this.erro = 'Não foi possível salvar o segmento.';
      },
    });
  }

  editar(segmento: Segmento) {
    this.editandoId = segmento.id;
    this.form.setValue({
      nome: segmento.nome,
      descricao: segmento.descricao ?? '',
      flAtivo: segmento.flAtivo,
    });
    this.funcionalidadesSelecionadas = new Set(segmento.funcionalidades);
  }

  cancelarEdicao() {
    this.editandoId = null;
    this.form.reset({ nome: '', descricao: '', flAtivo: true });
    this.funcionalidadesSelecionadas = new Set();
  }

  excluir(segmento: Segmento) {
    if (!confirm(`Excluir o segmento "${segmento.nome}"? Empresas vinculadas a ele deixam de ter restrição de módulos.`)) {
      return;
    }
    this.segmentoService.excluir(segmento.id).subscribe({
      next: () => this.carregar(),
      error: () => {
        this.erro = 'Não foi possível excluir o segmento.';
      },
    });
  }
}
