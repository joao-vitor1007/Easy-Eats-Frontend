import { Routes } from '@angular/router';
import { Login } from './login/login';
import { AppLayout } from './layout/app-layout';
import { authGuard, loginGuard } from './auth/auth.guard';
import { perfilGuard } from './auth/role.guard';
import { PERFIS_GESTAO } from './auth/auth.service';

/*
 * Apenas telas com endpoints existentes no backend (Easy-Eats-Api-2):
 *   /auth, /usuarios, /mesa, /pedido, /item-pedido, /produto, /preco,
 *   /categorias, /ingredientes, /estoques, /produto-ingrediente.
 *
 * Telas sem API (comandas, clientes, fidelidade, cupons, fornecedores,
 * pedidos de compra, gestão financeira, cardápio digital, grupos de acesso,
 * configurações, confirmar pedido, delivery, caixa e superadmin) continuam
 * no projeto, mas fora das rotas até o backend expor os respectivos endpoints.
 */
export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: Login, canActivate: [loginGuard] },

  {
    path: '',
    component: AppLayout,
    canActivate: [authGuard],
    canActivateChild: [authGuard],
    children: [
      // Todos os perfis
      { path: 'home', title: 'Início', loadComponent: () => import('./home/home').then((m) => m.Home) },
      { path: 'mesas', title: 'Mesas', loadComponent: () => import('./mesas/mesas').then((m) => m.Mesas) },
      {
        path: 'novo-pedido',
        title: 'Novo Pedido',
        loadComponent: () => import('./novo-pedido/novo-pedido').then((m) => m.NovoPedido),
      },
      {
        path: 'historico-vendas',
        title: 'Histórico de Pedidos',
        loadComponent: () =>
          import('./historico-vendas/historico-vendas').then((m) => m.HistoricoVendasComponent),
      },
      {
        path: 'fila',
        title: 'Fila da Cozinha',
        loadComponent: () => import('./fila/component.fila').then((m) => m.ComponentFila),
      },
      {
        path: 'tela-cozinha',
        title: 'Tela Cozinha',
        loadComponent: () => import('./tela-cozinha/tela-cozinha').then((m) => m.TelaCozinha),
      },
      {
        path: 'perfil',
        title: 'Meu Perfil',
        loadComponent: () => import('./perfil-admin/perfilAdmin').then((m) => m.PerfilAdmin),
      },

      // Administrador e Gerente
      {
        path: 'dashboard',
        title: 'Dashboard',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () => import('./dashboard/dashboard').then((m) => m.DashboardComponent),
      },
      {
        path: 'relatorio-pedidos',
        title: 'Relatório de Pedidos',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () =>
          import('./relatorio-pedidos/relatorio-pedidos').then((m) => m.RelatorioPedidos),
      },
      {
        path: 'relatorio-cozinha',
        title: 'Relatório da Cozinha',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () =>
          import('./relatorio-cozinha/relatorio-cozinha').then((m) => m.RelatorioCozinha),
      },
      {
        path: 'controle-estoque',
        title: 'Estoque',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () =>
          import('./controle-estoque/controle-estoque').then((m) => m.ControleEstoque),
      },
      {
        path: 'relatorio-estoque',
        title: 'Relatório de Estoque',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () =>
          import('./relatorio-estoque/relatorio-estoque').then((m) => m.RelatorioEstoque),
      },
      {
        path: 'cadastro-produto',
        title: 'Produtos',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () =>
          import('./cadastro-produto/cadastroProduto').then((m) => m.CadastroProdutoComponent),
      },
      {
        path: 'categorias',
        title: 'Categorias',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () => import('./categorias/categorias').then((m) => m.Categorias),
      },
      {
        path: 'ficha-tecnica',
        title: 'Ficha Técnica',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () => import('./ficha-tecnica/ficha-tecnica').then((m) => m.FichaTecnica),
      },
      {
        path: 'financeiro',
        title: 'Financeiro',
        canActivate: [perfilGuard(PERFIS_GESTAO)],
        loadComponent: () => import('./financeiro/financeiro').then((m) => m.Financeiro),
      },

      // Somente Administrador
      {
        path: 'usuarios',
        title: 'Usuários',
        canActivate: [perfilGuard(['ADMINISTRADOR'])],
        loadComponent: () => import('./usuarios/usuarios').then((m) => m.Usuarios),
      },
    ],
  },

  { path: '**', redirectTo: '/home' },
];
