import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';

import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from 'src/app/core/services/profile-store.service';
import { AppProfile } from 'src/app/core/models/profile.model';
import { PhotoService } from 'src/app/core/services/photo.service';
import { AuthApiService } from 'src/app/core/api/auth-api.service';

import {
  GeoApiService,
  PostalCodeInfo,
} from 'src/app/core/api/geo-api.service';

@Component({
  standalone: false,
  selector: 'app-register-establishment-modal',
  templateUrl: './register-establishment-modal.component.html',
  styleUrls: ['./register-establishment-modal.component.scss'],
})
export class RegisterEstablishmentModalComponent {
  profileImagePreview: string | null = null;

  inferredColony = '';
  inferredMunicipality = '';
  inferredState = '';
  colonies: string[] = [];

  loadingCp = false;
  cpError: string | null = null;

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: [
      '',
      [Validators.required, Validators.minLength(8), Validators.maxLength(64)],
    ],
    street: ['', [Validators.required]],
    number: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    category: ['', [Validators.required]],
    colony: [''],  // 👈 nuevo
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private profileStore: ProfileStoreService,
    private photo: PhotoService,
    private authApi: AuthApiService,
    private geoApi: GeoApiService
  ) { }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async pickProfileImage() {
    this.profileImagePreview = await this.photo.pickSingleBase64();
  }

  get f() {
    return this.form.controls;
  }

  onPostalCodeChange() {
    const cp = this.form.controls.postalCode.value || '';

    this.colonies = [];
    this.form.patchValue({ colony: '' });
    this.inferredMunicipality = '';
    this.inferredState = '';
    this.cpError = null;

    if (!/^\d{5}$/.test(cp)) return;

    this.loadingCp = true;

    this.geoApi.getPostalCodeInfo(cp).subscribe({
      next: (info) => {
        this.loadingCp = false;
        this.colonies = info.colonies || [];
        this.inferredMunicipality = info.municipality;
        this.inferredState = info.state || '';

        if (this.colonies.length === 1) {
          this.form.patchValue({ colony: this.colonies[0] });
        }
      },
      error: (err) => {
        this.loadingCp = false;
        this.colonies = [];
        this.form.patchValue({ colony: '' });
        this.inferredMunicipality = '';
        this.inferredState = '';

        if (err?.status === 404) {
          this.cpError = 'Código postal no encontrado.';
        } else if (err?.status === 0) {
          this.cpError = 'No se pudo conectar al servicio de SEPOMEX.';
        } else {
          this.cpError = 'Error al consultar el código postal.';
        }
      },
    });
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;

    const payload = {
      role: 'establishment',
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      display_name: String(v.name || '').trim(),
      category: String(v.category || '').trim(),
      street: String(v.street || '').trim(),
      number: String(v.number || '').trim(),
      postal_code: String(v.postalCode || '').trim(),
      colony: v.colony || null,                          // 👈 de form
      municipality: this.inferredMunicipality || null,   // sigue viniendo del CP
      profile_image_base64: this.profileImagePreview,
    };

    if (!payload.email || !payload.password) {
      const t = await this.toastCtrl.create({
        message: 'Falta email y contraseña en el registro.',
        duration: 1600,
        position: 'bottom',
      });
      await t.present();
      return;
    }

    this.authApi.registerEstablishment(payload).subscribe({
      next: (res) => {
        // guardar token
        this.auth.login(res.access_token);

        // cargar perfil
        this.authApi.me().subscribe({
          next: async (p: any) => {
            const mapped: AppProfile = {
              role: p.role,
              displayName: p.display_name ?? p.displayName,
              profileImage: p.profile_image_url ?? p.profileImage,
              lastNameChangeISO: p.last_name_change_at ?? null,

              // artist (no aplica)
              artisticStyle: p.artistic_style ?? null,
              bio: p.bio ?? null,

              // establishment
              category: p.category ?? null,
              street: p.street ?? '',
              number: p.number ?? '',
              postalCode: p.postal_code ?? '',
              inferredColony: p.colony ?? '',
              inferredMunicipality: p.municipality ?? '',

              gallery: (p.gallery || []).map(
                (g: any) => g.image_url ?? g.imageUrl
              ),
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
          err?.status === 409
            ? 'Ese email ya está registrado.'
            : 'No se pudo registrar. Revisa tus datos.';
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