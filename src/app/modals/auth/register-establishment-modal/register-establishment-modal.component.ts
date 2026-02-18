import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from 'src/app/core/services/profile-store.service';
import { AppProfile } from 'src/app/core/models/profile.model';
import { PhotoService } from 'src/app/core/services/photo.service';

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
    street: ['', [Validators.required]],
    number: ['', [Validators.required]],
    postalCode: ['', [Validators.required, Validators.pattern(/^\d{5}$/)]],
    category: ['', [Validators.required]],
    // colonia/municipio se llenan automáticamente (mock)
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private profileStore: ProfileStoreService,
    private photo: PhotoService,
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

    const profile: AppProfile = {
      role: 'establishment',
      displayName: String(v.name || '').trim(),
      profileImage: this.profileImagePreview,
      category: String(v.category || '').trim(),
      street: String(v.street || '').trim(),
      number: String(v.number || '').trim(),
      postalCode: String(v.postalCode || '').trim(),
      inferredColony: this.inferredColony,
      inferredMunicipality: this.inferredMunicipality,
      gallery: [], // después se llena con fotos
      lastNameChangeISO: new Date().toISOString(),
    };

    this.profileStore.setProfile(profile);
    this.auth.loginMock('establishment');

    const t = await this.toastCtrl.create({
      message: 'Registro completado.',
      duration: 1200,
      position: 'bottom',
    });
    await t.present();

    this.dismiss();
  }

}
