import { Component, Input, OnInit, inject } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActionSheetController } from '@ionic/angular';
import { client } from 'src/app/models/client.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-add-client',
  templateUrl: './add-client.component.html',
  styleUrls: ['./add-client.component.scss'],
})
export class AddClientComponent  implements OnInit {

  constructor() { }

  firebaseSvc = inject(FirebaseService);
  utilsSvc = inject(UtilsService);
  actionSheetCtrl = inject(ActionSheetController);

  user = {} as user;


  @Input() client: client;

  form = new FormGroup({
    id: new FormControl(''),
    nombre: new FormControl("", [Validators.required, Validators.minLength(4)]),
    ine: new FormControl(""),
    comprobanteDomicilio: new FormControl(""),
  });

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    if (this.client) {
      this.form.setValue(this.client);
    }
  }

  //------OPTIONS TO SELECT IMAGE-------
  async optionsToSelectImage(res: number) {
    const actionSheet = await this.actionSheetCtrl.create({
      mode: 'md',
      header: 'Seleccionar imagen',
      buttons: [
        {
          text: 'Seleccionar desde galeria',
          handler: () => {
            this.selectImage(res);
          },
        },
        {
          text: 'Tomar foto',
          handler: () => {
            this.takeImage(res);
          },
        },
        {
          text: 'Cancelar',
          role: 'cancel',
          data: {
            action: 'cancel',
          },
        },
      ],
    });

    await actionSheet.present();
  }

  //------TAKE PHOTO-------
  async takeImage(res: number) {
    const dataUrl = (await this.utilsSvc.takePicture()).dataUrl;
    
    if (res === 1) {
      this.form.controls.ine.setValue(dataUrl);
    } else {
      this.form.controls.comprobanteDomicilio.setValue(dataUrl);
    }
  }

  //-------SELECT IMAGE FROM GALLERY-----
  async selectImage(res: number) {
    const dataUrl = (await this.utilsSvc.selectPicture()).dataUrl;
    if (res === 1) {
      this.form.controls.ine.setValue(dataUrl);
    } else {
      this.form.controls.comprobanteDomicilio.setValue(dataUrl);
    }
  }

  submit() {
    if (this.form.valid) {
      if (this.client) {
        this.updateProduct();
      } else {
        this.createProduct();
      }
    }
  }

  async createProduct() {

    let path = `users/${this.user.uid}/clientes`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    //------UPLOAD IMAGEN GET URL------

    if (this.form.value.ine != "") {
      let dataUrlINE = this.form.value.ine;
      let imagePathINE = `/${this.user.uid}/${Date.now()}`;
      let imageUrlINE = await this.uploadImage(imagePathINE, dataUrlINE, path);
      this.form.controls.ine.setValue(imageUrlINE);
    }
    
    if (this.form.value.comprobanteDomicilio != "") {
      let dataUrlCD = this.form.value.comprobanteDomicilio;
      let imagePathCD = `/${this.user.uid}/${Date.now() + 1}`;
      let imageUrlCD = await this.uploadImage(imagePathCD, dataUrlCD, path);
      this.form.controls.comprobanteDomicilio.setValue(imageUrlCD);
    }

    delete this.form.value.id;

    this.firebaseSvc.addDocument(path, this.form.value).then(async res => {

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Cliente registrado',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: 'Error: Cliente no registrado',
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

    let path = `users/${this.user.uid}/clientes/${this.client.id}`;

    const loading = await this.utilsSvc.loading();
    await loading.present();

    //------UPLOAD IMAGEN GET URL------

    if (this.form.value.ine !== this.client.ine) {
      let dataUrl = this.form.value.ine;
      let imagePath = await this.firebaseSvc.getFilePath(this.client.ine);
      let imageUrl = await this.uploadImage(imagePath, dataUrl);
      this.form.controls.ine.setValue(imageUrl);
    }

    if (this.form.value.comprobanteDomicilio !== this.client.comprobanteDomicilio) {
      let dataUrl = this.form.value.comprobanteDomicilio;
      let imagePath = await this.firebaseSvc.getFilePath(this.client.comprobanteDomicilio);
      let imageUrl = await this.uploadImage(imagePath, dataUrl);
      this.form.controls.comprobanteDomicilio.setValue(imageUrl);
    }

    delete this.form.value.id;

    this.firebaseSvc.updateDocument(path, this.form.value).then(async res => {

      this.utilsSvc.dismissModal({ success: true });

      this.utilsSvc.presentToast({
        message: 'Datos actualizados',
        duration: 2000,
        color: 'success',
        position: 'bottom',
        icon: 'checkmark-done-outline'
      })

    }).catch(error => {

      console.log(error);

      this.utilsSvc.presentToast({
        message: 'Error: Datos no actualizados',
        duration: 2000,
        color: 'danger',
        position: 'bottom',
        icon: 'alert-circle-outline'
      })

    }).finally(() => {
      loading.dismiss();
    })
  }

  
  async uploadImage(imagePath: string, dataUrl: string, path?: string,): Promise<string> {
    let storageRef;
    let imageRef;
    
    if (path) {
      storageRef = this.firebaseSvc.storage.ref(path);
      imageRef = storageRef.child(imagePath);
    }else{
      storageRef = this.firebaseSvc.storage.ref('');
      imageRef = storageRef.child(imagePath);
    }


    
    try {
      const snapshot = await imageRef.putString(dataUrl, 'data_url'); 
      const downloadUrl = await snapshot.ref.getDownloadURL();  
      return downloadUrl;
    } catch (error) {
      console.error("Error al subir la imagen:", error);
      throw error;
    }
  }
  
  
}
