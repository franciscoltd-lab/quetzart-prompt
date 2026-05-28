import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { forkJoin, of } from 'rxjs';
import { PublicApiService } from 'src/app/core/api/public-api.service';
import { normalizeImageUrl } from 'src/app/core/utils/image-url';
import { ArtistDetailModalComponent } from '../artist-detail-modal/artist-detail-modal.component';
import { ArtworkDetailModalComponent } from '../artwork-detail-modal/artwork-detail-modal.component';
import { EstablishmentDetailModalComponent } from '../establishment-detail-modal/establishment-detail-modal.component';

type SearchResultType = 'artist' | 'artwork' | 'establishment' | 'event';
type SearchFilter = 'all' | 'artist' | 'artwork' | 'establishment' | 'event' | 'name' | 'style' | 'establishmentType';

interface SearchResult {
  id: number;
  type: SearchResultType;
  title: string;
  subtitle: string;
  imageUrl: string;
  data: any;
}

@Component({
  standalone: false,
  selector: 'app-search-modal',
  templateUrl: './search-modal.component.html',
  styleUrls: ['./search-modal.component.scss'],
})
export class SearchModalComponent {
  query = '';
  activeFilter: SearchFilter = 'all';
  results: SearchResult[] = [];
  loading = false;
  searched = false;
  filters: { key: SearchFilter; label: string }[] = [
    { key: 'all', label: 'Todo' },
    { key: 'artist', label: 'Artistas' },
    { key: 'artwork', label: 'Obras' },
    { key: 'establishment', label: 'Establecimientos' },
    { key: 'event', label: 'Eventos' },
    { key: 'name', label: 'Nombre' },
    { key: 'style', label: 'Corriente artistica' },
    { key: 'establishmentType', label: 'Tipo de establecimiento' },
  ];

  constructor(
    private modalCtrl: ModalController,
    private publicApi: PublicApiService
  ) {}

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSearchChange(ev: any) {
    this.query = (ev?.detail?.value ?? '').trim();

    if (this.query.length < 2) {
      this.results = [];
      this.loading = false;
      this.searched = false;
      return;
    }

    this.search();
  }

  setFilter(filter: SearchFilter) {
    this.activeFilter = filter;
    if (this.query.length >= 2) this.search();
  }

  private search() {
    this.loading = true;
    this.searched = true;

    forkJoin({
      artists: this.shouldSearch('artist') ? this.publicApi.listArtists(this.query, 1, 8, this.artistSearchField()) : of({ items: [] }),
      artworks: this.shouldSearch('artwork') ? this.publicApi.listArtworks(this.query, 1, 8) : of({ items: [] }),
      establishments: this.shouldSearch('establishment') ? this.publicApi.listEstablishments(this.query, 1, 8) : of({ items: [] }),
      events: this.shouldSearch('event') ? this.publicApi.listEvents(this.query, 1, 8) : of({ items: [] }),
    }).subscribe({
      next: (res) => {
        this.results = [
          ...this.mapArtists(res.artists?.items ?? []),
          ...this.mapArtworks(res.artworks?.items ?? []),
          ...this.mapEstablishments(res.establishments?.items ?? []),
          ...this.mapEvents(res.events?.items ?? []),
        ];
      },
      error: (err) => {
        console.error('search error', err);
        this.results = [];
      },
      complete: () => {
        this.loading = false;
      },
    });
  }

  private shouldSearch(type: SearchResultType) {
    const byFilter: Record<SearchFilter, SearchResultType[]> = {
      all: ['artist', 'artwork', 'establishment', 'event'],
      artist: ['artist'],
      artwork: ['artwork'],
      establishment: ['establishment'],
      event: ['event'],
      name: ['artist', 'establishment', 'event'],
      style: ['artist', 'artwork'],
      establishmentType: ['establishment', 'event'],
    };

    return byFilter[this.activeFilter].includes(type);
  }

  private artistSearchField() {
    if (this.activeFilter === 'artist' || this.activeFilter === 'name') return 'name';
    if (this.activeFilter === 'style') return 'style';
    return '';
  }

  private mapArtists(items: any[]): SearchResult[] {
    return items.map((item) => ({
      id: item.user_id,
      type: 'artist',
      title: item.display_name ?? 'Artista',
      subtitle: item.artistic_style ?? 'Artista',
      imageUrl: normalizeImageUrl(item.profile_image_url) || 'assets/avatar-placeholder.png',
      data: item,
    }));
  }

  private mapArtworks(items: any[]): SearchResult[] {
    return items.map((item) => ({
      id: item.gallery_id,
      type: 'artwork',
      title: item.display_name ? `Obra de ${item.display_name}` : 'Obra',
      subtitle: item.artist_name ?? item.display_name ?? 'Obra',
      imageUrl: normalizeImageUrl(item.image_url) || 'assets/avatar-placeholder.png',
      data: {
        id: item.gallery_id,
        title: item.title ?? 'Obra',
        artist: item.artist_name ?? item.display_name ?? '',
        size: item.size ?? null,
        price: item.price ?? null,
        description: item.description ?? '',
        image_url: normalizeImageUrl(item.image_url) || 'assets/avatar-placeholder.png',
      },
    }));
  }

  private mapEstablishments(items: any[]): SearchResult[] {
    return items.map((item) => ({
      id: item.user_id,
      type: 'establishment',
      title: item.display_name ?? 'Establecimiento',
      subtitle: [item.category, item.municipality].filter(Boolean).join(' - ') || 'Establecimiento',
      imageUrl: normalizeImageUrl(item.profile_image_url) || 'assets/avatar-placeholder.png',
      data: item,
    }));
  }

  private mapEvents(items: any[]): SearchResult[] {
    return items.map((item) => ({
      id: item.id,
      type: 'event',
      title: item.title ?? 'Evento',
      subtitle: [item.establishment_name, item.location].filter(Boolean).join(' - ') || 'Evento',
      imageUrl:
        normalizeImageUrl(item.image_url) ||
        normalizeImageUrl(item.establishment_image_url) ||
        'assets/avatar-placeholder.png',
      data: item,
    }));
  }

  async openResult(result: SearchResult) {
    if (result.type === 'artist') {
      await this.openArtist(result.data.user_id);
      return;
    }

    if (result.type === 'establishment') {
      await this.openEstablishment(result.data.user_id);
      return;
    }

    if (result.type === 'event') {
      await this.openEstablishment(result.data.establishment_id);
      return;
    }

    await this.openArtwork(result.data);
  }

  private async openArtist(userId: number) {
    if (!userId) return;

    const m = await this.modalCtrl.create({
      component: ArtistDetailModalComponent,
      componentProps: { userId },
      cssClass: 'qz-large-modal',
      breakpoints: [0, 1],
      initialBreakpoint: 1,
    });
    await m.present();
  }

  private async openEstablishment(userId: number) {
    if (!userId) return;

    const m = await this.modalCtrl.create({
      component: EstablishmentDetailModalComponent,
      componentProps: { userId },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }

  private async openArtwork(artwork: any) {
    const m = await this.modalCtrl.create({
      component: ArtworkDetailModalComponent,
      componentProps: { artwork },
      breakpoints: [0, 0.95],
      initialBreakpoint: 0.95,
    });
    await m.present();
  }

  labelFor(type: SearchResultType) {
    const labels = {
      artist: 'Artista',
      artwork: 'Obra',
      establishment: 'Establecimiento',
      event: 'Evento',
    };
    return labels[type];
  }

  trackByResult(_: number, item: SearchResult) {
    return `${item.type}-${item.id}`;
  }
}
