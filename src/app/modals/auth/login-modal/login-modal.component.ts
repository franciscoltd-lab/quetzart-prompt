import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from '../../../core/services/profile-store.service';
import { AppProfile } from '../../../core/models/profile.model';
import { AuthApiService } from 'src/app/core/api/auth-api.service';
import { normalizeImageUrl } from 'src/app/core/utils/image-url';
import { AccountTypeModalComponent } from '../account-type-modal/account-type-modal.component';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
  styleUrls: ['./login-modal.component.scss'],
})
export class LoginModalComponent {
  email = '';
  password = '';
  resetCode = '';
  newPassword = '';
  resetStep: 'login' | 'email' | 'code' | 'password' = 'login';
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

  async openAccountType() {
    const m = await this.modalCtrl.create({
      component: AccountTypeModalComponent,
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
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
              profileImage: normalizeImageUrl(p.profile_image_url ?? p.profileImage),
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
              gallery: (p.gallery || []).map((g: any) => ({
                id: g.id,
                url: normalizeImageUrl(g.image_url ?? g.imageUrl) || 'assets/avatar-placeholder.png',
                title: g.title ?? null,
                size: g.size ?? g.tamano ?? null,
                technique: g.technique ?? g.tecnica ?? null,
                price: g.price ?? g.precio ?? null,
                description: g.description ?? g.caption ?? null,
              })),
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

  startPasswordReset() {
    this.resetStep = 'email';
    this.password = '';
    this.resetCode = '';
    this.newPassword = '';
  }

  backToLogin() {
    this.resetStep = 'login';
    this.resetCode = '';
    this.newPassword = '';
  }

  requestPasswordReset() {
    if (!this.email) return;

    this.loading = true;
    this.authApi.requestPasswordReset(this.email.trim()).subscribe({
      next: async () => {
        this.loading = false;
        this.resetStep = 'code';
        const t = await this.toastCtrl.create({
          message: 'Si el correo existe, enviamos un codigo de recuperacion.',
          duration: 1800,
          position: 'bottom',
        });
        await t.present();
      },
      error: async () => {
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'No pude enviar el codigo. Intenta de nuevo.',
          duration: 1800,
          position: 'bottom',
        });
        await t.present();
      },
    });
  }

  verifyPasswordResetCode() {
    if (!this.email || !this.resetCode) return;

    this.loading = true;
    this.authApi.verifyPasswordResetCode(this.email.trim(), this.resetCode.trim()).subscribe({
      next: async () => {
        this.loading = false;
        this.resetStep = 'password';
        const t = await this.toastCtrl.create({
          message: 'Codigo validado. Escribe tu nueva contrasena.',
          duration: 1400,
          position: 'bottom',
        });
        await t.present();
      },
      error: async () => {
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'Codigo invalido o expirado.',
          duration: 1600,
          position: 'bottom',
        });
        await t.present();
      },
    });
  }

  confirmPasswordReset() {
    if (!this.email || !this.resetCode || !this.newPassword) return;

    this.loading = true;
    this.authApi.confirmPasswordReset(this.email.trim(), this.resetCode.trim(), this.newPassword).subscribe({
      next: async () => {
        this.loading = false;
        this.password = '';
        this.newPassword = '';
        this.resetCode = '';
        this.resetStep = 'login';
        const t = await this.toastCtrl.create({
          message: 'Contrasena actualizada. Ya puedes iniciar sesion.',
          duration: 1800,
          position: 'bottom',
        });
        await t.present();
      },
      error: async () => {
        this.loading = false;
        const t = await this.toastCtrl.create({
          message: 'No pude actualizar la contrasena. Revisa el codigo.',
          duration: 1800,
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
