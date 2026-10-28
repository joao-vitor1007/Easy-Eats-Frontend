import { Component } from '@angular/core';

interface ItemPreparado {
  nome: string;
  quantidade: number;
}

interface TempoHorario {
  hora: string;
  minutos: number;
}

@Component({
  selector: 'app-relatorio-cozinha',
  standalone: true,
  templateUrl: './relatorio-cozinha.html',
  styleUrl: './relatorio-cozinha.scss',
})
export class RelatorioCozinha {
  readonly pedidosPreparadosHoje = 42;
  readonly tempoMedioPreparo = 14.5;
  readonly pedidosAtrasados = 2;

  readonly itensMaisPreparados: ItemPreparado[] = [
    { nome: 'Hambúrguer Clássico', quantidade: 24 },
    { nome: 'X-Bacon', quantidade: 19 },
    { nome: 'Batata Frita', quantidade: 15 },
    { nome: 'Hot Dog', quantidade: 9 },
  ];

  readonly tempoPorHorario: TempoHorario[] = [
    { hora: '11h', minutos: 11 },
    { hora: '12h', minutos: 16 },
    { hora: '13h', minutos: 18 },
    { hora: '18h', minutos: 13 },
    { hora: '19h', minutos: 17 },
    { hora: '20h', minutos: 15 },
  ];

  get maiorTempo(): number {
    return Math.max(...this.tempoPorHorario.map((t) => t.minutos));
  }

  get maiorQuantidadeItem(): number {
    return Math.max(...this.itensMaisPreparados.map((i) => i.quantidade));
  }
}
