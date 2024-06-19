import { Injectable, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LoadingController, ModalController, ToastController, ToastOptions } from '@ionic/angular';

@Injectable({
  providedIn: 'root'
})

export class UtilsService {

  modalCtrl = inject(ModalController)
  loadingCtrl = inject(LoadingController)
  toastCtrl = inject(ToastController)
  router = inject(Router)

  //--------MODAL-----------
  dismissModal(data?: any) {
    return this.modalCtrl.dismiss(data);
  }

  //----------------LOADING-----------------
  loading() {
    return this.loadingCtrl.create({
      spinner: 'lines-sharp-small',
      message: 'Loading',
      duration: 3000,
    });
  }

  //--------------TOAST--------------------
  async presentToast(opts?: ToastOptions) {
    const toast = await this.toastCtrl.create(opts);
    toast.present();
  }

  //-------------RUTA A PAGINA DISPONIBLE-----------
  routerLink(url: string) {
    return this.router.navigateByUrl(url);
  }

}
