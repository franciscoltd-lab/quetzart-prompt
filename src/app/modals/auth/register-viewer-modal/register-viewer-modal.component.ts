import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthApiService } from 'src/app/core/api/auth-api.service';
import { AuthService } from 'src/app/core/services/auth.service';

const STRONG_PASSWORD_REGEX = /^(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/;

@Component({
  standalone: false,
  selector: 'app-register-viewer-modal',
  templateUrl: './register-viewer-modal.component.html',
  styleUrls: ['./register-viewer-modal.component.scss'],
})
export class RegisterViewerModalComponent {
  form = this.fb.group({
    displayName: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.pattern(STRONG_PASSWORD_REGEX)]],
  });

  constructor(
    private fb: FormBuilder,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private authApi: AuthApiService,
    private auth: AuthService
  ) {}

  get f() { return this.form.controls; }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  async submit() {
    this.form.markAllAsTouched();
    if (this.form.invalid) return;

    const v = this.form.value;
    this.authApi.registerViewer({
      role: 'viewer',
      display_name: String(v.displayName || '').trim(),
      email: String(v.email || '').trim(),
      password: String(v.password || ''),
    }).subscribe({
      next: async (res) => {
        this.auth.login(res.access_token);
        const toast = await this.toastCtrl.create({
          message: 'Cuenta creada.',
          duration: 1200,
          position: 'bottom',
        });
        await toast.present();
        this.dismiss();
      },
      error: async (err) => {
        const toast = await this.toastCtrl.create({
          message: err?.status === 409 ? 'Ese email ya esta registrado.' : 'No se pudo crear la cuenta.',
          duration: 1600,
          position: 'bottom',
        });
        await toast.present();
      },
    });
  }
}
