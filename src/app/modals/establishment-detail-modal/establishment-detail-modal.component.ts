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

  est: any;
  loading = true;

  constructor(
    private modalCtrl: ModalController,
    private publicApi: PublicApiService,
  ) {}

  ngOnInit() {
    this.publicApi.getEstablishment(this.userId).subscribe({
      next: (res) => this.est = res,
      error: (e) => console.error(e),
      complete: () => this.loading = false,
    });
  }

  dismiss() { this.modalCtrl.dismiss(); }
}
