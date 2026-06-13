import { Component, Input, OnInit } from '@angular/core';
import { AlertController, ModalController, ToastController } from '@ionic/angular';
import { BankInfoModalComponent } from '../bank-info-modal/bank-info-modal.component';
import { AccountTypeModalComponent } from '../auth/account-type-modal/account-type-modal.component';
import { AuthApiService } from 'src/app/core/api/auth-api.service';
import { SocialApiService } from 'src/app/core/api/social-api.service';
import { AuthService } from 'src/app/core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-artwork-detail-modal',
  templateUrl: './artwork-detail-modal.component.html',
  styleUrls: ['./artwork-detail-modal.component.scss'],
})
export class ArtworkDetailModalComponent {
  @Input() artwork: any;
  imageZoomed = false;
  isFavorite = false;
  conversationId?: number;

  constructor(
    private modalCtrl: ModalController,
    private alertCtrl: AlertController,
    private toastCtrl: ToastController,
    private auth: AuthService,
    private authApi: AuthApiService,
    private socialApi: SocialApiService
  ) {}

  ngOnInit() {
    if (!this.artworkId || !this.auth.isLoggedIn()) return;
    this.socialApi.favoriteStatus(this.artworkId).subscribe({
      next: (status) => {
        this.isFavorite = !!status?.is_favorite;
        this.conversationId = status?.conversation_id;
      },
    });
  }

  get artworkId(): number {
    return Number(this.artwork?.id ?? this.artwork?.gallery_id ?? 0);
  }

  dismiss() { this.modalCtrl.dismiss(); }

  toggleZoom(event: Event) {
    event.stopPropagation();
    this.imageZoomed = !this.imageZoomed;
  }

  async openBankInfo() {
    if (this.artworkId && this.auth.isLoggedIn()) {
      this.socialApi.createPurchaseIntent(this.artworkId).subscribe();
    }
    const m = await this.modalCtrl.create({ component: BankInfoModalComponent });
    await m.present();
  }

  async toggleFavorite() {
    if (!this.artworkId) return;

    if (!this.auth.isLoggedIn()) {
      await this.promptIdentityForFavorite();
      return;
    }

    const request = this.isFavorite
      ? this.socialApi.removeFavorite(this.artworkId)
      : this.socialApi.addFavorite(this.artworkId);

    request.subscribe({
      next: async (status) => {
        this.isFavorite = !!status?.is_favorite;
        this.conversationId = status?.conversation_id;
        const isEstablishment = this.auth.getRole() === 'establishment';
        const message = this.isFavorite && isEstablishment
          ? 'Favorito guardado. El artista fue notificado y el chat esta disponible.'
          : this.isFavorite
            ? 'Favorito guardado.'
            : 'Favorito eliminado.';
        const toast = await this.toastCtrl.create({ message, duration: 1800, position: 'bottom' });
        await toast.present();
      },
    });
  }

  async shareArtwork() {
    const url = `${location.origin}/tabs/home?artwork=${this.artworkId}`;
    const text = this.artwork?.title || 'Obra en Quetzart';

    if (navigator.share) {
      await navigator.share({ title: text, text, url });
      return;
    }

    await navigator.clipboard?.writeText(url);
    const toast = await this.toastCtrl.create({
      message: 'Vinculo copiado.',
      duration: 1200,
      position: 'bottom',
    });
    await toast.present();
  }

  private async promptIdentityForFavorite() {
    const alert = await this.alertCtrl.create({
      header: 'Guardar favorito',
      message: 'Crea una cuenta o continua como invitado para guardar esta obra.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Registrarme',
          handler: () => {
            this.openAccountTypeModal();
          },
        },
        {
          text: 'Invitado',
          handler: () => {
            this.authApi.continueAsGuest().subscribe({
              next: (res) => {
                this.auth.login(res.access_token);
                this.toggleFavorite();
              },
            });
          },
        },
      ],
    });
    await alert.present();
  }

  private async openAccountTypeModal() {
    const m = await this.modalCtrl.create({
      component: AccountTypeModalComponent,
      breakpoints: [0, 0.7],
      initialBreakpoint: 0.7,
    });
    await m.present();
  }
}
