import { Component } from '@angular/core';
import { ModalController } from '@ionic/angular';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  standalone: false,
  selector: 'app-login-modal',
  templateUrl: './login-modal.component.html',
})
export class LoginModalComponent {
  email = '';
  password = '';

  constructor(private modalCtrl: ModalController, private auth: AuthService) {}

  dismiss() { this.modalCtrl.dismiss(); }

  loginAsArtist() {
    this.auth.mockLogin('artist');
    this.dismiss();
  }

  loginAsEstablishment() {
    this.auth.mockLogin('establishment');
    this.dismiss();
  }
}
