import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ArtistListModalComponent } from '../../modals/artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from '../../modals/establishment-list-modal/establishment-list-modal.component';
import { ArtworkDetailModalComponent } from '../../modals/artwork-detail-modal/artwork-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../../modals/establishment-detail-modal/establishment-detail-modal.component';
import { PublicApiService } from 'src/app/core/api/public-api.service';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  // ahora vienen del API
  artworks: any[] = [];          // si aún no hay endpoint, lo dejamos vacío o mock temporal
  establishments: any[] = [];

  @ViewChild('artSwiper', { static: false }) artSwiper?: ElementRef;
  @ViewChild('estSwiper', { static: false }) estSwiper?: ElementRef;

  constructor(
    public auth: AuthService,
    private modalCtrl: ModalController,
    private publicApi: PublicApiService
  ) { }

  ionViewDidEnter(): void {
    this.initSwipers();
    this.loadHomeData();
  }

  private loadHomeData() {
    // Artistas para el swiper “Artistas”
    this.publicApi.listArtists('', 1, 10).subscribe({
      next: (r) => {
        const items = r?.items ?? r ?? [];
        this.artworks = items.map((a: any) => ({
          title: a.display_name ?? a.displayName ?? 'Artista',
          artist: a.artistic_style ?? a.artisticStyle ?? '',
          price: '', // si no aplica, déjalo vacío
          image_url: a.profile_image_url ?? a.profileImageUrl ?? 'assets/avatar-placeholder.png',
          user_id: a.user_id ?? a.userId,
        }));
      },
      error: (err) => console.error('listArtists error', err),
    });

    // Establecimientos para el swiper “Establecimientos”
    this.publicApi.listEstablishments('', 1, 10).subscribe({
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


  private initSwipers() {
    const art = this.artSwiper?.nativeElement;
    if (art && !art.swiper) {
      Object.assign(art, {
        slidesPerView: 1.05,
        spaceBetween: 14,
        pagination: { clickable: true },
        speed: 450,
        observer: true,
        observeParents: true,
      });
      art.initialize();
    }

    const est = this.estSwiper?.nativeElement;
    if (est && !est.swiper) {
      Object.assign(est, {
        slidesPerView: 1.05,
        spaceBetween: 14,
        speed: 450,
        observer: true,
        observeParents: true,
      });
      est.initialize();
    }
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

  async openArtwork(artwork: any) {
    // ahora “artwork” realmente es “artist card”
    // lo correcto del plan: abrir PERFIL público del artista
    // por ahora lo mandas a tu modal de detalle (luego lo convertimos a perfil público real)
    const m = await this.modalCtrl.create({
      component: ArtworkDetailModalComponent,
      componentProps: { artwork },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }

  async openEstablishment(est: any) {
    const m = await this.modalCtrl.create({
      component: EstablishmentDetailModalComponent,
      componentProps: { userId: est.user_id }, // <-- NO est completo
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }

  openNotifications() {
    alert('Notificaciones (UI en la siguiente parte)');
  }
}
