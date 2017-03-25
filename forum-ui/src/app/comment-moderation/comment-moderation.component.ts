import { Component, OnInit } from '@angular/core';
import {AuthorizationService} from '../shared/authorization.service';
import { ApisService } from '../services/apis.service';

@Component({
  selector: 'app-comment-moderation',
  templateUrl: './comment-moderation.component.html',
  styleUrls: ['./comment-moderation.component.scss']
})
export class CommentModerationComponent implements OnInit {
  comments: any;
  reports: any;
  showReportedList: boolean = false;

  constructor(private apisService: ApisService) { }

  ngOnInit() {
    this.getReportedComments();
  }

  getReportedComments(){
    this.apisService._getReportedComments().subscribe(data => {
      this.comments = data['data'];
    });
  }

  activity(action, commentId, tId){
    let userdata = {action:action,commentId:commentId, topicId: tId};
    this.apisService._updateReportStatus(userdata).subscribe(data =>{
      let index = this.comments.findIndex(x => (x['id'] == commentId));
      this.comments.splice(index,1);
    });
    
  }
  showReportList(commentId){
    this.apisService._getCommentReportsList(commentId).subscribe(data =>{
      this.reports = data['data'];
      this.showReportedList = true;
    });
  }

}
