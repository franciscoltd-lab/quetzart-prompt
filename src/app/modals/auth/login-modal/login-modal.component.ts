import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from '../../../core/services/profile-store.service';
import { AppProfile } from '../../../core/models/profile.model';
import { AuthApiService } from 'src/app/core/api/auth-api.service';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  email = '';
  password = '';
  loading = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private profileStore: ProfileStoreService,
    private authApi: AuthApiService,
  ) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  login() {
    if (!this.email || !this.password) return;

    this.loading = true;

    this.authApi.login(this.email.trim(), this.password).subscribe({
      next: (res) => {
        this.auth.login(res.access_token);

        // Cargar perfil real
        this.authApi.me().subscribe({
          next: (p: any) => {
            // adapta keys del backend -> AppProfile (si hace falta)
            // yo asumo que tu backend devuelve: role, display_name, profile_image_url, etc.
            const mapped: AppProfile = {
              role: p.role,
              displayName: p.display_name ?? p.displayName,
              profileImage: p.profile_image_url ?? p.profileImage,
              lastNameChangeISO: p.last_name_change_at ?? p.lastNameChangeISO ?? null,

              // artist
              bio: p.bio ?? null,
              artisticStyle: p.artistic_style ?? p.artisticStyle ?? null,

              // establishment
              category: p.category ?? null,
              street: p.street ?? '',
              number: p.number ?? '',
              postalCode: p.postal_code ?? '',
              inferredColony: p.colony ?? '',
              inferredMunicipality: p.municipality ?? '',

              // gallery
              gallery: (p.gallery || []).map((g: any) => g.image_url ?? g.imageUrl),
            };

            this.profileStore.setProfile(mapped);
            this.loading = false;
            this.modalCtrl.dismiss();
          },
          error: async () => {
            this.loading = false;
            const t = await this.toastCtrl.create({
              message: 'Entraste, pero no pude cargar tu perfil (/profile/me).',
              duration: 1600,
              position: 'bottom',
            });
            await t.present();
          },
        });
      },
      error: async () => {
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Email o contraseña incorrectos.',
          duration: 1600,
          position: 'bottom',
        });
        await t.present();
      },
    });
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
