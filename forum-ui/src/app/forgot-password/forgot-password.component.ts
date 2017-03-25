import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from '../shared/authorization.service';
import {NgForm} from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './forgot-password.component.html',
  styleUrls: ['./forgot-password.component.scss']
})
export class ForgotPasswordComponent implements OnInit {
	confirmCode: boolean = false;
	errorMsg: string;
	forgetErr: boolean = false;
	sentCode: boolean = false;
	loading: boolean = false;
    codeWasConfirmed: boolean = false;
	email: '';
	mailformat = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
	urlformat = /^(http[s]?:\/\/){0,1}(www\.){0,1}[a-zA-Z0-9\.\-]+\.[a-zA-Z]{2,5}[\.]{0,1}/;

  	constructor(private auth: AuthorizationService, private _router: Router) {

  	}

  	ngOnInit(){
		if(this.auth.getAuthenticatedUser() != null){
			this._router.navigateByUrl('/restapi');
		}
 	}

  	forgotPassword(form: NgForm) {
  		this.loading = true;
    	this.forgetErr = false;
	    const email = form.value.email;
	    this.forgetErr = false;
	    this.auth.forgotPassword(email).then((data) => {
  			this.loading = false;
			if(data.success){
				this.codeWasConfirmed = true;
			}
	    }, (err) => {
  			this.loading = false;
	    	this.forgetErr = true;
	      	this.errorMsg = err.message;
	    })
	    
  	}

  	// resetPassword(form: NgForm){
  	// 	this.loading = true;
  	// 	this.sentCode = false;
    // 	this.forgetErr = false;
  	// 	let code = form.value.code;
  	// 	let password = form.value.password;
  	// 	this.auth.resetPassword(this.email, code, password).subscribe((data) => {
  	// 		this.loading = false;
	// 		if(data.success){
	// 			this.codeWasConfirmed = true;
	// 		}
	//     }, (err) => {
  	// 		this.loading = false;
	//     	this.forgetErr = true;
	//       	this.errorMsg = err.message;
	//     })
  	// }
}
