import { Injectable } from '@angular/core';
import { AuthenticationDetails, CognitoUser, CognitoUserPool, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import { Observable } from 'rxjs/Observable';
import { environment } from '../../environments/environment';
import { Http, Headers } from '@angular/http';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { ApisService } from '../services/apis.service';
//import firebase
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// Add the Firebase products that you want to use
import "firebase/auth";
import { reject } from 'q';
const firebaseConfig = {
  apiKey: 'AIzaSyDnXYnSvaz3HajWwJTkvas5CW0u5PEkkO4',
  authDomain: 'auth.abpmanch.com',
  databaseURL: 'https://auth.abpmanch.com',
  projectId: 'nice-argon-95105',
  storageBucket: 'nice-argon-95105.appspot.com',
  messagingSenderId: '624288627215',
  appId: '1:624288627215:web:fc7d7127b43d374c'
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

const poolData = {
  UserPoolId: environment.userpoolid, // 'ap-south-1_mTtoFwe4F',
  ClientId: environment.clientid // '1ggfehnvu2fvb3kh60ppetiotq'
};

firebase.auth().onAuthStateChanged(function (user) {
  if (user) {
    // console.log('user signed in');
  } else {
    // console.log('user not signed in');
  }
});

// const userPool = new CognitoUserPool(poolData);

@Injectable()
export class AuthorizationService {
  cognitoUser: any;
  errorMsg: string;
  users = {
    'abhijeetv@abpnews.in': {
      'name': 'Abhijeet Verma',
      'image': 'https://scontent-sin6-2.xx.fbcdn.net/v/t1.0-1/c34.14.160.160a/p200x200/20915072_10210459740951432_3764189843635930208_n.jpg?_nc_cat=102&_nc_ht=scontent-sin6-2.xx&oh=90fe8e5b1a17af79d0bd9ed5a921d61a&oe=5CB48ECC'
    },
    'ramakrishnanl@abpnews.in': {
      'name': 'Ramakrishnan Laxman',
      'image': 'http://www.wan-ifra.org/sites/default/files/imagecache/default_col_2/field_event_spkr_image/Ramakrishnan%20Laxman.jpg'
    },
    'vinodt@abpnews.in': {
      'name': 'Vinod Tiwari',
      'image': 'https://scontent-sin6-2.xx.fbcdn.net/v/t1.0-9/40002113_10210911428735626_854558381480869888_n.jpg?_nc_cat=109&_nc_ht=scontent-sin6-2.xx&oh=367979930c9637d399433518ffc65523&oe=5CBC68D5'
    },
    'nikhilk@abpnews.in': {
      'name': 'Nikhil Khare',
      'image': 'https://media.licdn.com/dms/image/C4D03AQF8YI_nOomZsA/profile-displayphoto-shrink_800_800/0?e=1554336000&v=beta&t=rGwUqWNLqkxA2_J4iPf5r21AsqXVs-1ZzO8XH0cqvA0'
    },
    'sunils@abpnews.in': {
      'name': 'Sunil Sharma',
      'image': 'https://media.licdn.com/dms/image/C4D03AQHROK1-eE4DVw/profile-displayphoto-shrink_800_800/0?e=1554336000&v=beta&t=cuR1s-4MfrvZfzYjEiweXOjAMCkHMbeTW31onhPpqL0'
    },
    'mayurs@abpnews.in': {
      'name': 'Mayur Tomar',
      'image': 'https://scontent-sin6-2.xx.fbcdn.net/v/t1.0-1/p160x160/27857934_1971572576205484_4326744731072289130_n.jpg?_nc_cat=107&_nc_ht=scontent-sin6-2.xx&oh=f47db9ff5be3a7a3d6eeb631a585501e&oe=5CC1A245'
    },
    'rajendrab@abpnews.in': {
      'name': 'Rajendra Bist',
      'image': 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_xPNOBFm_LVmWkQ7ixFrprC7f0xRcVvMrV4YNYydDTlhlYCTV'
    }
  };
  constructor(private http: HttpClient, private apiservice: ApisService) { }

  register(email, password, name): Promise<any> {
    const apiInstance = this.apiservice;
    const promise = new Promise((resolve, reject) => {
      firebase.auth().createUserWithEmailAndPassword(email, password).then(function (data) {
        // user created, now update display name
        firebase.auth().currentUser.updateProfile({
          displayName: name
        }).then(function () {
          // Display Name Updated . Save user in DB/Dynamo
          const token = data['user']['ra'];
          apiInstance.register(email, name, token).then(() => {
            resolve(data);
          }, (err) => {
            reject(err);
          });
        }).catch(function (error) {
          // An error happened.
        });
      }).catch(function (error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        reject(errorMessage);
      });
    });
    return promise;
  }

  signIn(email, password): Promise<any> {
    const apiInstance = this.apiservice;
    const promise = new Promise((resolve, reject) => {
      firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
        // console.log(data);return;
        // console.log(data['user']['ra']);return;
        // resolve(data);
        apiInstance.register(email, data['user']['displayName'], data['user']['ra']).then(() => {
          resolve(data);
        }, (err) => {
          reject(err);
        });
      }).catch(function (error) {
        // Handle Errors here.
        let errorCode = error.code;
        let errorMessage = error.message;
        reject(errorMessage);
      });
    });
    return promise;
  }

  adminSignIn(email, password): Promise<any> {
    const apiInstance = this.apiservice;
    const promise = new Promise((resolve, reject) => {
      apiInstance._getUserRoleUsingEmail(email).subscribe(data => {
        // console.log(data)
        if (data['success'] && (data['data'] == null || data['data'].uType === 0)) {
          const error = 'Not authorized to perform this action';
          reject(error);
        } else{
          firebase.auth().signInWithEmailAndPassword(email, password).then(function (data) {
            apiInstance.register(email, data['user']['displayName'], data['user']['ra']).then(() => {
              resolve(data);
            }, (err) => {
              reject(err);
            });
          }).catch(function (error) {
            // Handle Errors here.
            let errorCode = error.code;
            let errorMessage = error.message;
            reject(errorMessage);
          });
        }
      });
    });
    return promise;
  }

  isLoggedIn(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      firebase.auth().onAuthStateChanged(function (user) {
        if (user) {
          resolve({ success: true, user: user });
        } else {
          reject({ success: false });
        }
      });
    });
    return promise;
  }

  getAuthenticatedUser() {
    if (localStorage['accessToken'] != null) {
      const token: any = localStorage['accessToken'];
      return this.apiservice.isTokenValid(token);
    } else {
      return null;
    }
  }

  facebookLogin(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      const provider = new firebase.auth.FacebookAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    });
    return promise;
  }
  googleLogin(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      console.log('asdasdasd')
      const provider = new firebase.auth.GoogleAuthProvider();
      firebase.auth().signInWithRedirect(provider);
    });
    return promise;
  }
  isSocialLoggenIn(): Promise<any> {
    const apiInstance = this.apiservice;
    const promise = new Promise((resolve, reject) => {
      firebase.auth().getRedirectResult().then(function (result) {
        const email = result['user']['email'];
        const name = result['user']['displayName'];
        const token = result['user']['ra'];
        apiInstance.register(email, name, token).then(function (data) {
          console.log(result);
          resolve(result);
        }).catch(error => {
          console.log(error);
        });
      }).catch(function (error) {
        // Handle Errors here.
        // var errorCode = error.code;
        const errorMessage = error.message;
        // The email of the user's account used.
        const email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        const credential = error.credential;
        // ...
        reject(errorMessage);
      });
    });
    return promise;
  }

  updatePassword(oldPwd, newPwd) {
    const credential = firebase.auth.EmailAuthProvider.credential(
      firebase.auth().currentUser.email, oldPwd
    );

    // Prompt the user to re-provide their sign-in credentials

    firebase.auth().currentUser.reauthenticateAndRetrieveDataWithCredential(credential).then(function () {
      // User re-authenticated.
      firebase.auth().currentUser.updatePassword(newPwd);
      alert('Password Updated');
    }).catch(function (error) {
      alert('Current password is incorrect');
    });
  }

  // refreshAccessToken() {
  //   return this.apiservice.refreshAccessToken();
  // }

  forgotPassword(email): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      firebase.auth().sendPasswordResetEmail(email).then(function () {
        resolve({ success: true });
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }

  verifyEmail(): Promise<any> {
    const promise = new Promise((resolve, reject) => {
      firebase.auth().currentUser.sendEmailVerification().then(function () {
        resolve({ success: true });
      }).catch(function (error) {
        reject(error);
      });
    });
    return promise;
  }


  logOut() {
    firebase.auth().signOut().then(function () {
      console.log('Sign-out successful.');
    }).catch(function (error) {
      console.log(error);
    });
    localStorage.clear();
  }
}
