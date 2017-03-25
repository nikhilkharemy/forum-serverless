import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { AuthorizationService} from './authorization.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
	constructor(private _authService: AuthorizationService, private _router: Router){}

	canActivate(): any {
		if (localStorage['email'] != null) {
			return true;
		} else {
			this._router.navigate(['/login']);
			return false;
		}
		// this._authService.isLoggedIn().then(
	 //      data => {
	 //      	console.log(data)
	 //        if (data.success) {
	 //          return true;
	 //        } else {
	 //          return false;
	 //        }
	 //      },
	 //      err => {
	 //        // this._router.navigate(["/login"]);
	 //        return false;
	 //      }
	 //    );
	}
}
