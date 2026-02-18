import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RegisterArtistModalComponent } from '../register-artist-modal/register-artist-modal.component';
import { RegisterEstablishmentModalComponent } from '../register-establishment-modal/register-establishment-modal.component';

@Component({
  standalone: false,
  selector: 'app-account-type-modal',
  templateUrl: './account-type-modal.component.html',
  styleUrls: ['./account-type-modal.component.scss'],
})
export class AccountTypeModalComponent {
  constructor(private modalCtrl: ModalController) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async select(role: 'artist' | 'establishment') {
    // Cierra selector
    await this.dismiss();

    // Abre registro full screen (sheet)
    const component =
      role === 'artist' ? RegisterArtistModalComponent : RegisterEstablishmentModalComponent;

    const m = await this.modalCtrl.create({
      component,
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });

    await m.present();
  }
}
