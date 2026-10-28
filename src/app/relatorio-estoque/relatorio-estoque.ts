import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ItemConsumido {
  nome: string;
  quantidade: number;
}

interface CategoriaEstoque {
  categoria: string;
  quantidadeItens: number;
}

@Component({
  selector: 'app-relatorio-estoque',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio-estoque.html',
  styleUrl: './relatorio-estoque.scss',
})
export class RelatorioEstoque {
  totalItens = 186;
  valorTotalEstoque = 24350.75;
  itensCriticos = 7;

  itensMaisConsumidos: ItemConsumido[] = [
    { nome: 'Pão de Hambúrguer', quantidade: 420 },
    { nome: 'Carne Bovina (kg)', quantidade: 310 },
    { nome: 'Refrigerante Lata', quantidade: 275 },
    { nome: 'Queijo Mussarela (kg)', quantidade: 198 },
    { nome: 'Batata Congelada (kg)', quantidade: 162 },
  ];

  estoquePorCategoria: CategoriaEstoque[] = [
    { categoria: 'Carnes', quantidadeItens: 42 },
    { categoria: 'Bebidas', quantidadeItens: 58 },
    { categoria: 'Embalagens', quantidadeItens: 34 },
    { categoria: 'Hortifruti', quantidadeItens: 29 },
    { categoria: 'Congelados', quantidadeItens: 23 },
  ];
}
