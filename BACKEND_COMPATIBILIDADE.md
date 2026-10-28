# Integração frontend Easy-Eats com o backend Spring Boot

## URL da API

- Desenvolvimento (`src/environments/environment.ts`): `http://localhost:8080`.
- O backend usa a porta padrão `8080` e não declara um context-path.
- Para acessar a partir de outro computador/celular, troque `localhost` pelo IP/host onde o backend está escutando e confirme que a porta está liberada.
- O backend permite CORS para `http://localhost:4200`, que é a origem padrão do Angular.

## Endpoints alinhados

| Recurso | Endpoint do backend | Ajuste feito no frontend |
| --- | --- | --- |
| Autenticação | `POST /auth/login` | Envia `username` e `password` como `application/x-www-form-urlencoded`; armazena o JWT retornado como texto. |
| Produtos | `/produto` | Mapeia `categoriaId` e `flativo` (`S`/`N`) para o modelo usado pela interface. |
| Categorias | `/categorias` | Mapeia o caminho plural e a inativação por `PATCH /categorias/{id}/inativar`. |
| Mesas | `/mesa` | Mapeia `flativo`; a API não expõe ocupação/status da mesa. |
| Pedidos | `/pedido` | Envia `mesaId`, `cliente`, status do enum do backend e `itens` (`produtoId`, `quantidade`) no mesmo POST. |
| Itens de pedido | `/item-pedido/pedido/{pedidoId}` | Serviço alinhado ao DTO `ItemPedidoDto`. |
| Financeiro | Sem endpoint de relatório | O resumo é calculado no frontend a partir de `GET /pedido`, considerando pedidos `FINALIZADO` como concluídos. |

## Limitações do backend fornecido

O backend não expõe endpoints para comandas, clientes, cupons/cashback, adicionais, composição de produto no formato usado pelo frontend, fornecedores, caixa, movimentações financeiras, delivery, empresas ou segmentos. Essas telas não podem funcionar integralmente contra essa API sem implementar os respectivos endpoints ou remover/adaptar os módulos no frontend.

O modelo de pedido exige uma mesa e ao menos um item. O enum de status da API é `ABERTO`, `EM_PREPARO`, `FINALIZADO` e `CANCELADO`; não existem estados separados `PRONTO` e `ENTREGUE`. A interface foi ajustada para avançar de `ABERTO` para `EM_PREPARO` e então `FINALIZADO`.

O DTO de produto não persiste `custo` nem `natureza`, e o backend não aceita adicionais ou customizações de item. A tela de novo pedido foi simplificada para enviar apenas produto e quantidade, com o preço calculado pelo backend.
