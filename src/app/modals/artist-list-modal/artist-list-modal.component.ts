import { Component, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PublicApiService } from 'src/app/core/api/public-api.service';
import { ArtistDetailModalComponent } from '../artist-detail-modal/artist-detail-modal.component'; // si lo tienes
// Si no existe ArtistDetailModalComponent, ahorita lo cambiamos por el modal que sí tengas.

@Component({
  standalone: false,
  selector: 'app-artist-list-modal',
  templateUrl: './artist-list-modal.component.html',
  styleUrls: ['./artist-list-modal.component.scss'],
})
export class ArtistListModalComponent implements OnInit {
  items: any[] = [];
  search = '';

  page = 1;
  size = 20;
  total = 0;

  loading = false;
  loadingMore = false;
  ended = false;

  constructor(
    private modalCtrl: ModalController,
    private publicApi: PublicApiService
  ) {}

  ngOnInit(): void {
    this.fetch(true);
  }

  dismiss() {
    this.modalCtrl.dismiss();
  }

  onSearchChange(ev: any) {
    this.search = (ev?.detail?.value ?? '').trim();
    this.fetch(true);
  }

 async openArtist(a: any) {
  const m = await this.modalCtrl.create({
    component: ArtistDetailModalComponent,
    componentProps: { userId: a.user_id },
    breakpoints: [0, 0.95],
    initialBreakpoint: 0.95,
  });
  await m.present();
}


  async fetch(reset: boolean) {
    if (this.loading || this.loadingMore) return;

    if (reset) {
      this.page = 1;
      this.items = [];
      this.total = 0;
      this.ended = false;
      this.loading = true;
    } else {
      this.loadingMore = true;
    }

    this.publicApi.listArtists(this.search, this.page, this.size).subscribe({
      next: (res) => {
        const newItems = res?.items ?? [];
        this.total = res?.total ?? 0;

        this.items = reset ? newItems : [...this.items, ...newItems];

        // si ya no llegan más resultados, se acabó
        if (newItems.length < this.size) this.ended = true;

        // avanza página si sí llegó algo
        if (newItems.length) this.page += 1;
      },
      error: (err) => {
        console.error('listArtists error', err);
      },
      complete: () => {
        this.loading = false;
        this.loadingMore = false;
      },
    });
  }

  loadMore(ev: any) {
    if (this.ended) {
      ev?.target?.complete?.();
      return;
    }

    this.fetch(false).then(() => {
      ev?.target?.complete?.();
      if (this.ended) ev.target.disabled = true;
    });
  }

  trackById(_: number, it: any) {
    return it.user_id;
  }
}
