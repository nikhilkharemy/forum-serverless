import { Component, OnInit } from '@angular/core';
import {Router, ActivatedRoute } from '@angular/router';
import { ApisService } from '../services/apis.service';
import { AuthorizationService} from '../shared/authorization.service';
import { Observable } from 'rxjs';


@Component({
  selector: 'app-topic-details',
  templateUrl: './topic-details.component.html',
  styleUrls: ['./topic-details.component.scss']
})
export class TopicDetailsComponent implements OnInit {
  isLoaded = false;
  userId : any = '';
  feed: any;
  comments: any;
  topicId: any;
  constructor(private route:ActivatedRoute, private apiService: ApisService, private auth: AuthorizationService) { 
    if (this.auth.getAuthenticatedUser() != null) {
      this.auth.getAuthenticatedUser().subscribe(data => {
        this.userId = data['user_id'];
        this.route.params.subscribe(params => {
          const url = params['id'].split('-'); 
          this.topicId = url[url.length-1];
          this.updateTopicView();
        });
      }, err => {
        console.log(err)
      })
    }
    // this.userId = this.auth.getAuthenticatedUser()!= null ? this.auth.getAuthenticatedUser()['username'] : '';
    
  }

  ngOnInit() {
      
  }
  getTopicDetail(id){
    this.apiService.getTopicDetail(id, this.userId).subscribe(detail => {
      this.feed = {...this.feed, ...detail['topic']};
      this.feed['topic_details'] = detail['topic_details'];
      this.comments = detail['comments'];
      this.isLoaded = true;
    });
  }

  followTopic(topicId){
    
    let datapost = {topic_id:topicId, user_id:this.userId};
    
    return Observable.create(observer => {
  		this.apiService._followTopic(datapost).subscribe(
        watchlist => {
            observer.next(watchlist);
            observer.complete();
        },
        err => {
          observer.error(err);
        }
      );
    });
  }
  updateTopicView(){
    let recordDetail = {user_id: this.userId, topic_id: this.topicId};
    this.apiService._updateView(recordDetail).subscribe(detail => {
      this.getTopicDetail(this.topicId);
    });
  }

  topicWatchlist(topicId){
    let datapost = {topic_id:this.topicId, user_id:this.userId};
    return Observable.create(observer => {
  		this.apiService._getTopicWatchlist(datapost).subscribe(
        watchlist => {
          observer.next(watchlist);
          observer.complete();
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

}
