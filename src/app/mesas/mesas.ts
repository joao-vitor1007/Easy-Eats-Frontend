import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Mesa, MesaService } from './mesa.service';

@Component({
  selector: 'app-mesas',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './mesas.html',
  styleUrl: './mesas.scss',
})
export class Mesas implements OnInit {
  private mesaService = inject(MesaService);
  private router = inject(Router);

  mesas: Mesa[] = [];
  carregando = true;
  abrindoMesaId: number | null = null;
  erro: string | null = null;

  ngOnInit(): void {
    this.carregar();
  }

  carregar(): void {
    this.carregando = true;
    this.mesaService.listar().subscribe({
      next: (mesas) => {
        this.mesas = mesas;
        this.carregando = false;
      },
      error: () => {
        this.erro = 'Não foi possível carregar as mesas.';
        this.carregando = false;
      },
    });
  }

  get totalLivres(): number {
    return this.mesas.length;
  }

  get totalOcupadas(): number {
    return 0;
  }

  get totalReservadas(): number {
    return 0;
  }

  badgeClasse(status: string): string {
    return status === 'LIVRE' ? 'sucesso' : 'neutro';
  }

  rotulo(status: string): string {
    return status === 'LIVRE' ? 'Livre' : status;
  }

  selecionarMesa(mesa: Mesa): void {
    this.router.navigate(['/novo-pedido'], { queryParams: { mesa: mesa.id } });
  }
}
