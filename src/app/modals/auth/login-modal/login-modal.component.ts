import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from '../../../core/services/profile-store.service';
import { AppProfile } from '../../../core/models/profile.model';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  email = '';
  password = '';

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private profileStore: ProfileStoreService
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  loginAsArtist() {
    this.auth.loginMock('artist');

    // Si no hay perfil guardado, crea uno mínimo
    if (!this.profileStore.snapshot) {
      const profile: AppProfile = {
        role: 'artist',
        displayName: 'Artista',
        profileImage: null,
        artisticStyle: 'Abstracto',
        bio: 'Bio del artista (mock).',
        gallery: [],
        lastNameChangeISO: null,
      };
      this.profileStore.setProfile(profile);
    }

    this.dismiss();
  }

  loginAsEstablishment() {
    this.auth.loginMock('establishment');

    // Si no hay perfil guardado, crea uno mínimo
    if (!this.profileStore.snapshot) {
      const profile: AppProfile = {
        role: 'establishment',
        displayName: 'Establecimiento',
        profileImage: null,
        category: 'Cafetería',
        street: '',
        number: '',
        postalCode: '',
        inferredColony: '',
        inferredMunicipality: '',
        gallery: [],
        lastNameChangeISO: null,
      };
      this.profileStore.setProfile(profile);
    }

    this.dismiss();
  }

  async forgotPassword() {
    const t = await this.toastCtrl.create({
      message: 'Recuperación de contraseña (pendiente backend).',
      duration: 1200,
      position: 'bottom',
    });
    await t.present();
  }
}
