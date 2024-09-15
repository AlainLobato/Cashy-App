import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HeaderComponent } from './header/header.component';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CustomInputComponent } from './custom-input/custom-input.component';
import { LogoComponent } from './logo/logo.component';
import { FooterComponent } from './footer/footer.component';
import { AddClientComponent } from './add-client/add-client.component';
import { AddLendComponent } from './add-lend/add-lend.component';
import { ShowClientDetailsComponent } from './show-client-details/show-client-details.component';
import { ViewLendComponent } from './view-lend/view-lend.component';



@NgModule({
  declarations: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    FooterComponent,
    AddClientComponent,
    AddLendComponent,
    ViewLendComponent,
    ShowClientDetailsComponent
  ],
  exports: [
    HeaderComponent,
    CustomInputComponent,
    LogoComponent,
    ReactiveFormsModule,
    FooterComponent,
    AddClientComponent,
    AddLendComponent,
    ViewLendComponent,
    ShowClientDetailsComponent
  ],
  imports: [
    CommonModule,
    IonicModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }
