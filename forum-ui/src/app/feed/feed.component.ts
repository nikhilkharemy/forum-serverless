import { Component, OnInit, Input } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { AuthorizationService} from '../shared/authorization.service';

@Component({
  selector: 'app-feed',
  templateUrl: './feed.component.html',
  styleUrls: ['./feed.component.scss']
})
export class FeedComponent implements OnInit {

  @Input() feed;
  @Input() comments;
  @Input() topId;
  @Input() isCommentable;
  userId;

  isFollowed: boolean = false;
  
  constructor(private apisService: ApisService, private auth: AuthorizationService){
    this.userId = this.auth.getAuthenticatedUser()!= null ? this.auth.getAuthenticatedUser()['username'] : '';  
  }

  convertUTCDateToLocalDate(date) {
    date = new Date(date);
    const newDate = new Date(date.getTime() + date.getTimezoneOffset() * 60 * 1000);
    const offset = date.getTimezoneOffset() / 60;
    const hours = date.getHours();
    newDate.setHours(hours - offset);
    var date1 = new Date();
    var timeDiff = Math.abs(date.getTime() - date1.getTime());
    var diffDays = Math.ceil(timeDiff / (1000 * 3600 * 24));
    return newDate.toLocaleString();
  }

  genPostTags() {
    return;
  }

  ngOnInit() {
    // this.isFollowed = this.feed.topic_watchlists.length > 0 && this.feed.topic_watchlists[0].follower == this.userId ? true : false;
    this.isFollowed = this.feed.topic_watchlists.length > 0  ? true : false;
  }

  followTopic(topicId, type){
    console.log(this.topId)
    let datapost = {topic_id: topicId, user_id:this.userId, type: type};
    this.apisService._followTopic(datapost).subscribe(data => {
      this.isFollowed = type == 1 ? true : false;
    });    
  }

}
