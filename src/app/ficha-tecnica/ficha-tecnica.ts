import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface Insumo {
  nome: string;
  quantidade: string;
  custoUnitario: number;
}

interface Produto {
  id: number;
  nome: string;
  icone: string;
  insumos: Insumo[];
  expandido: boolean;
}

@Component({
  selector: 'app-ficha-tecnica',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ficha-tecnica.html',
  styleUrl: './ficha-tecnica.scss',
})
export class FichaTecnica {
  produtos: Produto[] = [
    {
      id: 1,
      nome: 'Hambúrguer Clássico',
      icone: 'bi-egg-fried',
      expandido: false,
      insumos: [
        { nome: 'Pão brioche', quantidade: '1un', custoUnitario: 1.5 },
        { nome: 'Carne bovina', quantidade: '150g', custoUnitario: 0.06 },
        { nome: 'Queijo cheddar', quantidade: '1 fatia', custoUnitario: 0.8 },
        { nome: 'Molho especial', quantidade: '20ml', custoUnitario: 0.1 },
      ],
    },
    {
      id: 2,
      nome: 'X-Bacon',
      icone: 'bi-egg-fried',
      expandido: false,
      insumos: [
        { nome: 'Pão brioche', quantidade: '1un', custoUnitario: 1.5 },
        { nome: 'Carne bovina', quantidade: '150g', custoUnitario: 0.06 },
        { nome: 'Queijo cheddar', quantidade: '1 fatia', custoUnitario: 0.8 },
        { nome: 'Bacon', quantidade: '30g', custoUnitario: 0.12 },
        { nome: 'Molho especial', quantidade: '20ml', custoUnitario: 0.1 },
      ],
    },
    {
      id: 3,
      nome: 'Batata Frita',
      icone: 'bi-basket',
      expandido: false,
      insumos: [
        { nome: 'Batata', quantidade: '250g', custoUnitario: 0.015 },
        { nome: 'Óleo de fritura', quantidade: '50ml', custoUnitario: 0.02 },
        { nome: 'Sal temperado', quantidade: '5g', custoUnitario: 0.03 },
      ],
    },
    {
      id: 4,
      nome: 'Coca-Cola',
      icone: 'bi-cup-straw',
      expandido: false,
      insumos: [{ nome: 'Lata Coca-Cola 350ml', quantidade: '1un', custoUnitario: 3.2 }],
    },
  ];

  alternarExpansao(produto: Produto) {
    produto.expandido = !produto.expandido;
  }

  custoTotal(produto: Produto): number {
    return produto.insumos.reduce((soma, insumo) => {
      const quantidadeNumerica = parseFloat(insumo.quantidade.replace(',', '.'));
      return soma + quantidadeNumerica * insumo.custoUnitario;
    }, 0);
  }
}
