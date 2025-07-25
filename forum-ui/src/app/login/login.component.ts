import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from '../shared/authorization.service';
import {NgForm} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    templateUrl: './login.component.html',
    styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
    emailVerificationMessage: boolean = false;
    errorMsg: string;
    loading:boolean = false;
    mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    urlformat = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

    constructor(private auth: AuthorizationService,
        private _router: Router) {
    }

    ngOnInit() {
        if (this.auth.getAuthenticatedUser() != null) {
            this._router.navigateByUrl('/restapi');
        }
        // handle facebook/google redirect result
        // this.auth.isSocialLoggenIn().then((result) => {
        //     if (result['user'] != null) {
        //         localStorage.setItem('email', result['user']['email']);
        //         localStorage.setItem('displayName', result['user']['displayName']);
        //         localStorage.setItem('refreshToken', result['user']['refreshToken']);
        //         localStorage.setItem('accessToken', result['user']['ra']);
        //         this.loading = false;
        //         window.location.href = '/restapi';
        //     }
        // })
        // .catch((err) => {
        //     console.log(err);
        // });
    }

    onSubmit(form: NgForm) {
        this.loading = true;
        const email = form.value.email;
        const password = form.value.password;
        if(email.split('@')[1] !== 'niknews.in'){
            this.loading = false;
            this.errorMsg = 'You are not authorized to perform this action';
            this.emailVerificationMessage = true;
        }
        else{
            this.auth.adminSignIn(email, password).then((data) => {
                // console.log(data);return;
                // store user details in local storage
                localStorage.setItem('email', data['user']['email']);
                localStorage.setItem('userId', data['user']['uid']);
                localStorage.setItem('displayName', data['user']['displayName']);
                localStorage.setItem('refreshToken', data['user']['refreshToken']);
                localStorage.setItem('accessToken', data['user']['ra']);
                this.loading = false;
                window.location.href = '/restapi';
            }, (err) => {
                this.loading = false;
                this.errorMsg = err.message;
                this.errorMsg = err;
                this.emailVerificationMessage = true;
            });
        }
    }
    // facebookLogin() {
    //     this.loading = true;
    //     this.auth.facebookLogin();
    // }
    // googleLogin() {
    //     this.loading = true;
    //     this.auth.googleLogin();
    // }
}
