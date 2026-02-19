import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ProfileStoreService } from '../../core/services/profile-store.service';
import { AppProfile } from '../../core/models/profile.model';

import { LoginModalComponent } from '../../modals/auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from '../../modals/auth/account-type-modal/account-type-modal.component';
import { EditTextModalComponent } from '../../modals/common/edit-text-modal/edit-text-modal.component';

import { PhotoService } from '../../core/services/photo.service';
import { AuthApiService } from 'src/app/core/api/auth-api.service';

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
    private authApi: AuthApiService,
  ) {}

  private reloadMe() {
    this.authApi.me().subscribe({
      next: (p: any) => {
        const mapped: AppProfile = {
          role: p.role,
          displayName: p.display_name ?? p.displayName,
          profileImage: p.profile_image_url ?? p.profileImage ?? null,
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
      },
      error: (e) => console.error('me() error', e),
    });
  }

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

  roleLabel(p: AppProfile) {
    return p.role === 'artist' ? 'Artista' : 'Establecimiento';
  }

  categoryOrStyle(p: AppProfile) {
    return p.role === 'artist' ? (p.artisticStyle || 'Sin estilo') : (p.category || 'Sin categoría');
  }

  async editName(p: AppProfile) {
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

    this.authApi.updateMe({ display_name: data.text }).subscribe({
      next: async () => {
        this.reloadMe();
        const t = await this.toastCtrl.create({
          message: 'Nombre actualizado.',
          duration: 1000,
          position: 'bottom',
        });
        await t.present();
      },
      error: async (e) => {
        console.error(e);
        const t = await this.toastCtrl.create({
          message: 'No se pudo actualizar el nombre.',
          duration: 1400,
          position: 'bottom',
        });
        await t.present();
      },
    });
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

    this.authApi.updateMe({ bio: data.text }).subscribe({
      next: async () => {
        this.reloadMe();
        const t = await this.toastCtrl.create({
          message: 'Descripción actualizada.',
          duration: 1000,
          position: 'bottom',
        });
        await t.present();
      },
      error: async (e) => {
        console.error(e);
        const t = await this.toastCtrl.create({
          message: 'No se pudo actualizar la descripción.',
          duration: 1400,
          position: 'bottom',
        });
        await t.present();
      },
    });
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

    const payload = isArtist ? { artistic_style: data.text } : { category: data.text };

    this.authApi.updateMe(payload).subscribe({
      next: async () => {
        this.reloadMe();
        const t = await this.toastCtrl.create({
          message: 'Actualizado.',
          duration: 900,
          position: 'bottom',
        });
        await t.present();
      },
      error: async (e) => {
        console.error(e);
        const t = await this.toastCtrl.create({
          message: 'No se pudo actualizar.',
          duration: 1400,
          position: 'bottom',
        });
        await t.present();
      },
    });
  }

  async changeProfileImage(p: AppProfile) {
    const dataUrl = await this.photo.pickSingleBase64();
    if (!dataUrl) return;

    this.authApi.setProfileImage(dataUrl).subscribe({
      next: () => this.reloadMe(),
      error: (e) => console.error('setProfileImage error', e),
    });
  }

  async addPhotos(p: AppProfile) {
    const imgs = await this.photo.pickMultipleBase64(10);
    if (!imgs.length) return;

    this.authApi.addGallery(imgs).subscribe({
      next: () => this.reloadMe(),
      error: (e) => console.error('addGallery error', e),
    });
  }

  removePhoto(p: AppProfile, idx: number) {
    const item = p.gallery[idx];
    if (!item?.id) return;

    this.authApi.deleteGalleryItem(item.id).subscribe({
      next: () => this.reloadMe(),
      error: (e) => console.error('deleteGalleryItem error', e),
    });
  }
}
