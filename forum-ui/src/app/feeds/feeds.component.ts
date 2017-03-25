import { Component, OnInit, Input } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { AuthorizationService } from '../shared/authorization.service';

@Component({
  selector: 'app-feeds',
  templateUrl: './feeds.component.html',
  styleUrls: ['./feeds.component.scss']
})

export class FeedsComponent implements OnInit {

  feeds: any = [];
  isLoaded = false;
  isLoadedFeeds = false;
  filteredFeeds: any;
  userId;
  start: 0;
  limit: 10;
  
  constructor(private apiService: ApisService, private auth: AuthorizationService) { 
    if(this.auth.getAuthenticatedUser()!=null) {
      this.auth.getAuthenticatedUser().subscribe((data) => {
        this.userId = data['user_id']
        this.getTopicList(this.userId);
      })
    }
  }

  ngOnInit() {
    // console.log(this.userId)
  }
  getTopicList(userId){
    this.apiService.listTopic({userId : userId, start: this.start, limit: this.limit}).subscribe(feeds => {
      this.feeds = feeds;
      this.filteredFeeds = feeds;
      this.isLoadedFeeds = true;
      this.isLoaded = true;
    });
  }
}
