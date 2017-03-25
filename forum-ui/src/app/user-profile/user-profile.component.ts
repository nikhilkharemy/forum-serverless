import { Component, OnInit, ViewChild, Input } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { NgForm } from '@angular/forms';
import { Http, Headers } from '@angular/http';
import { AuthorizationService } from '../shared/authorization.service';
import { FormBuilder, FormGroup } from '@angular/forms';
import { environment } from '../../environments/environment';
// import { HomeComponent } from '../home/home.component';

@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrls: ['./user-profile.component.scss']
})
export class UserProfileComponent implements OnInit {
  user_id: string;
  user_email: string = localStorage.email ? localStorage.email : '';
  countries: any;
  states: any;
  cities: any;
  userImg: any;
  oldPwd: any = '';
  newPwd: any = '';
  newPwd2: any = '';
  languages: any;
  selectedItems = [];
  dropdownSettings = {};
  filesToUpload: File;
  imgUpdClicked: boolean = false;
  profileUpdClicked: boolean = false;
  passUpdClicked: boolean = false;
  err1 = false;
  err2 = false;
  success = false;
  user_profile_pic = localStorage.userImage ? localStorage.userImage : 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
  user = {
    country: { id: "0", name: "" },
    name: localStorage.displayName ? localStorage.displayName : '',
    profile_pic: localStorage.profile_pic ? localStorage.profile_pic : '',
    gender: "0",
    contact: "",
    state: { id: "0", name: "" },
    city: { id: "0", name: "" },
    address: "",
    // profile_pic: "",
    languages: [],
    user_id: "",
    is_new: true
  };

  genders = [{ id: 1, value: "Male" }, { id: 2, value: "Female" }, { id: 3, value: "Transgender" }];
  constructor(private route: ActivatedRoute, private apiService: ApisService, private auth: AuthorizationService, private http: Http) {
    // const that = HeaderComponent.this;
    // console.log(that)
    // this.route.params.subscribe(params => {
    //   this.user_id = params['userId'];
    //   this.user.user_id = this.user_id;
    // });
    this.auth.isLoggedIn().then((result) => {
      this.user_id = result['user']['uid'];
      this.apiService._getUserProfile(this.user_id).subscribe(data => {
        if (data['userDetail'].Count > 0) {
          let resp = data['userDetail'].Items[0];
          this.user.country.id = resp.user_country ? resp.user_country.id : this.user.country;
          this.user.country.name = resp.user_country ? resp.user_country.name : this.user.country;
          this.user.state.id = resp.user_state ? resp.user_state.id : this.user.state;
          this.user.state.name = resp.user_state ? resp.user_state.name : this.user.state;
          this.user.city.id = resp.user_city ? resp.user_city.id : this.user.city;
          this.user.city.name = resp.user_city ? resp.user_city.name : this.user.city;
          this.user.languages = resp.user_languages ? resp.user_languages : this.user.languages;
          this.user.user_id = resp.user_user_id ? resp.user_user_id : this.user.user_id;
          this.user.name = resp.user_name ? resp.user_name : this.user.name;
          this.user.gender = resp.user_gender ? resp.user_gender : this.user.gender;
          this.user.address = resp.user_address ? resp.user_address : this.user.address;
          this.user.is_new = resp.user_id ? false : true;
          this.user.contact = resp.contact ? resp.contact : this.user.contact;
          if (this.user.country.id !== '0') {
            this.getStates();
          }
          if (this.user.state.id !== '0') {
            this.getCities();
          }
        }
      });
    });
    this.apiService._getCountries().subscribe(data => {
      this.countries = data['data'];
    });
    this.languages = this.apiService.languages;
    this.dropdownSettings = {
      singleSelection: true,
      idField: 'id',
      textField: 'name',
      selectAllText: 'Select All',
      unSelectAllText: 'UnSelect All',
      itemsShowLimit: 3,
      allowSearchFilter: true
    };
  }

  ngOnInit() {
    // this.apiService._getUserProfile(this.user_id).subscribe(data => {
    // 	if(data.Count > 0)
    // })
  }
  getStates() {
    this.apiService._getStates(this.user.country.id).subscribe(data => {
      this.states = data['data'];
    });
  }
  getCities() {
    this.apiService._getCities(this.user.state.id).subscribe(data => {
      this.cities = data['data'];
    });
  }
  getFiles(event) {
    this.filesToUpload = event.target.files[0];
  }
  updatePassword(form: NgForm) {
    const oldPwd = form.value.oldPwd;
    const newPwd = form.value.newPwd;
    const newPwd2 = form.value.newPwd2;

    this.err1 = false;
    this.err2 = false;

    if (newPwd !== newPwd2) {
      this.err1 = true;
    } else if (newPwd.length < 6) {
      this.err2 = true;
    } else {
      this.auth.updatePassword(oldPwd, newPwd);
    }
  }
  onSubmit(form: NgForm) {
    if (this.user.country.id != "0") {
      let country = this.countries.find(x => (x['id'] == this.user.country.id))
      this.user.country.name = country['name'];
    }
    if (this.user.state.id != "0") {
      let state = this.states.find(x => (x['id'] == this.user.state.id))
      this.user.state.name = state['name'];
    }
    if (this.user.city.id != "0") {
      let city = this.cities.find(x => (x['id'] == this.user.city.id))
      this.user.city.name = city['name'];
    }
    const authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {
      return;
    }
    this.auth.isLoggedIn().then((result) => {
      const token = result['user']['ra'];
      this.user.user_id = result['user']['uid'];
      const headers = new Headers();
      headers.append('authorization', token);
      this.apiService._updateProfile(this.user, token).subscribe(data => {
      localStorage.setItem('userName', this.user.name);
      window.location.reload();
      });
    });
  }
  updateImage() {
    var formData: any = new FormData();
    let imgName = Date.now() + '.' + this.filesToUpload.type.replace('image/', '');
    formData.append('user_id', this.user_id);
    formData.append('name', imgName);
    formData.append("uploads", this.filesToUpload, this.filesToUpload.name);
    this.http.post(environment.api_url + '/user/update/profile-file', formData).subscribe(data => {
      if (data.status == 200) {
        this.user_profile_pic = environment.profile_img_bucket_url + imgName;
        localStorage.setItem('userImage', environment.profile_img_bucket_url + imgName);
        this.imgUpdClicked = !this.imgUpdClicked;
        window.location.reload()
      }
      else {
        alert('error found')
      }
    })
  }
  onItemSelect(item: any) {
    // this.user.languages.push(item);
    console.log(this.user.languages);
  }
  onSelectAll(items: any) {
    this.user.languages = items;
  }

}
