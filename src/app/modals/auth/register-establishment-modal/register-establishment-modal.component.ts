import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from 'src/app/core/services/profile-store.service';
import { AppProfile } from 'src/app/core/models/profile.model';
import { PhotoService } from 'src/app/core/services/photo.service';
import { AuthApiService } from 'src/app/core/api/auth-api.service';

@Component({
  standalone: false,
  selector: 'app-register-establishment-modal',
  templateUrl: './register-establishment-modal.component.html',
  styleUrls: ['./register-establishment-modal.component.scss'],
})
export class RegisterEstablishmentModalComponent {
  profileImagePreview: string | null = null;

  // Mock “CP -> colonia/municipio”
  inferredColony = '';
  inferredMunicipality = '';

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [
      Validators.required,
      Validators.minLength(8),
      Validators.maxLength(64),
    ]],
    street: ['', [Validators.required]],
    number: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    category: ['', [Validators.required]],
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

  dismiss() { this.modalCtrl.dismiss(); }

  async pickProfileImage() {
    this.profileImagePreview = await this.photo.pickSingleBase64();
  }

  onPostalCodeChange() {
    const cp = this.form.controls.postalCode.value || '';
    if (/^\d{5}$/.test(cp)) {
      // Mock: simula inferencia
      this.inferredColony = 'Colonia (mock)';
      this.inferredMunicipality = 'Municipio (mock)';
    } else {
      this.inferredColony = '';
      this.inferredMunicipality = '';
    }
  }

  get f() { return this.form.controls; }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;

    // Payload que espera FastAPI (snake_case)
    const payload = {
      role: 'establishment',
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
      display_name: String(v.name || '').trim(),
      category: String(v.category || '').trim(),
      street: String(v.street || '').trim(),
      number: String(v.number || '').trim(),
      postal_code: String(v.postalCode || '').trim(),
      colony: this.inferredColony || null,
      municipality: this.inferredMunicipality || null,
      profile_image_base64: this.profileImagePreview,

    };

    // ⚠️ Si aún no capturas email/password en este modal, no puedes registrar de verdad.
    // Solución rápida: agrega email/password al form (te dejo abajo el snippet)
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
        // guardar token real
        this.auth.login(res.access_token);

        // cargar perfil real
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

              gallery: (p.gallery || []).map((g: any) => g.image_url ?? g.imageUrl),
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
