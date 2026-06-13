import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { AuthApiService } from '../../core/api/auth-api.service';
import { GalleryItem } from '../../core/models/profile.model';
import { PhotoService } from '../../core/services/photo.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-artwork-form-modal',
  templateUrl: './artwork-form-modal.component.html',
  styleUrls: ['./artwork-form-modal.component.scss'],
})
export class ArtworkFormModalComponent {
  @Input() artwork: GalleryItem | null = null;

  imagePreview: string | null = null;
  form = {
    title: '',
    size: '',
    price: null as number | null,
    description: '',
    image_base64: '',
  };
  saving = false;

  constructor(
    private modalCtrl: ModalController,
    private toastCtrl: ToastController,
    private authApi: AuthApiService,
    private photo: PhotoService,
    private auth: AuthService,
  ) {}

  ionViewWillEnter() {
    if (!this.artwork) return;

    this.imagePreview = this.artwork.url;
    this.form = {
      title: this.artwork.title || '',
      size: this.artwork.size || '',
      price: this.artwork.price === null || this.artwork.price === undefined ? null : Number(this.artwork.price),
      description: this.artwork.description || '',
      image_base64: '',
    };
  }

  get isEditing() {
    return Boolean(this.artwork?.id);
  }

  dismiss() {
    this.modalCtrl.dismiss(null);
  }

  async pickImage() {
    const dataUrl = await this.photo.pickSingleBase64();
    if (!dataUrl) return;

    this.form.image_base64 = dataUrl;
    this.imagePreview = dataUrl;
  }

  save(): void {
    const title = this.form.title.trim();
    if (!title) {
      void this.showToast('Agrega el nombre de la obra.');
      return;
    }

    if (!this.isEditing && !this.form.image_base64) {
      void this.showToast('Agrega una imagen de la obra.');
      return;
    }

    const payload: any = {
      title,
      size: this.form.size.trim() || null,
      price: this.form.price === null || this.form.price === undefined || this.form.price === ('' as any)
        ? null
        : Number(this.form.price),
      description: this.form.description.trim() || null,
    };

    if (this.form.image_base64) payload.image_base64 = this.form.image_base64;

    this.saving = true;
    console.debug('[qz_artwork_form_save_start]', {
      isEditing: this.isEditing,
      artworkId: this.artwork?.id ?? null,
      fields: Object.keys(payload),
      hasDescription: payload.description !== null,
      hasImage: !!payload.image_base64,
      tokenPayload: this.auth.getTokenPayload(),
    });
    const request$ = this.isEditing && this.artwork
      ? this.authApi.updateArtwork(this.artwork.id, payload)
      : this.authApi.createArtwork(payload);

    request$.subscribe({
      next: (res) => {
        console.debug('[qz_artwork_form_save_success]', {
          isEditing: this.isEditing,
          artworkId: res?.id ?? this.artwork?.id ?? null,
          tokenPayload: this.auth.getTokenPayload(),
        });
        this.modalCtrl.dismiss({ saved: true });
      },
      error: async (e) => {
        console.error('[qz_artwork_form_save_error]', {
          status: e?.status,
          message: e?.message,
          error: e?.error,
          tokenPayload: this.auth.getTokenPayload(),
        });
        this.saving = false;
        await this.showToast('No se pudo guardar la obra.');
      },
    });
  }

  private async showToast(message: string) {
    const t = await this.toastCtrl.create({
      message,
      duration: 1300,
      position: 'bottom',
    });
    await t.present();
  }
}
