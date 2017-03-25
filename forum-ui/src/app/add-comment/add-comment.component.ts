import { Component, OnInit, Input } from '@angular/core';
import { CommentsComponent } from '../comments/comments.component';
import {AuthorizationService} from '../shared/authorization.service';
import { ApisService } from '../services/apis.service';
import {Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-add-comment',
  templateUrl: './add-comment.component.html',
  styleUrls: ['./add-comment.component.scss']
})
export class AddCommentComponent implements OnInit {
	topId;
	new_comment: string = '';
	userId = '';
	constructor(private route:ActivatedRoute, private commentsComp: CommentsComponent, private auth: AuthorizationService, private apiservice:ApisService) { 
		if(this.auth.getAuthenticatedUser()!=null) {
	      this.auth.getAuthenticatedUser().subscribe((data) => {
	        this.userId = data['user_id']
	        // this.getTopicList();
	      })
		}	
		this.route.params.subscribe(params => {
			const url = params['id'].split('-'); 
			this.topId = url[url.length-1];
		});	
	}

	ngOnInit() {
  	}

  	_addComment(){
  		let new_comment_obj = {
			commentText: this.new_comment,
			commentType: 0,
			actType: 1,
			createBy: this.userId,
			dislikeCount: 0,
			isReported: 0,
			likeCount: 0,
			moderatedBy: this.userId,
			pId: 0,
			reportedCount: 0,
			cStatus: 0,
			tId: this.topId
  		}
  		this.commentsComp._addComment(new_comment_obj).subscribe(
  			res => {
  				this.new_comment = '';
	  		},
	  		err => {
	  			this.new_comment = '';
	  			alert(err);
	  		}
  		);

  	}

}
