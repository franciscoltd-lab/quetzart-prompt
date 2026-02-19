import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from '../../../core/services/profile-store.service';
import { AppProfile } from '../../../core/models/profile.model';
import { PhotoService } from 'src/app/core/services/photo.service';

import { AuthApiService } from 'src/app/core/api/auth-api.service';

const CURP_REGEX = /^([A-Z][AEIOUX][A-Z]{2}\d{6}[HM][A-Z]{5}\d{2})$/;
const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

@Component({
  standalone: false,
  selector: 'app-register-artist-modal',
  templateUrl: './register-artist-modal.component.html',
  styleUrls: ['./register-artist-modal.component.scss'],
})
export class RegisterArtistModalComponent {
  // UI placeholders (mock)
  profileImagePreview: string | null = null;
  portfolio: string[] = [];

  form = this.fb.group({
    fullName: ['', [Validators.required, Validators.minLength(3)]],
    artisticStyle: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    age: [null as any, [Validators.required, Validators.min(14), Validators.max(120)]],
    curp: ['', [Validators.required, Validators.pattern(CURP_REGEX)]],
    password: ['', [Validators.required, Validators.pattern(STRONG_PASSWORD_REGEX)]],
    bio: ['', [Validators.required, Validators.minLength(20)]],
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private profileStore: ProfileStoreService,
    private photo: PhotoService,
    private authApi: AuthApiService,

  ) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  // Mock foto perfil
  async pickProfileImage() {
    this.profileImagePreview = await this.photo.pickSingleBase64();
  }
  async addPortfolioImages() {
    const imgs = await this.photo.pickMultipleBase64(10);
    this.portfolio = [...imgs, ...this.portfolio];
  }


  removePortfolio(i: number) {
    this.portfolio.splice(i, 1);
  }

  get f() { return this.form.controls; }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;

    // Payload que espera tu backend (schemas.py)
    const payload = {
      role: 'artist',
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      display_name: String(v.fullName || '').trim(),
      artistic_style: String(v.artisticStyle || '').trim(),
      bio: String(v.bio || '').trim(),
      profile_image_base64: this.profileImagePreview, // dataURL o null
      gallery_base64: [...this.portfolio],            // dataURL[]
    };

    // 1) register -> token
    this.authApi.registerArtist(payload).subscribe({
      next: (res) => {
        // 2) guardar token real
        this.auth.login(res.access_token);

        // 3) cargar perfil real y guardarlo en el store
        this.authApi.me().subscribe({
          next: async (p: any) => {
            const mapped: AppProfile = {
              role: p.role,
              displayName: p.display_name ?? p.displayName,
              profileImage: p.profile_image_url ?? p.profileImage,
              lastNameChangeISO: p.last_name_change_at ?? null,

              artisticStyle: p.artistic_style ?? null,
              bio: p.bio ?? null,

              category: p.category ?? null,
              street: p.street ?? '',
              number: p.number ?? '',
              postalCode: p.postal_code ?? '',
              inferredColony: p.colony ?? '',
              inferredMunicipality: p.municipality ?? '',

              gallery: (p.gallery || []).map((g: any) => ({
                id: g.id,
                url: g.image_url ?? g.imageUrl,
              })),

            };

            this.profileStore.setProfile(mapped);

            const t = await this.toastCtrl.create({
              message: 'Registro completado.',
              duration: 1200,
              position: 'bottom',
            });
            await t.present();

            this.dismiss();
          },
          error: async () => {
            const t = await this.toastCtrl.create({
              message: 'Te registraste, pero falló cargar tu perfil.',
              duration: 1500,
              position: 'bottom',
            });
            await t.present();
            this.dismiss();
          },
        });
      },
      error: async (err) => {
        const msg =
          err?.status === 409 ? 'Ese email ya está registrado.' :
            'No se pudo registrar. Revisa tus datos.';
        const t = await this.toastCtrl.create({
          message: msg,
          duration: 1600,
          position: 'bottom',
        });
        await t.present();
      },
    });
  }


}
