import { Component, OnInit, Input, Injectable } from '@angular/core';
import { AuthorizationService } from '../shared/authorization.service';
import { Http, Headers } from '@angular/http';
import { ApisService } from '../services/apis.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})

@Injectable({
  providedIn: 'root'
})
export class HomeComponent implements OnInit {
  bAuthenticated = false;
  userId;
  feeds: any;
  isLoadedFeeds = false;
  filteredFeeds: any;
  searchText = '';
  userRole: any;
  userLang: any;
  constructor(private apiService: ApisService, private http: Http, private auth: AuthorizationService) { 
  }

  toggleDropdown($e) {
    return;
  }

  ngOnInit() {
    const authenticatedUser = this.auth.getAuthenticatedUser();
    if (authenticatedUser == null) {
      return;
    }
    let email = localStorage.getItem('email');
    let userId = localStorage.getItem('userId');
    let token = localStorage.getItem('accessToken');
    this.apiService._getUserRole(userId, token).subscribe(data => {
      if(data['success']){
        this.userRole = data['data'].uType;
      }
    })
    this.bAuthenticated = true;
  }
  _search(key){
    // var that = this;
    let filteredResults: any;
    if(this.feeds!=undefined){
      this.searchText = key.toLowerCase();
      filteredResults = this.feeds.filter(x => (x.eng_title.toLowerCase().includes(this.searchText) || x.tags.toLowerCase().includes(this.searchText) || x.topic_slug.toLowerCase().includes(this.searchText)));
      this.filteredFeeds = filteredResults;
    }
  }

}
