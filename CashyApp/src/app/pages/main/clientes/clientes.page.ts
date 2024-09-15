import { Component, OnInit, inject } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { client } from 'src/app/models/client.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddClientComponent } from 'src/app/shared/add-client/add-client.component';
import { ShowClientDetailsComponent } from 'src/app/shared/show-client-details/show-client-details.component';

@Component({
  selector: 'app-clientes',
  templateUrl: './clientes.page.html',
  styleUrls: ['./clientes.page.scss'],
})
export class ClientesPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  user(): user{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  ionViewWillEnter() {
    this.getClients();
  }

  clients: client[] = [];

   //------ADD UPDATE CLIENT-------
   async addUpdateClient(client?: client){
    let success = await this.utilsSvc.presentModal({
      component: AddClientComponent,
      cssClass: 'add-update-modal',
      componentProps: {client}
    }) 

    if(success){
      this.getClients();
    }
  }

  //------GET CLIENTS IN HOME-----
  getClients(){
    let path = `users/${this.user().uid}/clientes`;

    let query = (
      orderBy('nombre', 'desc')
    )

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) =>{
        this.clients = res;
        sub.unsubscribe;
      }
    })
  }

  //------DELETE CLIENT-------
  async deleteClient(client: client) {

    let path = `users/${this.user().uid}/clientes/${client.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    if(client.ine){
      let imagePathINE = await this.firebaseSvc.getFilePath(client.ine);
      await this.firebaseSvc.deleteFile(imagePathINE);

    }

    if (client.comprobanteDomicilio) {
      let imagePathCD = await this.firebaseSvc.getFilePath(client.comprobanteDomicilio);
      await this.firebaseSvc.deleteFile(imagePathCD);
    }

    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.clients = this.clients.filter(c => c.id !== client.id);

      this.utilsSvc.presentToast({
        message: 'Cliente eliminado',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: '  Error: No se pudo eliminar el cliente',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
    })
  }

  async corfirmDeleteClient(client: client) {
    this.utilsSvc.presentAlert({
      header: 'Eliminar cliente',
      mode: 'md',
      message: 'Deseas eliminar el cliente?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Eliminar',
          handler: () => {
            this.deleteClient(client);
          }
        }
      ]
    });
  }

  async showClientDetails(client: client){

    await this.utilsSvc.presentModal({
      component: ShowClientDetailsComponent,
      cssClass: 'add-update-modal',
      componentProps: {client}
    }) 
  }

  doRefresh(event?: any) {
    setTimeout(() => {
      this.getClients();

      console.log(event)
      
      if(event != undefined){
        if (!event.isTrusted) {
          event.target.complete();
        }
      }

    }, 2000);
  }

}
