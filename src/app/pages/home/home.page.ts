import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../core/services/auth.service';
import { ArtistListModalComponent } from '../../modals/artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from '../../modals/establishment-list-modal/establishment-list-modal.component';
import { ArtistDetailModalComponent } from '../../modals/artist-detail-modal/artist-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../../modals/establishment-detail-modal/establishment-detail-modal.component';
import { ArtworkDetailModalComponent } from '../../modals/artwork-detail-modal/artwork-detail-modal.component';
import { SearchModalComponent } from '../../modals/search-modal/search-modal.component';
import { PublicApiService } from 'src/app/core/api/public-api.service';
import { normalizeImageUrl } from 'src/app/core/utils/image-url';

@Component({
  standalone: false,
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage {
  artists: any[] = [];
  featuredEvents: any[] = [];
  featuredArtworks: any[] = [];
  activeFeaturedIndex = 0;
  establishments: any[] = [];
  private dragState?: {
    el: HTMLElement;
    pointerId: number;
    startX: number;
    scrollLeft: number;
    dragged: boolean;
  };
  private suppressNextClick = false;

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
        this.artists = items.map((a: any) => ({
          title: a.display_name ?? a.displayName ?? 'Artista',
          artist: a.artistic_style ?? a.artisticStyle ?? '',
          image_url: normalizeImageUrl(a.profile_image_url ?? a.profileImageUrl) || 'assets/avatar-placeholder.png',
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
          image_url: normalizeImageUrl(e.profile_image_url ?? e.profileImageUrl) || 'assets/avatar-placeholder.png',
          user_id: e.user_id ?? e.userId,
        }));
      },
      error: (err) => console.error('listEstablishments error', err),
    });

    this.publicApi.listArtworks('', 1, 20).subscribe({
      next: (r) => {
        const items = r?.items ?? r ?? [];
        this.featuredArtworks = items.map((a: any) => ({
          id: a.gallery_id ?? a.id,
          title: a.title ?? a.nombre ?? 'Obra',
          artist: a.artist ?? a.artist_name ?? a.artistName ?? a.display_name ?? '',
          description: a.description ?? a.descripcion ?? '',
          price: a.price ?? a.precio ?? null,
          size: a.size ?? a.tamano ?? null,
          image_url: normalizeImageUrl(a.image_url ?? a.imageUrl ?? a.photo_url ?? a.photoUrl) || 'assets/avatar-placeholder.png',
        }));
      },
      error: (err) => console.error('listArtworks error', err),
    });

    this.publicApi.listEvents('', 1, 8).subscribe({
      next: (r) => {
        const items = r?.items ?? r ?? [];
        this.featuredEvents = items.map((event: any) => ({
          id: event.id,
          title: event.title ?? 'Evento',
          establishment: event.establishment_name ?? event.establishmentName ?? '',
          establishment_id: event.establishment_id ?? event.establishmentId,
          description: event.description ?? '',
          location: event.location ?? '',
          starts_at: event.starts_at ?? event.startsAt,
          image_url:
            normalizeImageUrl(event.image_url ?? event.imageUrl) ||
            normalizeImageUrl(event.establishment_image_url ?? event.establishmentImageUrl) ||
            'assets/avatar-placeholder.png',
        }));
        this.activeFeaturedIndex = 0;
      },
      error: (err) => console.error('listEvents error', err),
    });
  }

  trackByUserId(_: number, item: any) {
    return item.user_id ?? item.id ?? item.name ?? item.title;
  }

  trackById(_: number, item: any) {
    return item.id ?? item.image_url ?? item.title;
  }

  syncFeaturedIndex(event: Event) {
    const el = event.target as HTMLElement;
    const index = Math.round(el.scrollLeft / el.clientWidth);
    this.activeFeaturedIndex = Math.max(0, Math.min(index, this.featuredEvents.length - 1));
  }

  startCarouselDrag(event: PointerEvent) {
    const el = event.currentTarget as HTMLElement;
    this.dragState = {
      el,
      pointerId: event.pointerId,
      startX: event.clientX,
      scrollLeft: el.scrollLeft,
      dragged: false,
    };
    el.setPointerCapture?.(event.pointerId);
  }

  moveCarouselDrag(event: PointerEvent) {
    if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;

    const delta = event.clientX - this.dragState.startX;
    if (Math.abs(delta) > 4) {
      this.dragState.dragged = true;
      event.preventDefault();
    }

    this.dragState.el.scrollLeft = this.dragState.scrollLeft - delta;
  }

  endCarouselDrag(event: PointerEvent) {
    if (!this.dragState || this.dragState.pointerId !== event.pointerId) return;

    this.suppressNextClick = this.dragState.dragged;
    if (this.suppressNextClick) {
      setTimeout(() => {
        this.suppressNextClick = false;
      }, 120);
    }
    this.dragState.el.releasePointerCapture?.(event.pointerId);
    this.dragState = undefined;
  }

  shouldOpenFromClick(event: MouseEvent) {
    if (!this.suppressNextClick) return true;

    event.preventDefault();
    event.stopPropagation();
    this.suppressNextClick = false;
    return false;
  }

  private shuffle(items: any[]) {
    return [...items].sort(() => Math.random() - 0.5);
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

  async openSearchModal() {
    const m = await this.modalCtrl.create({
      component: SearchModalComponent,
      cssClass: 'qz-search-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
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

  async openArtistFromClick(event: MouseEvent, artist: any) {
    if (!this.shouldOpenFromClick(event)) return;
    await this.openArtist(artist);
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

  async openEvent(event: any) {
    if (!event?.establishment_id) return;
    await this.openEstablishment({ user_id: event.establishment_id });
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

  async openEstablishmentFromClick(event: MouseEvent, est: any) {
    if (!this.shouldOpenFromClick(event)) return;
    await this.openEstablishment(est);
  }
}
