import { Component, Input } from '@angular/core';
import { ModalController, ToastController } from '@ionic/angular';
import { FormBuilder, Validators } from '@angular/forms';
import { IonHeader, IonContent } from "@ionic/angular/standalone";

@Component({
    standalone: false,
    selector: 'app-edit-text-modal',
    templateUrl: './edit-text-modal.component.html',
    styleUrls: ['./edit-text-modal.component.scss'],
})
export class EditTextModalComponent {
    @Input() title = 'Editar';
    @Input() label = 'Texto';
    @Input() placeholder = '';
    @Input() value = '';
    @Input() minLength = 2;
    @Input() multiline = false;

    form = this.fb.group({
        text: ['', [Validators.required]],
    });

    constructor(
        private fb: FormBuilder,
        private modalCtrl: ModalController,
        private toastCtrl: ToastController
    ) { }

    ionViewWillEnter() {
        this.form.controls.text.setValidators([
            Validators.required,
            Validators.minLength(this.minLength),
        ]);
        this.form.controls.text.setValue(this.value || '');
        this.form.controls.text.updateValueAndValidity();
    }

    dismiss() {
        this.modalCtrl.dismiss(null);
    }

    save() {
        this.form.markAllAsTouched();
        if (this.form.invalid) return;

        const text = String(this.form.value.text || '').trim();
        this.modalCtrl.dismiss({ text });
    }
}
