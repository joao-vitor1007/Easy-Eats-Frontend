import { Injectable, signal } from '@angular/core';

const CHAVE_TEMA = 'easyeats.tema';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  escuro = signal(this.recuperarPreferencia());

  constructor() {
    this.aplicar(this.escuro());
  }

  alternar(): void {
    this.escuro.update((valor) => !valor);
    this.aplicar(this.escuro());
    localStorage.setItem(CHAVE_TEMA, this.escuro() ? 'escuro' : 'claro');
  }

  private aplicar(escuro: boolean): void {
    document.documentElement.setAttribute('data-theme', escuro ? 'escuro' : 'claro');
  }

  private recuperarPreferencia(): boolean {
    const salvo = localStorage.getItem(CHAVE_TEMA);
    if (salvo) {
      return salvo === 'escuro';
    }
    return window.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  }
}
