import { Injectable } from '@angular/core';
import { catchError, map, of } from 'rxjs';
import { environment } from 'src/environments/environment';
import { AppVersionApiService } from '../api/app-version-api.service';

@Injectable({ providedIn: 'root' })
export class AppVersionService {
  constructor(private api: AppVersionApiService) {}

  checkForRequiredUpdate() {
    return this.api.getVersionInfo().pipe(
      map((info) => ({
        required: this.compareVersions(environment.appVersion, info.minimum_supported_version) < 0,
        currentVersion: environment.appVersion,
        minimumVersion: info.minimum_supported_version,
        latestVersion: info.latest_version,
      })),
      catchError(() =>
        of({
          required: false,
          currentVersion: environment.appVersion,
          minimumVersion: environment.appVersion,
          latestVersion: environment.appVersion,
        })
      )
    );
  }

  private compareVersions(current: string, minimum: string) {
    const currentParts = this.parseVersion(current);
    const minimumParts = this.parseVersion(minimum);

    for (let i = 0; i < Math.max(currentParts.length, minimumParts.length); i += 1) {
      const currentPart = currentParts[i] || 0;
      const minimumPart = minimumParts[i] || 0;

      if (currentPart > minimumPart) {
        return 1;
      }

      if (currentPart < minimumPart) {
        return -1;
      }
    }

    return 0;
  }

  private parseVersion(version: string) {
    return version.split('.').map((part) => Number.parseInt(part, 10) || 0);
  }
}
