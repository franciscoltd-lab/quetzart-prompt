import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PublicApiService } from 'src/app/core/api/public-api.service';
import { IonContent, IonHeader } from "@ionic/angular/standalone";

@Component({
  standalone: false,
  selector: 'app-artist-detail-modal',
  templateUrl: './artist-detail-modal.component.html',
  styleUrls: ['./artist-detail-modal.component.scss'],
})
export class ArtistDetailModalComponent implements OnInit {

  @Input() userId!: number;

  artist: any;
  loading = true;
  selectedImageUrl: string | null = null;
  selectedImageAlt = 'Imagen ampliada';
  imageZoomed = false;
  selectedArtwork: any = null;

  constructor(
    private modalCtrl: ModalController,
    private publicApi: PublicApiService
  ) { }

  ngOnInit() {
    this.publicApi.getArtist(this.userId).subscribe({
      next: (res) => {
        this.artist = res;
      },
      complete: () => {
        this.loading = false;
      }
    });
  }

  dismiss() {
    this.modalCtrl.dismiss();
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

  openArtwork(item: any, index: number) {
    this.selectedArtwork = {
      image_url: item.image_url,
      title: item.title || 'Sin titulo',
      technique: item.technique || item.tecnica || this.artist?.artistic_style || 'Tecnica no especificada',
      price: item.price || item.precio || 'Precio a consultar',
      description: item.description || item.caption || this.artist?.bio || `Obra del portafolio de ${this.artist?.display_name}.`,
    };
  }

  closeArtwork() {
    this.selectedArtwork = null;
  }

  enlargeSelectedArtwork(event: Event) {
    event.stopPropagation();
    if (!this.selectedArtwork?.image_url) return;

    this.openImage(this.selectedArtwork.image_url, this.selectedArtwork.title || 'Imagen ampliada');
  }
}
