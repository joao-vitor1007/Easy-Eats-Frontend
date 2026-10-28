import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface StatCard {
  icon: string;
  cor: string;
  valor: string;
  label: string;
  variacao: string;
}

interface StatusOperacional {
  icon: string;
  cor: string;
  valor: number;
  label: string;
}

interface FormaPagamento {
  nome: string;
  cor: string;
  valor: number;
}

interface ProdutoRanking {
  nome: string;
  quantidade: number;
}

interface PontoSemana {
  dia: string;
  valor: number;
}

interface PontoHorario {
  hora: string;
  pedidos: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.scss'],
})
export class DashboardComponent {
  readonly statsPrincipais: StatCard[] = [
    { icon: 'bi-cash-stack', cor: 'verde', valor: 'R$ 614,50', label: 'Vendas do Dia', variacao: '+12%' },
    { icon: 'bi-cart-check', cor: 'azul', valor: '18', label: 'Pedidos Realizados', variacao: '+8%' },
    { icon: 'bi-graph-up-arrow', cor: 'roxo', valor: 'R$ 34,14', label: 'Ticket Médio', variacao: '+5%' },
    { icon: 'bi-fire', cor: 'laranja', valor: 'R$ 268,90', label: 'Lucro do Dia', variacao: '+15%' },
  ];

  readonly statsOperacionais: StatusOperacional[] = [
    { icon: 'bi-egg-fried', cor: 'laranja', valor: 3, label: 'Em Preparo' },
    { icon: 'bi-check-circle', cor: 'verde', valor: 2, label: 'Prontos' },
    { icon: 'bi-box-seam', cor: 'azul', valor: 13, label: 'Entregues' },
    { icon: 'bi-exclamation-triangle', cor: 'vermelho', valor: 2, label: 'Estoque Crítico' },
  ];

  readonly vendasSemana: PontoSemana[] = [
    { dia: 'ter', valor: 950 },
    { dia: 'qua', valor: 980 },
    { dia: 'qui', valor: 860 },
    { dia: 'sex', valor: 840 },
    { dia: 'sab', valor: 430 },
    { dia: 'dom', valor: 650 },
    { dia: 'seg', valor: 900 },
  ];

  readonly formasPagamento: FormaPagamento[] = [
    { nome: 'PIX', cor: '#22c55e', valor: 310.0 },
    { nome: 'Cartão', cor: '#f97316', valor: 220.5 },
    { nome: 'Dinheiro', cor: '#3b82f6', valor: 74.0 },
    { nome: 'Vale', cor: '#f59e0b', valor: 10.0 },
  ];

  readonly produtosMaisVendidos: ProdutoRanking[] = [
    { nome: 'Hambúrguer Clássico', quantidade: 24 },
    { nome: 'X-Bacon', quantidade: 19 },
    { nome: 'Coca-Cola', quantidade: 17 },
    { nome: 'Batata Frita', quantidade: 15 },
    { nome: 'Milk Shake', quantidade: 9 },
  ];

  readonly horarioMovimento: PontoHorario[] = [
    { hora: '11h', pedidos: 4 },
    { hora: '12h', pedidos: 9 },
    { hora: '13h', pedidos: 7 },
    { hora: '18h', pedidos: 8 },
    { hora: '19h', pedidos: 14 },
    { hora: '20h', pedidos: 11 },
    { hora: '21h', pedidos: 5 },
  ];

  get totalFormasPagamento(): number {
    return this.formasPagamento.reduce((soma, f) => soma + f.valor, 0);
  }

  get maiorValorSemana(): number {
    return Math.max(...this.vendasSemana.map((p) => p.valor));
  }

  get maiorPedidosHorario(): number {
    return Math.max(...this.horarioMovimento.map((p) => p.pedidos));
  }

  /** Gera o "d" de um path SVG de área suavizada para o gráfico semanal. */
  get areaPath(): string {
    const largura = 700;
    const altura = 180;
    const passo = largura / (this.vendasSemana.length - 1);
    const max = this.maiorValorSemana * 1.15;

    const pontos = this.vendasSemana.map((p, i) => ({
      x: i * passo,
      y: altura - (p.valor / max) * altura,
    }));

    let d = `M ${pontos[0].x} ${pontos[0].y}`;
    for (let i = 0; i < pontos.length - 1; i++) {
      const atual = pontos[i];
      const proximo = pontos[i + 1];
      const meioX = (atual.x + proximo.x) / 2;
      d += ` C ${meioX} ${atual.y}, ${meioX} ${proximo.y}, ${proximo.x} ${proximo.y}`;
    }

    return d;
  }

  get areaFillPath(): string {
    return `${this.areaPath} L 700 180 L 0 180 Z`;
  }

  pontoX(i: number): number {
    return i * (700 / (this.vendasSemana.length - 1));
  }

  pontoY(valor: number): number {
    const max = this.maiorValorSemana * 1.15;
    return 180 - (valor / max) * 180;
  }

}
