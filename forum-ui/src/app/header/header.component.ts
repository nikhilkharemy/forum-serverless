import { Component, OnInit, Injectable, Inject, Input } from "@angular/core";
import { AuthorizationService } from "../shared/authorization.service";
import { Router } from "@angular/router";

@Component({
  selector: "app-header",
  templateUrl: "./header.component.html",
  styleUrls: ["./header.component.scss"]
})
export class HeaderComponent implements OnInit {
  name: string = "No Name";
  image: string =
    "https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png";
  email: string;
  openNav = false;
  @Input() isLoggedIn;

  constructor(private _auth: AuthorizationService, private _router: Router) {
    if (localStorage.accessToken) {
      this._auth.isLoggedIn().then(
        data => {
          if (data.success) {
            this.isLoggedIn = true;
            localStorage.setItem("accessToken", data["user"]["ra"]);
            localStorage.setItem("userId", data["user"]["uid"]);
          } else {
            this.isLoggedIn = false;
          }
        },
        err => {
          this._router.navigate(["/login"]);
        }
      );
    }
  }

  ngOnInit() {
    let email = localStorage.getItem("email");
    if (email != null) {
      this.name = localStorage.getItem("displayName");
      this.image = localStorage.getItem("userImage")
        ? localStorage.getItem("userImage")
        : this.image;
      this.email = email;
    }
  }
  // notificationDdn = false;
  // profileDdn = false;

  // toggleNtfDdn() {
  //   this.profileDdn = false;
  //   this.notificationDdn = !this.notificationDdn;
  // }

  // toggleProfileDdn() {
  //   this.notificationDdn = false;
  //   this.profileDdn = !this.profileDdn;
  // }

  doLogout() {
    this._auth.logOut();
    window.location.href = "/login";
  }
  getAuth() {
    return this._auth;
  }
  openDropdown(e) {
    e.preventDefault();
    console.log(e);
  }
  toggleNav() {
    this.openNav ? (this.openNav = false) : (this.openNav = true);
  }
}
