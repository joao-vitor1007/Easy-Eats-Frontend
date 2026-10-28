import { Component } from '@angular/core';
import { StatusPedidoEnum } from '../enum/pedidosEnum';

interface Pedido {
  id: string;
  cliente: string;
  itens: { nome: string; preco: number }[];
  total: number;
  status: StatusPedidoEnum;
}

@Component({
  selector: 'app-fila',
  standalone: true,
  templateUrl: './component.fila.html',
  styleUrls: ['./component.fila.scss'],
  imports: [],
})
export class ComponentFila {
  public readonly statusEnum = StatusPedidoEnum;

  public activeOrders: Pedido[] = [
    {
      id: '001',
      cliente: 'João',
      itens: [
        { nome: 'Hambúrguer Clássico x2', preco: 44.0 },
        { nome: 'Batata Frita x1', preco: 12.0 },
        { nome: 'Coca-Cola x2', preco: 14.0 },
      ],
      total: 70.0,
      status: StatusPedidoEnum.PREPARANDO,
    },
    {
      id: '002',
      cliente: 'Maria',
      itens: [
        { nome: 'X-Bacon x1', preco: 28.0 },
        { nome: 'Onion Rings x1', preco: 14.0 },
      ],
      total: 42.0,
      status: StatusPedidoEnum.AGUARDANDO,
    },
  ];

  public readyOrders: Pedido[] = [];

  get totalAguardando(): number {
    return this.activeOrders.filter((p) => p.status === StatusPedidoEnum.AGUARDANDO).length;
  }

  get totalPreparando(): number {
    return this.activeOrders.filter((p) => p.status === StatusPedidoEnum.PREPARANDO).length;
  }

  mudarStatus(id: string, novoStatus: StatusPedidoEnum) {
    const index = this.activeOrders.findIndex((p) => p.id === id);

    if (index !== -1) {
      this.activeOrders[index].status = novoStatus;

      if (novoStatus === StatusPedidoEnum.PRONTO) {
        const pedidoPronto = this.activeOrders.splice(index, 1)[0];

        this.readyOrders.push(pedidoPronto);
      }
    }
  }
}
