import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ProfileStoreService } from '../../core/services/profile-store.service';
import { AppProfile } from '../../core/models/profile.model';

import { LoginModalComponent } from '../../modals/auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from '../../modals/auth/account-type-modal/account-type-modal.component';
import { EditTextModalComponent } from '../../modals/common/edit-text-modal/edit-text-modal.component';

import { PhotoService } from '../../core/services/photo.service';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  profile$ = this.profileStore.profile$;

  constructor(
    public auth: AuthService,
    private profileStore: ProfileStoreService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private photo: PhotoService,
  ) { }

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

  // helpers UI
  roleLabel(p: AppProfile) {
    return p.role === 'artist' ? 'Artista' : 'Establecimiento';
  }

  categoryOrStyle(p: AppProfile) {
    return p.role === 'artist' ? (p.artisticStyle || 'Sin estilo') : (p.category || 'Sin categoría');
  }

  async editName(p: AppProfile) {
    // regla 30 días
    if (p.lastNameChangeISO) {
      const last = new Date(p.lastNameChangeISO).getTime();
      const diffDays = Math.floor((Date.now() - last) / (1000 * 60 * 60 * 24));
      if (diffDays < 30) {
        const t = await this.toastCtrl.create({
          message: `Solo puedes cambiar el nombre cada 30 días. Faltan ${30 - diffDays} días.`,
          duration: 1600,
          position: 'bottom',
        });
        return t.present();
      }
    }

    const m = await this.modalCtrl.create({
      component: EditTextModalComponent,
      componentProps: {
        title: 'Editar nombre',
        label: 'Nombre',
        placeholder: 'Tu nombre público',
        value: p.displayName,
        minLength: 3,
        multiline: false,
      },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });

    await m.present();
    const { data } = await m.onWillDismiss();
    if (!data?.text) return;

    this.profileStore.patchProfile({
      displayName: data.text,
      lastNameChangeISO: new Date().toISOString(),
    });

    const t = await this.toastCtrl.create({
      message: 'Nombre actualizado.',
      duration: 1000,
      position: 'bottom',
    });
    await t.present();
  }


  async addPhoto(p: AppProfile) {
    const img = 'https://picsum.photos/id/1040/600/600';
    this.profileStore.patchProfile({ gallery: [img, ...(p.gallery || [])] });
  }

  removePhoto(p: AppProfile, idx: number) {
    const next = [...(p.gallery || [])];
    next.splice(idx, 1);
    this.profileStore.patchProfile({ gallery: next });
  }

  async editBio(p: AppProfile) {
    if (p.role !== 'artist') return;

    const m = await this.modalCtrl.create({
      component: EditTextModalComponent,
      componentProps: {
        title: 'Editar descripción',
        label: 'Descripción',
        placeholder: 'Cuéntanos sobre ti',
        value: p.bio || '',
        minLength: 20,
        multiline: true,
      },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });

    await m.present();
    const { data } = await m.onWillDismiss();
    if (!data?.text) return;

    this.profileStore.patchProfile({ bio: data.text });

    const t = await this.toastCtrl.create({
      message: 'Descripción actualizada.',
      duration: 1000,
      position: 'bottom',
    });
    await t.present();
  }

  async editCategoryOrStyle(p: AppProfile) {
    const isArtist = p.role === 'artist';

    const m = await this.modalCtrl.create({
      component: EditTextModalComponent,
      componentProps: {
        title: isArtist ? 'Editar corriente artística' : 'Editar categoría',
        label: isArtist ? 'Corriente artística' : 'Categoría',
        placeholder: isArtist ? 'Ej. Abstracto, Realismo...' : 'Ej. Cafetería, Restaurante...',
        value: isArtist ? (p.artisticStyle || '') : (p.category || ''),
        minLength: 2,
        multiline: false,
      },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });

    await m.present();
    const { data } = await m.onWillDismiss();
    if (!data?.text) return;

    if (isArtist) this.profileStore.patchProfile({ artisticStyle: data.text });
    else this.profileStore.patchProfile({ category: data.text });

    const t = await this.toastCtrl.create({
      message: 'Actualizado.',
      duration: 900,
      position: 'bottom',
    });
    await t.present();
  }

  async changeProfileImage(p: AppProfile) {
    const dataUrl = await this.photo.pickSingleBase64();
    if (!dataUrl) return;
    this.profileStore.patchProfile({ profileImage: dataUrl });
  }

  async addPhotos(p: AppProfile) {
    const imgs = await this.photo.pickMultipleBase64(10);
    if (!imgs.length) return;
    this.profileStore.patchProfile({ gallery: [...imgs, ...(p.gallery || [])] });
  }

}
