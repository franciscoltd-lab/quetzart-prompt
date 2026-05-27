import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ArtistListModalComponent } from '../../modals/artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from '../../modals/establishment-list-modal/establishment-list-modal.component';
import { ArtistDetailModalComponent } from '../../modals/artist-detail-modal/artist-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../../modals/establishment-detail-modal/establishment-detail-modal.component';
import { PublicApiService } from 'src/app/core/api/public-api.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  artworks: any[] = [];
  establishments: any[] = [];

  constructor(
    public auth: AuthService,
    private modalCtrl: ModalController,
    private publicApi: PublicApiService
  ) { }

  ionViewDidEnter(): void {
    this.loadHomeData();
  }

  private loadHomeData() {
    this.publicApi.listArtists('', 1, 12).subscribe({
      next: (r) => {
        const items = r?.items ?? r ?? [];
        this.artworks = items.map((a: any) => ({
          title: a.display_name ?? a.displayName ?? 'Artista',
          artist: a.artistic_style ?? a.artisticStyle ?? '',
          image_url: a.profile_image_url ?? a.profileImageUrl ?? 'assets/avatar-placeholder.png',
          user_id: a.user_id ?? a.userId,
        }));
      },
      error: (err) => console.error('listArtists error', err),
    });

    this.publicApi.listEstablishments('', 1, 8).subscribe({
      next: (r) => {
        const items = r?.items ?? r ?? [];
        this.establishments = items.map((e: any) => ({
          name: e.display_name ?? e.displayName ?? 'Establecimiento',
          category: e.category ?? '',
          image_url: e.profile_image_url ?? e.profileImageUrl ?? 'assets/avatar-placeholder.png',
          user_id: e.user_id ?? e.userId,
        }));
      },
      error: (err) => console.error('listEstablishments error', err),
    });
  }

  trackByUserId(_: number, item: any) {
    return item.user_id ?? item.id ?? item.name ?? item.title;
  }

  async openArtistsList() {
    const m = await this.modalCtrl.create({
      component: ArtistListModalComponent,
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.6,
    });
    await m.present();
  }

  async openEstablishmentsList() {
    const m = await this.modalCtrl.create({
      component: EstablishmentListModalComponent,
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.6,
    });
    await m.present();
  }

  async openArtist(artist: any) {
    if (!artist?.user_id) return;

    const m = await this.modalCtrl.create({
      component: ArtistDetailModalComponent,
      componentProps: { userId: artist.user_id },
      cssClass: 'qz-large-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await m.present();
  }

  async openEstablishment(est: any) {
    if (!est?.user_id) return;

    const m = await this.modalCtrl.create({
      component: EstablishmentDetailModalComponent,
      componentProps: { userId: est.user_id },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }
}
