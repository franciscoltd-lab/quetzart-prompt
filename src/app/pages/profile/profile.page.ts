import { Component } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ProfileStoreService } from '../../core/services/profile-store.service';
import { AppProfile, GalleryItem } from '../../core/models/profile.model';

import { LoginModalComponent } from '../../modals/auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from '../../modals/auth/account-type-modal/account-type-modal.component';
import { EditTextModalComponent } from '../../modals/common/edit-text-modal/edit-text-modal.component';

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
  editingArtworkId: number | null = null;
  artworkImagePreview: string | null = null;
  artworkForm = {
    title: '',
    size: '',
    price: null as number | null,
    description: '',
    image_base64: '',
  };

  constructor(
    public auth: AuthService,
    private profileStore: ProfileStoreService,
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private photo: PhotoService,
    private authApi: AuthApiService,
  ) {}

  ionViewDidEnter() {
    if (this.auth.isLoggedIn()) {
      this.reloadMe();
    }
  }

  private reloadMe() {
    this.authApi.me().subscribe({
      next: (p: any) => {
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
      error: (e) => console.error('me() error', e),
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
    this.selectedArtworkKind = p.role === 'artist' ? 'Obra del portafolio' : 'Foto del establecimiento';
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
    if (p.role === 'artist') {
      return p.bio || `Pieza del portafolio de ${p.displayName}.`;
    }

    const location = [p.inferredColony, p.inferredMunicipality].filter(Boolean).join(', ');
    return location ? `Imagen del espacio en ${location}.` : `Imagen del espacio ${p.displayName}.`;
  }

  private defaultTechnique(p: AppProfile) {
    return p.role === 'artist' ? (p.artisticStyle || 'Tecnica no especificada') : (p.category || 'Espacio');
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

  async pickArtworkImage() {
    const dataUrl = await this.photo.pickSingleBase64();
    if (!dataUrl) return;

    this.artworkForm.image_base64 = dataUrl;
    this.artworkImagePreview = dataUrl;
  }

  editArtwork(item: GalleryItem) {
    this.editingArtworkId = item.id;
    this.artworkImagePreview = item.url;
    this.artworkForm = {
      title: item.title || '',
      size: item.size || '',
      price: item.price === null || item.price === undefined ? null : Number(item.price),
      description: item.description || '',
      image_base64: '',
    };
  }

  cancelArtworkEdit() {
    this.resetArtworkForm();
  }

  async saveArtwork(p: AppProfile) {
    if (p.role !== 'artist') return;

    const title = this.artworkForm.title.trim();
    if (!title) {
      return this.showToast('Agrega el nombre de la obra.');
    }

    if (!this.editingArtworkId && !this.artworkForm.image_base64) {
      return this.showToast('Agrega una imagen de la obra.');
    }

    const payload: any = {
      title,
      size: this.artworkForm.size.trim() || null,
      price: this.artworkForm.price === null || this.artworkForm.price === undefined || this.artworkForm.price === ('' as any)
        ? null
        : Number(this.artworkForm.price),
      description: this.artworkForm.description.trim() || null,
    };

    if (this.artworkForm.image_base64) {
      payload.image_base64 = this.artworkForm.image_base64;
    }

    const wasEditing = Boolean(this.editingArtworkId);
    const request$ = this.editingArtworkId
      ? this.authApi.updateArtwork(this.editingArtworkId, payload)
      : this.authApi.createArtwork(payload);

    request$.subscribe({
      next: async () => {
        this.resetArtworkForm();
        this.reloadMe();
        await this.showToast(wasEditing ? 'Obra actualizada.' : 'Obra agregada.');
      },
      error: async (e) => {
        console.error('saveArtwork error', e);
        await this.showToast('No se pudo guardar la obra.');
      },
    });
  }

  private resetArtworkForm() {
    this.editingArtworkId = null;
    this.artworkImagePreview = null;
    this.artworkForm = {
      title: '',
      size: '',
      price: null,
      description: '',
      image_base64: '',
    };
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

    const request$ = p.role === 'artist'
      ? this.authApi.deleteArtwork(item.id)
      : this.authApi.deleteGalleryItem(item.id);

    request$.subscribe({
      next: () => this.reloadMe(),
      error: (e) => console.error('deleteGalleryItem error', e),
    });
  }
}
