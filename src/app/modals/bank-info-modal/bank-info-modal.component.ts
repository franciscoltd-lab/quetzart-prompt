import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

@Component({
  standalone: false,
  selector: 'app-bank-info-modal',
  templateUrl: './bank-info-modal.component.html',
})
export class BankInfoModalComponent {
  // Placeholder (luego lo conectamos a backend/config)
  bank = '(definir)';
  account = '(definir)';
  clabe = '(definir)';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async copy(value: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      const t = await this.toastCtrl.create({
        message: `${label} copiado`,
        duration: 1200,
        position: 'bottom',
      });
      await t.present();
    } catch {
      const t = await this.toastCtrl.create({
        message: `No se pudo copiar ${label}`,
        duration: 1400,
        position: 'bottom',
      });
      await t.present();
    }
  }
}
