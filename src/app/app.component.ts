import { Component } from '@angular/core';
import { AppVersionService } from './core/services/app-version.service';

@Component({
  standalone: false,
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  updateRequired = false;
  currentVersion = '';
  minimumVersion = '';
  latestVersion = '';

  constructor(private appVersion: AppVersionService) {
    this.appVersion.checkForRequiredUpdate().subscribe((result) => {
      this.updateRequired = result.required;
      this.currentVersion = result.currentVersion;
      this.minimumVersion = result.minimumVersion;
      this.latestVersion = result.latestVersion;
    });
  }
}
