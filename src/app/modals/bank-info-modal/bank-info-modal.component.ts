import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { BankInfoService, BankInfo } from '../../core/services/bank-info.service';
import { firstValueFrom } from 'rxjs';

@Component({
  standalone: false,
  selector: 'app-bank-info-modal',
  templateUrl: './bank-info-modal.component.html',
})
export class BankInfoModalComponent {
  bank = '';
  account = '';
  clabe = '';
  loading = true;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private bankInfoSvc: BankInfoService
  ) {}

  async ionViewWillEnter() {
    await this.load();
  }

  private async load() {
    this.loading = true;
    try {
      const info: BankInfo = await firstValueFrom(this.bankInfoSvc.getBankInfo());
      this.bank = info.bank;
      this.account = info.account;
      this.clabe = info.clabe;
    } catch {
      const t = await this.toastCtrl.create({
        message: 'No se pudo cargar la info bancaria',
        duration: 1500,
        position: 'bottom',
      });
      await t.present();
    } finally {
      this.loading = false;
    }
  }

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
