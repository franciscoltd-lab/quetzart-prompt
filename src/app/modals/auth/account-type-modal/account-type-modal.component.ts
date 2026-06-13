import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { RegisterArtistModalComponent } from '../register-artist-modal/register-artist-modal.component';
import { RegisterEstablishmentModalComponent } from '../register-establishment-modal/register-establishment-modal.component';
import { RegisterViewerModalComponent } from '../register-viewer-modal/register-viewer-modal.component';
import { AuthApiService } from 'src/app/core/api/auth-api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-account-type-modal',
  templateUrl: './account-type-modal.component.html',
  styleUrls: ['./account-type-modal.component.scss'],
})
export class AccountTypeModalComponent {
  constructor(
    private modalCtrl: ModalController,
    private authApi: AuthApiService,
    private auth: AuthService
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async select(role: 'artist' | 'establishment' | 'viewer') {
    // Cierra selector
    await this.dismiss();

    // Abre registro full screen (sheet)
    const component =
      role === 'artist'
        ? RegisterArtistModalComponent
        : role === 'establishment'
          ? RegisterEstablishmentModalComponent
          : RegisterViewerModalComponent;

    const m = await this.modalCtrl.create({
      component,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });

    await m.present();
  }

  continueAsGuest() {
    this.authApi.continueAsGuest().subscribe({
      next: (res) => {
        this.auth.login(res.access_token);
        this.dismiss();
      },
    });
  }
}
