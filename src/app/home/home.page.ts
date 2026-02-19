import { Component, ElementRef, ViewChild } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../core/services/auth.service';

import { PublicApiService } from 'src/app/core/api/public-api.service';

import { ArtistListModalComponent } from '../modals/artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from '../modals/establishment-list-modal/establishment-list-modal.component';
import { ArtworkDetailModalComponent } from '../modals/artwork-detail-modal/artwork-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../modals/establishment-detail-modal/establishment-detail-modal.component';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  artworks: any[] = [];
  establishments: any[] = [];

  // (opcional) si luego quieres un swiper de artistas también
  artists: any[] = [];

  @ViewChild('artSwiper', { static: false }) artSwiper?: ElementRef;
  @ViewChild('estSwiper', { static: false }) estSwiper?: ElementRef;

  constructor(
    public auth: AuthService,
    private publicApi: PublicApiService,
    private modalCtrl: ModalController
  ) {}

  ionViewDidEnter(): void {
    this.loadHome();
  }

  private loadHome() {
    this.publicApi.home(10, 10, 10).subscribe({
      next: (res) => {
        this.artists = res?.artists ?? [];
        this.establishments = res?.establishments ?? [];
        this.artworks = res?.artworks ?? [];

        // inicializa swipers ya con data real
        setTimeout(() => this.initSwipers(), 0);
      },
      error: (err) => {
        console.error('home error', err);
      },
    });
  }

  private initSwipers() {
    const art = this.artSwiper?.nativeElement;
    if (art && !art.swiper) {
      Object.assign(art, {
        slidesPerView: 1.15,
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
      componentProps: { est },
      breakpoints: [0, 0.6, 0.95],
      initialBreakpoint: 0.6,
    });
    await m.present();
  }

  openNotifications() {
    alert('Notificaciones (UI en la siguiente parte)');
  }
}
