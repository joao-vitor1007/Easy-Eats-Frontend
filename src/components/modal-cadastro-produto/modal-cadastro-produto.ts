import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-modal-cadastro-produto',
  imports: [],
  templateUrl: './modal-cadastro-produto.html',
  styleUrl: './modal-cadastro-produto.scss',
})
export class ModalCadastroProduto {
 
  @Input() produto: any = null; 
  @Output() fechar = new EventEmitter<void>();
  @Output() cadastrar = new EventEmitter<any>();

  fecharModal() {
    this.fechar.emit();
  }

  confirmarCadastro() {
    this.cadastrar.emit(this.produto);
    this.fecharModal();
  }
}


