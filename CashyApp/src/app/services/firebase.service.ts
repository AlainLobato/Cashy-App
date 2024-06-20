import { Injectable, inject } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updateProfile, sendPasswordResetEmail, signOut } from 'firebase/auth';
import { user } from '../models/user.model';
import {AngularFirestore} from '@angular/fire/compat/firestore';
import { getFirestore, doc, getDoc, addDoc, collection, collectionData, query, updateDoc, deleteDoc} from '@angular/fire/firestore';
import { setDoc } from 'firebase/firestore';
import { UtilsService } from './utils.service';
import { AngularFireStorage } from "@angular/fire/compat/storage";
import { getStorage, ref, uploadString, getDownloadURL, deleteObject} from "firebase/storage";

@Injectable({
  providedIn: 'root'
})
export class FirebaseService {

  auth = inject(AngularFireAuth);
  firestore = inject(AngularFirestore);
  utilsSvc = inject(UtilsService);
  storage = inject(AngularFireStorage);
  
  //-----AUTH-----

  getAuth(){
    return getAuth();
  }

  signIn(user: user){
    return signInWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //-----SIGN-UP-----

  signUp(user: user){
    return createUserWithEmailAndPassword(getAuth(), user.email, user.password);
  }

  //-----SIGN OUT-----
  signOut(){
    getAuth().signOut();
    localStorage.removeItem('user');
    this.utilsSvc.routerLink('');
  }

  //-------UPDATE USER-----
  updateUser(displayName: string){
    return updateProfile(getAuth().currentUser, {displayName});
  }

  //----- SEND EMAIL TO RECOVERY PASSWORD-----
  sendRecoveryEmail(email: string){
    return sendPasswordResetEmail(getAuth(), email);
  }

  //--------DATA BASE FIRESTORE--------

    //----Get Collection Data-----
    getCollectionData(path: string, collectionQuery?: any){
      const ref = collection(getFirestore(), path);
      return collectionData(query(ref, collectionQuery), {idField: 'id'});
    }
    

    //----- Set Document--------
    setDocument(path: string, data: any){
      return setDoc(doc(getFirestore(), path), data);
      
    }

    //-----Update Document------
    updateDocument(path: string, data: any){
      return updateDoc(doc(getFirestore(), path), data);
      
    }

    //------Get Document--------
    async getDocument(path: string){
      return (await getDoc(doc(getFirestore(), path))).data();
    }

    //------Add Document-------
    addDocument(path: string, data: any){
      return addDoc(collection(getFirestore(), path), data); 
    }

    //-----Delete Document------
    deleteDocument(path: string){
      return deleteDoc(doc(getFirestore(), path));
      
    }
  
    //-------STORAGE---------
    async uploadImage(path: string, data_url: string){
      return uploadString(ref(getStorage(), path), data_url, 'data_url').then(()=>{
        return getDownloadURL(ref(getStorage(), path))
      })
    }

    //----GET PATH IMAGE----
    async getFilePath(url: string){
      return ref(getStorage(), url).fullPath;
    }

    //----DELETE FILE-----
    deleteFile(path: string){
      return deleteObject(ref(getStorage(), path));
    }

}
