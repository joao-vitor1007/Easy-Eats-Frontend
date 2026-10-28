import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { Sidebar } from '../../components/sidebar/sidebar';
import { AuthService } from '../auth/auth.service';
import { ThemeService } from '../theme/theme.service';

const CHAVE_SIDEBAR_COLAPSADO = 'easyeats.sidebarColapsado';

interface Notificacao {
  icone: string;
  cor: string;
  titulo: string;
  descricao: string;
  tempo: string;
  lida: boolean;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, Sidebar],
  templateUrl: './app-layout.html',
  styleUrl: './app-layout.scss',
})
export class AppLayout {
  colapsado = signal(localStorage.getItem(CHAVE_SIDEBAR_COLAPSADO) === 'true');
  notificacoesAbertas = signal(false);
  menuMobileAberto = signal(false);

  private readonly notificacoesOperacional: Notificacao[] = [
    {
      icone: 'bi-cart-check',
      cor: 'laranja',
      titulo: 'Novo pedido recebido',
      descricao: 'Mesa 4 — pedido #128 acabou de entrar na fila.',
      tempo: 'há 5 min',
      lida: false,
    },
    {
      icone: 'bi-exclamation-triangle',
      cor: 'vermelho',
      titulo: 'Estoque crítico',
      descricao: '"Batata Congelada" está abaixo do mínimo recomendado.',
      tempo: 'há 22 min',
      lida: false,
    },
    {
      icone: 'bi-cash-coin',
      cor: 'verde',
      titulo: 'Pagamento confirmado',
      descricao: 'Recebido via PIX — R$ 84,50.',
      tempo: 'há 1 h',
      lida: false,
    },
    {
      icone: 'bi-truck',
      cor: 'azul',
      titulo: 'Entrega do fornecedor',
      descricao: 'Distribuidora Boi Forte confirmou entrega para amanhã.',
      tempo: 'ontem',
      lida: true,
    },
  ];

  private readonly notificacoesSuperadmin: Notificacao[] = [
    {
      icone: 'bi-building-add',
      cor: 'azul',
      titulo: 'Nova empresa cadastrada',
      descricao: '"Cafeteria Grão Nobre" se cadastrou no plano Pro.',
      tempo: 'há 12 min',
      lida: false,
    },
    {
      icone: 'bi-exclamation-triangle',
      cor: 'vermelho',
      titulo: 'Pagamento em atraso',
      descricao: 'Pizzaria Bella Napoli está com a fatura vencida há 3 dias.',
      tempo: 'há 40 min',
      lida: false,
    },
    {
      icone: 'bi-life-preserver',
      cor: 'laranja',
      titulo: 'Novo ticket de suporte',
      descricao: 'Burger House Ltda abriu um chamado sobre integração com iFood.',
      tempo: 'há 2 h',
      lida: false,
    },
    {
      icone: 'bi-graph-up-arrow',
      cor: 'verde',
      titulo: 'Meta de MRR atingida',
      descricao: 'A receita recorrente mensal ultrapassou R$ 18.000,00 este mês.',
      tempo: 'ontem',
      lida: true,
    },
  ];

  get notificacoes(): Notificacao[] {
    return this.authService.isSuperadmin() ? this.notificacoesSuperadmin : this.notificacoesOperacional;
  }

  constructor(
    public authService: AuthService,
    public themeService: ThemeService,
    private router: Router,
  ) {
    this.router.events.pipe(filter((evento) => evento instanceof NavigationEnd)).subscribe(() => {
      this.menuMobileAberto.set(false);
    });
  }

  alternarMenuMobile() {
    this.menuMobileAberto.update((valor) => !valor);
  }

  fecharMenuMobile() {
    this.menuMobileAberto.set(false);
  }

  get naoLidas(): number {
    return this.notificacoes.filter((n) => !n.lida).length;
  }

  alternarSidebar() {
    this.colapsado.update((valor) => !valor);
    localStorage.setItem(CHAVE_SIDEBAR_COLAPSADO, String(this.colapsado()));
  }

  alternarNotificacoes() {
    this.notificacoesAbertas.update((v) => !v);
  }

  marcarTodasComoLidas() {
    this.notificacoes.forEach((n) => (n.lida = true));
  }

  get iniciais(): string {
    const nome = this.authService.usuario()?.nome ?? '';
    return nome
      .split(' ')
      .slice(0, 2)
      .map((parte) => parte.charAt(0).toUpperCase())
      .join('');
  }

  irParaPerfil() {
    const role = this.authService.usuario()?.role;
    const rota = role === 'OPERADOR' || role === 'GARCOM' ? '/perfil-garcom' : '/perfil-admin';
    this.router.navigate([rota]);
  }

  sair() {
    this.authService.logout();
    this.router.navigate(['/login']);
  }
}
