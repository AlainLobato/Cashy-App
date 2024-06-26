import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular';
import { orderBy } from 'firebase/firestore';
import { client } from 'src/app/models/client.model';
import { lend } from 'src/app/models/lend.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-lend',
  templateUrl: './add-lend.component.html',
  styleUrls: ['./add-lend.component.scss'],
})
export class AddLendComponent implements OnInit {

  constructor() { }

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  actionSheetCtrl = inject(ActionSheetController);

  user = {} as user;
  client = {} as client;

  @Input() lend: lend;

  form = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl("", [Validators.required]),
    fechaHoy: new FormControl(null, [Validators.required]),
    fechaLimite: new FormControl(null, [Validators.required]),
    cantidad: new FormControl(null, [Validators.required, Validators.min(0)]),
    tasa: new FormControl(null, [Validators.required, Validators.min(0)]),
    abonos: new FormControl(null, [Validators.required, Validators.min(0)]),
    multas: new FormControl(null, [Validators.required, Validators.min(0)]),
    notas: new FormControl(""),
    clienteID: new FormControl(""),
    tipo: new FormControl("", [Validators.required]),
    pagado: new FormControl(false),
    total: new FormControl(null),
    abono: new FormControl(null),
  });

  ngOnInit() {

    this.nameClients();

    this.user = this.utilsSvc.getFromLocalStorage('user');
    if (this.client) {
      this.form.setValue(this.lend);
    }
  }

  clients: client[] = [];
  lends: lend[] = [];
  clientID = '';

  User(): user {
    return this.utilsSvc.getFromLocalStorage('user');
  }

  //------GET CLIENTS ARRAY-----
  nameClients() {
    let path = `users/${this.User().uid}/clientes`;

    let query = (
      orderBy('nombre', 'desc')
    )

    let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
      next: (res: any) => {
        console.log(res);
        this.clients = res;
        for (let c of this.clients) {
          let path = `users/${this.user.uid}/clientes/${c.id}/prestamos`;

          let query = (
            orderBy('nombre', 'desc')
          )

          let sub = this.firebaseSvc.getCollectionData(path, query).subscribe({
            next: (res: any) => {
              this.lends.push(...res);
            }
          })
        }
      }
    })
  }

  setNumberInput() {

    let { cantidad, abonos, multas } = this.form.controls;

    if (cantidad.value) {
      cantidad.setValue(parseFloat(cantidad.value));
    }

    if (abonos.value) {
      abonos.setValue(parseFloat(abonos.value));
    }

    if (multas.value) {
      multas.setValue(parseFloat(multas.value));
    }
  }

  submit() {
    if (this.form.valid) {

      this.searchClientID();

      let tasa = this.form.controls.tasa;

      if (tasa.value) {
        tasa.setValue(parseFloat(tasa.value));
      }

      if (this.lend) {
        this.updateProduct();
      } else {
        this.createProduct();
      }
    }
  }

  searchClientID() {

    for (let i = 0; i < this.clients.length; i++) {
      if (this.clients[i].nombre == this.form.value.nombre) {
        this.clientID = this.clients[i].id;
        break;
      }
    }
  }

  async createProduct() {

    let path = `users/${this.user.uid}/clientes/${this.clientID}/prestamos`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    delete this.form.value.id;

    this.form.value.clienteID = this.clientID;

    this.form.value.total = this.form.value.cantidad * this.form.value.tasa;

    if (this.form.value.tipo == 'Semanal') {
      this.form.value.abono = this.form.value.total / 10;
    } else {
      this.form.value.abono = this.form.value.total / 5;
    }


    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Prestamo registrado',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: 'Error: Prestamo no registrado',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
    })

  }

  async updateProduct() {

    let path = `users/${this.user.uid}/clientes/${this.lend.clienteID}/prestamos/${this.lend.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    delete this.form.value.id;

    if (this.form.value.tipo == 'Semanal') {
      this.form.value.abono = this.lend.total / 10;

    } else {
      this.form.value.abono = this.lend.total / 5;
    }

    if ((this.lend.total - (this.form.value.abono * this.form.value.abonos)) == 0) {

      this.form.value.pagado = true;
    }


    this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {

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

}
