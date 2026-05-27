import { Component, Input } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { BankInfoModalComponent } from '../bank-info-modal/bank-info-modal.component';

@Component({
  standalone: false,
  selector: 'app-artwork-detail-modal',
  templateUrl: './artwork-detail-modal.component.html',
  styleUrls: ['./artwork-detail-modal.component.scss'],
})
export class ArtworkDetailModalComponent {
  @Input() artwork: any;
  imageZoomed = false;

  constructor(private modalCtrl: ModalController) {}

  dismiss() { this.modalCtrl.dismiss(); }

  toggleZoom(event: Event) {
    event.stopPropagation();
    this.imageZoomed = !this.imageZoomed;
  }

  async openBankInfo() {
    const m = await this.modalCtrl.create({ component: BankInfoModalComponent });
    await m.present();
  }
}
