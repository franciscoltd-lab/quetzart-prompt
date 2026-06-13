import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ProfileStoreService } from '../../core/services/profile-store.service';
import { AppProfile, GalleryItem } from '../../core/models/profile.model';

import { LoginModalComponent } from '../../modals/auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from '../../modals/auth/account-type-modal/account-type-modal.component';
import { EditTextModalComponent } from '../../modals/common/edit-text-modal/edit-text-modal.component';
import { ArtworkFormModalComponent } from '../../modals/artwork-form-modal/artwork-form-modal.component';

import { PhotoService } from '../../core/services/photo.service';
import { AuthApiService } from 'src/app/core/api/auth-api.service';
import { normalizeImageUrl } from 'src/app/core/utils/image-url';

@Component({
  standalone: false,
  selector: 'app-profile',
  templateUrl: './profile.page.html',
  styleUrls: ['./profile.page.scss'],
})
export class ProfilePage {
  profile$ = this.profileStore.profile$;
  selectedImageUrl: string | null = null;
  selectedImageAlt = 'Imagen ampliada';
  imageZoomed = false;
  selectedArtwork: GalleryItem | null = null;
  selectedArtworkOwner = '';
  selectedArtworkKind = 'Obra';

  constructor(
    public auth: AuthService,
    private profileStore: ProfileStoreService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private photo: PhotoService,
    private authApi: AuthApiService,
  ) {}

  ionViewDidEnter() {
    console.debug('[qz_profile_page_enter]', {
      isLoggedIn: this.auth.isLoggedIn(),
      role: this.auth.getRole(),
      tokenPayload: this.auth.getTokenPayload(),
    });
    if (this.auth.isLoggedIn()) {
      this.reloadMe();
    }
  }

  private reloadMe() {
    console.debug('[qz_profile_reload_me_start]', {
      role: this.auth.getRole(),
      tokenPayload: this.auth.getTokenPayload(),
    });
    this.authApi.me().subscribe({
      next: (p: any) => {
        console.debug('[qz_profile_reload_me_success]', {
          role: p?.role,
          email: p?.email,
          galleryCount: p?.gallery?.length ?? 0,
        });
        const mapped: AppProfile = {
          role: p.role,
          displayName: p.display_name ?? p.displayName,
          profileImage: normalizeImageUrl(p.profile_image_url ?? p.profileImage),
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
            url: normalizeImageUrl(g.image_url ?? g.imageUrl) || 'assets/avatar-placeholder.png',
            title: g.title ?? null,
            technique: g.technique ?? g.tecnica ?? null,
            price: g.price ?? g.precio ?? null,
            size: g.size ?? g.tamano ?? null,
            description: g.description ?? g.caption ?? null,
          })),
        };

        this.profileStore.setProfile(mapped);
      },
      error: (e) => console.error('[qz_profile_reload_me_error]', {
        status: e?.status,
        message: e?.message,
        error: e?.error,
        tokenPayload: this.auth.getTokenPayload(),
      }),
    });
  }

  async openLogin() {
    const m = await this.modalCtrl.create({
      component: LoginModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await m.present();
  }

  async openAccountType() {
    const m = await this.modalCtrl.create({
      component: AccountTypeModalComponent,
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await m.present();
  }

  logout() {
    this.auth.logout();
  }

  roleLabel(p: AppProfile) {
    if (p.role === 'admin') return 'Admin';
    return p.role === 'artist' ? 'Artista' : 'Establecimiento';
  }

  isArtistProfile(p: AppProfile) {
    return p.role === 'artist' || p.role === 'admin';
  }

  categoryOrStyle(p: AppProfile) {
    return this.isArtistProfile(p) ? (p.artisticStyle || 'Sin estilo') : (p.category || 'Sin categoria');
  }

  openImage(url: string | null | undefined, alt = 'Imagen ampliada') {
    if (!url) return;

    this.selectedImageUrl = url;
    this.selectedImageAlt = alt;
    this.imageZoomed = false;
  }

  closeImage() {
    this.selectedImageUrl = null;
    this.imageZoomed = false;
  }

  toggleZoom(event: Event) {
    event.stopPropagation();
    this.imageZoomed = !this.imageZoomed;
  }

  openArtwork(item: GalleryItem, p: AppProfile, index: number) {
    this.selectedArtwork = {
      ...item,
      title: item.title || 'Sin titulo',
      size: item.size || null,
      technique: item.technique || this.defaultTechnique(p),
      price: item.price ?? 'Precio a consultar',
      description: item.description || this.defaultArtworkDescription(p),
    };
    this.selectedArtworkOwner = p.displayName;
    this.selectedArtworkKind = this.isArtistProfile(p) ? 'Obra del portafolio' : 'Foto del establecimiento';
  }

  closeArtwork() {
    this.selectedArtwork = null;
  }

  enlargeSelectedArtwork(event: Event) {
    event.stopPropagation();
    if (!this.selectedArtwork?.url) return;

    this.openImage(this.selectedArtwork.url, this.selectedArtwork.title || 'Imagen ampliada');
  }

  private defaultArtworkDescription(p: AppProfile) {
    if (this.isArtistProfile(p)) {
      return p.bio || `Pieza del portafolio de ${p.displayName}.`;
    }

    const location = [p.inferredColony, p.inferredMunicipality].filter(Boolean).join(', ');
    return location ? `Imagen del espacio en ${location}.` : `Imagen del espacio ${p.displayName}.`;
  }

  private defaultTechnique(p: AppProfile) {
    return this.isArtistProfile(p) ? (p.artisticStyle || 'Tecnica no especificada') : (p.category || 'Espacio');
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
    if (!this.isArtistProfile(p)) return;

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
    const isArtist = this.isArtistProfile(p);

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

  async openArtworkForm(p: AppProfile, artwork: GalleryItem | null = null) {
    if (!this.isArtistProfile(p)) return;

    const m = await this.modalCtrl.create({
      component: ArtworkFormModalComponent,
      componentProps: { artwork },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });

    await m.present();
    const { data } = await m.onWillDismiss();
    if (data?.saved) {
      console.debug('[qz_profile_artwork_modal_saved]', {
        editing: !!artwork,
        artworkId: artwork?.id ?? null,
        tokenPayload: this.auth.getTokenPayload(),
      });
      this.reloadMe();
      await this.showToast(artwork ? 'Obra actualizada.' : 'Obra agregada.');
    }
  }

  private async showToast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1300,
      position: 'bottom',
    });
    await t.present();
  }

  removePhoto(p: AppProfile, idx: number) {
    const item = p.gallery[idx];
    if (!item?.id) return;

    const request$ = this.isArtistProfile(p)
      ? this.authApi.deleteArtwork(item.id)
      : this.authApi.deleteGalleryItem(item.id);

    request$.subscribe({
      next: () => this.reloadMe(),
      error: (e) => console.error('deleteGalleryItem error', e),
    });
  }
}


