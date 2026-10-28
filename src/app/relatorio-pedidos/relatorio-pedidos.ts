import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface LinhaStatus {
  status: string;
  cor: string;
  quantidade: number;
  valor: number;
}

interface LinhaDia {
  dia: string;
  pedidos: number;
  valor: number;
}

@Component({
  selector: 'app-relatorio-pedidos',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './relatorio-pedidos.html',
  styleUrl: './relatorio-pedidos.scss',
})
export class RelatorioPedidos {
  readonly totalPedidos = 86;
  readonly ticketMedio = 47.35;
  readonly valorTotal = 4072.1;
  readonly taxaCancelamento = 3.5;

  readonly porStatus: LinhaStatus[] = [
    { status: 'Entregue', cor: 'verde', quantidade: 64, valor: 3010.5 },
    { status: 'Preparando', cor: 'laranja', quantidade: 9, valor: 421.0 },
    { status: 'Aguardando', cor: 'azul', quantidade: 10, valor: 512.6 },
    { status: 'Cancelado', cor: 'vermelho', quantidade: 3, valor: 128.0 },
  ];

  readonly porDia: LinhaDia[] = [
    { dia: 'Segunda', pedidos: 10, valor: 470.0 },
    { dia: 'Terça', pedidos: 12, valor: 560.0 },
    { dia: 'Quarta', pedidos: 14, valor: 610.0 },
    { dia: 'Quinta', pedidos: 11, valor: 505.0 },
    { dia: 'Sexta', pedidos: 16, valor: 780.0 },
    { dia: 'Sábado', pedidos: 15, valor: 720.0 },
    { dia: 'Domingo', pedidos: 8, valor: 427.1 },
  ];

  get maiorValorDia(): number {
    return Math.max(...this.porDia.map((d) => d.valor));
  }
}
