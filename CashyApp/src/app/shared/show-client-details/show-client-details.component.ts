import { Component, Input, OnInit, inject } from '@angular/core';
import { client } from 'src/app/models/client.model';
import { lend } from 'src/app/models/lend.model';
import { user } from 'src/app/models/user.model';
import { FirebaseService } from 'src/app/services/firebase.service';
import { UtilsService } from 'src/app/services/utils.service';

@Component({
  selector: 'app-show-client-details',
  templateUrl: './show-client-details.component.html',
  styleUrls: ['./show-client-details.component.scss'],
})
export class ShowClientDetailsComponent implements OnInit {

  constructor() { }

  utilsSvc = inject(UtilsService);
  firebaseSvc = inject(FirebaseService);

  ngOnInit() {
    this.user = this.utilsSvc.getFromLocalStorage('user');
    this.getLends();
  }

  @Input() client: client;

  user = {} as user;
  lend: lend[] = [];

  getLends() {
    let path = `users/${this.user.uid}/clientes/${this.client.id}/prestamos`;

    let sub = this.firebaseSvc.getCollectionData(path).subscribe({
      next: (res: any) => {
        console.log(res);
        this.lend = res;
        sub.unsubscribe();
      }
    })
  }

}
