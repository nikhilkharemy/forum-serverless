import { Component, OnInit, Input } from '@angular/core';
import { CommentsComponent } from '../comments/comments.component';
import {AuthorizationService} from '../shared/authorization.service';
import { ApisService } from '../services/apis.service';

@Component({
  selector: 'app-add-reply',
  templateUrl: './add-reply.component.html',
  styleUrls: ['./add-reply.component.scss']
})
export class AddReplyComponent implements OnInit {
	@Input() topId;
	@Input() comId;
	new_reply: string = '';
	userId = '';
	constructor(private commentsComp: CommentsComponent, private auth: AuthorizationService, private apiservice:ApisService) { 
		this.userId = this.auth.getAuthenticatedUser()!= null ? this.auth.getAuthenticatedUser()['username'] : '';
	}
  
  	ngOnInit() {
  	}

  	_addReply(){
  		let new_reply_obj = {
  			comment_text: this.new_reply,
			comment_type: 1,
			acttype: 2,
			created_by: this.userId,
			dislike_count: 0,
			is_reported: 0,
			like_count: 0,
			moderated_by: this.userId,
			pid: this.comId,
			reported_count: 0,
			status: 0,
			topicid: this.topId
  		}
  		this.commentsComp._addReply(new_reply_obj).subscribe(
  			res => {
  				this.new_reply = '';
	  		},
	  		err => {
	  			this.new_reply = '';
	  			alert(err);
	  		}
  		);

  	}

}
