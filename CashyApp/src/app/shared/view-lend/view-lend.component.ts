import { getLocaleDateFormat } from '@angular/common';
import { Component, inject, Input, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular';
import { client } from 'src/app/models/client.model';
import { lend } from 'src/app/models/lend.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-view-lend',
  templateUrl: './view-lend.component.html',
  styleUrls: ['./view-lend.component.scss'],
})
export class ViewLendComponent  implements OnInit {

  constructor() { }

  @Input() lend: lend;

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
  }

  utilsSvc = inject(UtilsService);
  firebaseSvc = inject(FirebaseService);
  actionSheetCtrl = inject(ActionSheetController);

  user = {} as user;
  client = {} as client;


  async updateLend(lend: lend) {

    let path = `users/${this.user.uid}/clientes/${this.lend.clienteID}/prestamos/${this.lend.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    this.firebaseSvc.updateDocument(path, this.lend).then(async res => {

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Prestamo actualizado',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: 'Error: Prestamo no actualizado',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
    })
  }

  addPayment(lend: lend) {

    const date = new Date().getTime().toString();
    console.log(date);
    
    this.lend.abonos += 1;
    this.lend.fechaPagos.push(date);
    
    if (this.lend.tipo == 'Semanal' && this.lend.abonos == 10) {
      this.lend.pagado = true;
      this.lend.fechaLimite = date
    }
    
    if (this.lend.tipo == 'Quincenal' && this.lend.abonos == 5) {
      this.lend.pagado = true;
      this.lend.fechaLimite = date
    }

    this.updateLend(lend);
  }

  addBill(lend: lend) {

    this.lend.multas += 1;

    this.updateLend(lend);
  }

  deleteBill(lend: lend) {

    if (this.lend.multas > 0) {
      this.lend.multas -= 1;
      this.updateLend(lend);
    }else{
      this.utilsSvc.presentToast({
        message: 'Error: No hay multas que eliminar',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })
    }
  }

  async confirmAddPayment(lend: lend) {
    this.utilsSvc.presentAlert({
      header: 'Agregar pago',
      mode: 'md',
      message: 'Deseas agregar un pago?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Agregar',
          handler: () => {
            this.addPayment(lend);
          }
        }
      ]
    });
  }

  async confirmAddBill(lend: lend) {
    this.utilsSvc.presentAlert({
      header: 'Agregar multa',
      mode: 'md',
      message: 'Deseas agregar una multa?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Agregar',
          handler: () => {
            this.addBill(lend);
          }
        }
      ]
    });
  }

  async confirmDeleteBill(lend: lend) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar multa',
      mode: 'md',
      message: 'Deseas eliminar una multa?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Eliminar',
          handler: () => {
            this.deleteBill(lend);
          }
        }
      ]
    });
  }



}
