import { Component, OnInit } from '@angular/core';
import {NgForm} from '@angular/forms';
import {AuthorizationService} from '../shared/authorization.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-register',
    templateUrl: './register.component.html',
    styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {
    confirmCode = false;
    codeWasConfirmed = false;
    error = '';
    email: string;
    password: string;
    errorMsg = '';
    pass: '';
    cpass: '';
    loading: boolean = false;
    emailVerificationMessage: boolean = false;
    loginErrorMsg: boolean = false;
    mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    urlformat = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

    constructor(private auth: AuthorizationService,
        private _router: Router) {}

    ngOnInit() {
        if (this.auth.getAuthenticatedUser() != null) {
            this._router.navigateByUrl('/restapi');
        }
        // handle facebook redirect result
        this.auth.isSocialLoggenIn().then((result) => {
            if (result['user'] != null) {
            localStorage.setItem('email', result['user']['email']);
            localStorage.setItem('displayName', result['user']['displayName']);
            localStorage.setItem('refreshToken', result['user']['refreshToken']);
            localStorage.setItem('accessToken', result['user']['ra']);
            this.loading = false;
            window.location.href = '/restapi';
            return;
            }
        })
        .catch((err) => {
            console.log(err);
        });
    }

    register(form: NgForm) {
        this.loginErrorMsg = false;
        this.loading = true;
        this.email = form.value.email;
        const name = form.value.name;
        this.password = form.value.password;
        this.auth.register(this.email, this.password, name).then(
            (data) => {
        this.auth.verifyEmail().then(() => {
            localStorage.setItem('email', data['user']['email']);
                localStorage.setItem('displayName', data['user']['displayName']);
                localStorage.setItem('refreshToken', data['user']['refreshToken']);
                localStorage.setItem('accessToken', data['user']['ra']);
                this.loading = false;
                window.location.href = '/restapi';
        }, (err) => {});
            }, (err) => {
                this.loading = false;
                this.loginErrorMsg = true;
                this.errorMsg = err;
            }
        );
    }
    facebookLogin() {
        this.auth.facebookLogin();
    }
    googleLogin() {
        this.auth.googleLogin();
    }
}
