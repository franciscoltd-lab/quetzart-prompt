import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-account-type-modal',
  templateUrl: './account-type-modal.component.html',
  styleUrls: ['./account-type-modal.component.scss'],
})
export class AccountTypeModalComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() { this.modalCtrl.dismiss(); }

  select(role: 'artist' | 'establishment') {
    // siguiente subparte: abrir modal de registro correspondiente
    alert(`Seleccionado: ${role}. Siguiente: formulario de registro.`);
  }
}
