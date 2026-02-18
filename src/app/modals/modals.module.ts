import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

import { ArtistListModalComponent } from './artist-list-modal/artist-list-modal.component';
import { EstablishmentListModalComponent } from './establishment-list-modal/establishment-list-modal.component';
import { ArtworkDetailModalComponent } from './artwork-detail-modal/artwork-detail-modal.component';
import { EstablishmentDetailModalComponent } from './establishment-detail-modal/establishment-detail-modal.component';
import { BankInfoModalComponent } from './bank-info-modal/bank-info-modal.component';

import { LoginModalComponent } from './auth/login-modal/login-modal.component';
import { AccountTypeModalComponent } from './auth/account-type-modal/account-type-modal.component';
import { RegisterArtistModalComponent } from './auth/register-artist-modal/register-artist-modal.component';
import { RegisterEstablishmentModalComponent } from './auth/register-establishment-modal/register-establishment-modal.component';
import { EditTextModalComponent } from './common/edit-text-modal/edit-text-modal.component';

@NgModule({
  declarations: [
    ArtistListModalComponent,
    EstablishmentListModalComponent,
    ArtworkDetailModalComponent,
    EstablishmentDetailModalComponent,
    BankInfoModalComponent,
    LoginModalComponent,
    AccountTypeModalComponent,
    RegisterArtistModalComponent,
    RegisterEstablishmentModalComponent,
    EditTextModalComponent
  ],
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    IonicModule,
  ],
  exports: [
    ArtistListModalComponent,
    EstablishmentListModalComponent,
    ArtworkDetailModalComponent,
    EstablishmentDetailModalComponent,
    BankInfoModalComponent,
    LoginModalComponent,
    AccountTypeModalComponent,
    RegisterArtistModalComponent,
    RegisterEstablishmentModalComponent,
    EditTextModalComponent
  ],
})
export class ModalsModule {}
