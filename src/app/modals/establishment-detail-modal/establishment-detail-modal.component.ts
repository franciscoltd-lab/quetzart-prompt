import { Component, Input, OnInit } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { PublicApiService } from 'src/app/core/api/public-api.service';

@Component({
  standalone: false,
  selector: 'app-establishment-detail-modal',
  templateUrl: './establishment-detail-modal.component.html',
  styleUrls: ['./establishment-detail-modal.component.scss'],
})
export class EstablishmentDetailModalComponent implements OnInit {

  @Input() userId!: number;
  @Input() est: any;

  loading = true;
  selectedImageUrl: string | null = null;
  selectedImageAlt = 'Imagen ampliada';
  imageZoomed = false;

  constructor(
    private modalCtrl: ModalController,
    private publicApi: PublicApiService,
  ) {}

  ngOnInit() {
    if (!this.userId && this.est) {
      this.loading = false;
      return;
    }

    this.publicApi.getEstablishment(this.userId).subscribe({
      next: (res) => this.est = res,
      error: (e) => console.error(e),
      complete: () => this.loading = false,
    });
  }

  dismiss() { this.modalCtrl.dismiss(); }

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
}
