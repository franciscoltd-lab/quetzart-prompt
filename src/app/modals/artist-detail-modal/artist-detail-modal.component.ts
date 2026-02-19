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
}
