import { Injectable } from '@angular/core';
import { Camera, CameraResultType, CameraSource } from '@capacitor/camera';

@Injectable({ providedIn: 'root' })
export class PhotoService {
  // 1 foto (perfil)
  async pickSingleBase64(): Promise<string | null> {
    try {
      const photo = await Camera.getPhoto({
        quality: 85,
        allowEditing: false,
        source: CameraSource.Photos,
        resultType: CameraResultType.Base64,
      });

      if (!photo.base64String) return null;
      return `data:image/${photo.format};base64,${photo.base64String}`;
    } catch {
      return null;
    }
  }

  // varias fotos (galería/portafolio)
  async pickMultipleBase64(max = 6): Promise<string[]> {
    try {
      // Capacitor moderno: pickImages
      const anyCamera: any = Camera as any;
      if (typeof anyCamera.pickImages === 'function') {
        const res = await anyCamera.pickImages({
          quality: 85,
          limit: max,
        });

        const out: string[] = [];
        for (const p of res.photos || []) {
          // some versions return webPath; we convert to base64 via fetch
          if (p.webPath) {
            const dataUrl = await this.webPathToDataUrl(p.webPath);
            if (dataUrl) out.push(dataUrl);
          }
        }
        return out;
      }

      // Fallback: solo una si tu versión no soporta multi
      const one = await this.pickSingleBase64();
      return one ? [one] : [];
    } catch {
      return [];
    }
  }

  private async webPathToDataUrl(webPath: string): Promise<string | null> {
    try {
      const resp = await fetch(webPath);
      const blob = await resp.blob();
      return await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(String(reader.result));
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(blob);
      });
    } catch {
      return null;
    }
  }
}
