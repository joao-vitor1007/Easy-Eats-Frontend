# Integração frontend Easy-Eats com o backend Spring Boot (Easy-Eats-Api-2)

## URL da API

- `src/environments/environment.ts`: `http://localhost:8080` (o backend não declara context-path).
- O `ng serve` roda na porta **5173** (`angular.json`), que está liberada no CORS do backend junto com 4200.
- Para acessar de outro computador/celular, troque `localhost` pelo IP da máquina do backend.

## Telas e endpoints

| Tela (rota) | Perfis | Endpoints usados |
| --- | --- | --- |
| Login (`/login`) | — | `POST /auth/login` (form-urlencoded, devolve o JWT como texto) |
| Início (`/home`) | todos | `GET /pedido` |
| Mesas (`/mesas`) | todos (cadastro: Admin/Gerente) | `GET/POST/PUT/DELETE /mesa`, `GET /pedido` (ocupação) |
| Novo Pedido (`/novo-pedido`) | todos | `GET /produto`, `GET /categorias`, `GET /mesa`, `POST /pedido` |
| Histórico (`/historico-vendas`) | todos | `GET /pedido`, `PATCH /pedido/{id}/status/{status}` |
| Fila da Cozinha (`/fila`) | todos | `GET /pedido`, `PATCH /pedido/{id}/status/{status}` |
| Tela Cozinha (`/tela-cozinha`) | todos | `GET /pedido`, `PATCH /pedido/{id}/status/{status}` |
| Meu Perfil (`/perfil`) | todos | dados do token JWT |
| Dashboard (`/dashboard`) | Admin/Gerente | `GET /pedido`, `GET /estoques/alertas` |
| Relatório de Pedidos / da Cozinha | Admin/Gerente | `GET /pedido` (cálculo no front) |
| Ingredientes e Estoque (`/controle-estoque`) | Admin/Gerente | `/ingredientes` (CRUD), `/estoques` (POST, PUT mínimo, PATCH `/entrada` e `/saida`) |
| Relatório de Estoque | Admin/Gerente | `GET /ingredientes`, `GET /estoques` |
| Catálogo (`/cadastro-produto`) | Admin/Gerente | `/produto` (CRUD), `GET /categorias` |
| Categorias (`/categorias`) | Admin/Gerente | `GET/POST/PUT /categorias`, `PATCH /categorias/{id}/inativar` |
| Ficha Técnica (`/ficha-tecnica`) | Admin/Gerente | `GET/POST/DELETE /produto-ingrediente`, `GET /produto`, `GET /ingredientes` |
| Financeiro (`/financeiro`) | Admin/Gerente | `GET /pedido` (faturamento = pedidos `FINALIZADO`) |
| Usuários (`/usuarios`) | Admin | `GET/POST /usuarios` |

## Perfis

O backend tem as roles `ADMIN`, `GERENTE` e `FUNCIONARIO` (o token traz `ROLE_*`). O front usa o de maior privilégio:
Administrador (tudo), Gerente (tudo menos Usuários) e Funcionário (mesas, pedidos e cozinha).
O controle por perfil é só no front: a API aceita qualquer usuário autenticado.

## Status do pedido

O front usa o enum do backend: `ABERTO` (Aguardando) → `EM_PREPARO` (baixa o estoque pela ficha técnica) → `FINALIZADO`; `CANCELADO` a qualquer momento antes de finalizar.

## Comportamentos do backend que o front contorna

- `GET /mesa` e `GET /pedido` respondem **204 sem corpo** quando a lista está vazia — tratado como lista vazia.
- Erros tratados pelo `GlobalExceptionHandler` vêm como `{ "erro": "...", "campos": [...] }` e são exibidos na tela.
- Exceções não tratadas (ex.: `RuntimeException`, `ResponseStatusException`) são encaminhadas pelo Spring para `/error`, que exige autenticação, e chegam ao front como **403**. Por isso o front só encerra a sessão em 403 quando o token realmente expirou.
- `abaixoDoMinimo` do estoque é `qtdAtual <= qtdMinima` (inclui "igual ao mínimo").

## Telas sem API (fora das rotas)

Comandas, clientes, fidelidade, cupons/cashback, fornecedores, pedidos de compra, gestão financeira,
cardápio digital, grupos de acesso, configurações, confirmar pedido, delivery, caixa e o painel superadmin
continuam no projeto, mas não estão no menu nem nas rotas até o backend expor os endpoints.

## Observação técnica

O app é Angular 21 **zoneless** (sem zone.js). O estado exibido nas telas fica em `signal()`; alterar
uma propriedade comum dentro de um `subscribe` não atualiza a tela.
