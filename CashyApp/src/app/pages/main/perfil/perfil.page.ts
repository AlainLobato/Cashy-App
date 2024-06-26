import { Component, OnInit, inject } from '@angular/core';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
})
export class PerfilPage implements OnInit {

  constructor() { }

  ngOnInit() {
  }

  user(): user{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  utilsSvc = inject(UtilsService);
  firebaseSvc = inject(FirebaseService);

  async confirmSignOut() {
    this.utilsSvc.presentAlert({
      header: 'Cerrar sesion',
      mode: 'md',
      message: 'Deseas cerrar sesion?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Aceptar',
          handler: () => {
            this.signOut();
          }
        }
      ]
    });
  }

  //------SIGN OUT------
  signOut(){
    this.firebaseSvc.signOut();
  }

  async confirmSupport() {
    this.utilsSvc.presentAlert({
      header: 'Contactar a soporte',
      mode: 'md',
      message: 'Deseas contactar a soporte?',
      buttons: [
        {
          text: 'Cancelar'
        }, {
          text: 'Contactar',
          handler: () => {
            this.support();
          }
        }
      ]
    });
  }

  support(){
    const href = 'https://wa.me/528127713406?text=Hola, tengo un problema con la app.';
    window.location.href = href;
  }

  User(): user{
    return this.utilsSvc.getFromLocalStorage('user');
  }

  doRefresh(event?: any) {
    setTimeout(() => {
      console.log(event)
      
      if(event != undefined){
        if (!event.isTrusted) {
          event.target.complete();
        }
      }

    }, 2000);
  }

}
