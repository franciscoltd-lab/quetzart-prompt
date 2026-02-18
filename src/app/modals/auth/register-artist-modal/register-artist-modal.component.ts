import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';
import { ProfileStoreService } from '../../../core/services/profile-store.service';
import { AppProfile } from '../../../core/models/profile.model';
import { PhotoService } from 'src/app/core/services/photo.service';

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

    const profile: AppProfile = {
      role: 'artist',
      displayName: String(v.fullName || '').trim(),
      profileImage: this.profileImagePreview,
      artisticStyle: String(v.artisticStyle || '').trim(),
      bio: String(v.bio || '').trim(),
      gallery: [...this.portfolio],
      lastNameChangeISO: new Date().toISOString(), // al registrar ya queda “sellado”
    };

    this.profileStore.setProfile(profile);
    this.auth.loginMock('artist');

    const t = await this.toastCtrl.create({
      message: 'Registro completado.',
      duration: 1200,
      position: 'bottom',
    });
    await t.present();

    this.dismiss();
  }

}
