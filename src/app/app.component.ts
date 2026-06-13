import { Component } from '@angular/core';
import { Capacitor } from '@capacitor/core';
import { AppVersionService } from './core/services/app-version.service';
import { environment } from 'src/environments/environment';

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
  updateUrl = this.getUpdateUrl();
  updateStoreName = Capacitor.getPlatform() === 'ios' ? 'App Store' : 'Play Store';

  constructor(private appVersion: AppVersionService) {
    this.appVersion.checkForRequiredUpdate().subscribe((result) => {
      this.updateRequired = result.required;
      this.currentVersion = result.currentVersion;
      this.minimumVersion = result.minimumVersion;
      this.latestVersion = result.latestVersion;
    });
  }

  private getUpdateUrl() {
    const platform = Capacitor.getPlatform();

    if (platform === 'ios') {
      return environment.iosUpdateUrl || environment.appUpdateUrl;
    }

    if (platform === 'android') {
      return environment.androidUpdateUrl || environment.appUpdateUrl;
    }

    return environment.appUpdateUrl;
  }
}
