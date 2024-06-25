import { Component, OnInit, inject } from '@angular/core';
import { orderBy } from 'firebase/firestore';
import { client } from 'src/app/models/client.model';
import { lend } from 'src/app/models/lend.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';
import { AddLendComponent } from 'src/app/shared/add-lend/add-lend.component';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
})
export class HomePage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);

  lends: lend[] = [];
  clients: client[] = [];
  results: client[] = [];
  aux: client[] = [];

  user(): user{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  //------ADD UPDATE LEND-------
  async addUpdateLend(lend?: any){
    let success = await this.utilsSvc.presentModal({
      component: AddLendComponent,
      cssClass: 'add-update-modal',
      componentProps: {lend}
    }) 

    if(success){
      this.ionViewWillEnter();
    }
  }

  doRefresh(event?: any) {
    setTimeout(() => {
      this.getLends();

      console.log(event)
      
      if(event != undefined){
        if (!event.isTrusted) {
          event.target.complete();
        }
      }

    }, 2000);
  }

  async ionViewWillEnter(search?: any) {

    const loading = await this.utilsSvc.loading();
    await loading.present();

    this.getClients(search).then(() => {
      this.getLends();
      this.aux = [...this.clients]
    }).finally(() => {
      this.doRefresh();
      loading.dismiss();
    });
  }

  getClients(search?: any): Promise<void> {
    
  
      let path = `users/${this.user().uid}/clientes`;
  
      let query = (
        orderBy('nombre', 'desc')
      )
  
      return new Promise<void>((resolve, reject) => {
        let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) =>{
            console.log(res);
            
            if(search){
              this.clients = search
            }else{
              this.clients = res;
            }

            sub.unsubscribe;
            resolve();
          },
          error: (err: any) => {
            console.error(err);
            reject(err);
          }
        });
      });
  }
  

  //------GET PRODUCTS IN HOME-----
  getLends(){
      this.lends = [];
  
      for (let c of this.clients) {
        let path = `users/${this.user().uid}/clientes/${c.id}/prestamos`;
  
        let query = (
          orderBy('nombre', 'desc')
        )
  
        let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
          next: (res: any) =>{
            this.lends.push(...res);
            sub.unsubscribe;
          }
        })
      }
    }

    //------DELETE LEND-------
  async deleteLend(lend: lend) {

    let path = `users/${this.user().uid}/clientes/${lend.clienteID}/prestamos/${lend.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    this.firebaseSvc.deleteDocument(path).then(async res => {

      this.lends = this.lends.filter(p => p.id !== lend.id);

      this.utilsSvc.presentToast({
        message: 'Prestamo eliminado',
        duration: 4000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: '  Error: No se pudo eliminar el prestamo',
        duration: 4000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
      this.ionViewWillEnter();
    })
  }

  async corfirmDeleteLend(lend: lend) {
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
            this.deleteLend(lend);
          }
        }
      ]
    });
  }

  handleInput(event) {

    this.results = [...this.clients]

    const query = event.target.value.toLowerCase();
    this.aux = this.results.filter(c => c.nombre.toLowerCase().includes(query));

    if (query == '') {
      this.ionViewWillEnter();
    }else{
      this.ionViewWillEnter(this.aux);
    }
  }


}
