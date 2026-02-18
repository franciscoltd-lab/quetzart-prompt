import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';

import { LoginModalComponent } from '../../modals/auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from '../../modals/auth/account-type-modal/account-type-modal.component';

type Role = 'artist' | 'establishment';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  profile = {
    role: 'artist' as Role,
    roleLabel: 'Artista',
    displayName: 'Artista Demo',
    categoryOrStyle: 'Abstracto',
    bio: 'Resumen del artista. (editable)',
    profileImage: 'https://i.pravatar.cc/240?img=12',
    gallery: [
      'https://picsum.photos/id/1025/600/600',
      'https://picsum.photos/id/1035/600/600',
      'https://picsum.photos/id/1062/600/600',
      'https://picsum.photos/id/1011/600/600',
      'https://picsum.photos/id/1015/600/600',
      'https://picsum.photos/id/1020/600/600',
    ],
    lastNameChangeISO: null as string | null,
  };

  constructor(
    public auth: AuthService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController
  ) {}

  async openLogin() {
    const m = await this.modalCtrl.create({
      component: LoginModalComponent,
      breakpoints: [0, 0.45, 0.9],
      initialBreakpoint: 0.45,
    });
    await m.present();
  }

  async openAccountType() {
    const m = await this.modalCtrl.create({
      component: AccountTypeModalComponent,
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }

  logout() {
    this.auth.logout();
  }

  async changeProfileImage() {
    const t = await this.toastCtrl.create({
      message: 'Aquí luego conectamos cámara/galería (Capacitor).',
      duration: 1200,
      position: 'bottom',
    });
    await t.present();
  }

  async editName() {
    // Regla: solo 1 cambio cada 30 días
    if (this.profile.lastNameChangeISO) {
      const last = new Date(this.profile.lastNameChangeISO).getTime();
      const now = Date.now();
      const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        const t = await this.toastCtrl.create({
          message: `Solo puedes cambiar el nombre cada 30 días. Faltan ${30 - diffDays} días.`,
          duration: 1600,
          position: 'bottom',
        });
        return t.present();
      }
    }

    // Por ahora mock: cambia nombre fijo
    this.profile.displayName = this.profile.displayName + ' ✨';
    this.profile.lastNameChangeISO = new Date().toISOString();

    const t = await this.toastCtrl.create({
      message: 'Nombre actualizado (mock).',
      duration: 1200,
      position: 'bottom',
    });
    await t.present();
  }

  async editCategoryOrStyle() {
    this.profile.categoryOrStyle =
      this.profile.role === 'artist' ? 'Contemporáneo' : 'Cafetería';
    const t = await this.toastCtrl.create({
      message: 'Actualizado (mock).',
      duration: 1000,
      position: 'bottom',
    });
    await t.present();
  }

  async editBio() {
    this.profile.bio = 'Descripción actualizada (mock).';
    const t = await this.toastCtrl.create({
      message: 'Descripción actualizada (mock).',
      duration: 1000,
      position: 'bottom',
    });
    await t.present();
  }

  async addPhotos() {
    this.profile.gallery = [
      'https://picsum.photos/id/1040/600/600',
      ...this.profile.gallery,
    ];
    const t = await this.toastCtrl.create({
      message: 'Foto añadida (mock).',
      duration: 900,
      position: 'bottom',
    });
    await t.present();
  }

  async removePhoto(index: number) {
    this.profile.gallery.splice(index, 1);
    const t = await this.toastCtrl.create({
      message: 'Foto eliminada (mock).',
      duration: 900,
      position: 'bottom',
    });
    await t.present();
  }
}
