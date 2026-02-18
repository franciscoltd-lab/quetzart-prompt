import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';
import { MockDataService } from '../core/services/mock-data.service';
import { ArtistListModalComponent } from '../modals/artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from '../modals/establishment-list-modal/establishment-list-modal.component';
import { ArtworkDetailModalComponent } from '../modals/artwork-detail-modal/artwork-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../modals/establishment-detail-modal/establishment-detail-modal.component';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
})
export class HomePage {
  artworks = this.mock.getRandomArtworks();
  establishments = this.mock.getRandomEstablishments();

  constructor(
    public auth: AuthService,
    private mock: MockDataService,
    private modalCtrl: ModalController
  ) {}

  async openArtistsList() {
    const m = await this.modalCtrl.create({ component: ArtistListModalComponent });
    await m.present();
  }

  async openEstablishmentsList() {
    const m = await this.modalCtrl.create({ component: EstablishmentListModalComponent });
    await m.present();
  }

  async openArtwork(artwork: any) {
    const m = await this.modalCtrl.create({
      component: ArtworkDetailModalComponent,
      componentProps: { artwork }
    });
    await m.present();
  }

  async openEstablishment(est: any) {
    const m = await this.modalCtrl.create({
      component: EstablishmentDetailModalComponent,
      componentProps: { est }
    });
    await m.present();
  }

  openNotifications() {
    // luego conectamos Notifications modal/list
    alert('Notificaciones (UI lista en fase siguiente)');
  }
}
