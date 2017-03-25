import { Component, OnInit, Input } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { Observable } from 'rxjs/Observable';
import { AuthorizationService} from '../shared/authorization.service';

@Component({
  selector: 'app-comments',
  templateUrl: './comments.component.html',
  styleUrls: ['./comments.component.scss']
})
export class CommentsComponent implements OnInit {
	@Input() comments;
	@Input() topId;
 	defaultImage = 'https://cdn.pixabay.com/photo/2015/10/05/22/37/blank-profile-picture-973460_960_720.png';
	constructor(private apiservice:ApisService, private auth: AuthorizationService) {
  }

	ngOnInit() {
	}

	_addComment(comment){
    // console.log(comment);return;
    // console.log(this.userId);return;
    return Observable.create(observer => {
  		this.apiservice._addComment(comment).subscribe(
       	topic => {
            comment['created_date'] = topic['created_date'];
            comment['author_name'] = localStorage.getItem('userName');
            comment['author_image'] = localStorage.getItem('userImage') ? localStorage.getItem('userImage') : this.defaultImage;
  		      this.comments.push(comment);
            observer.next({success: true});
            observer.complete();
        },
        err => {
          observer.error(err);
        }
      );
    });
	}
  _getReplies(comId) {
    this.apiservice._getReplies(comId).subscribe(
      replies => {
        let index = this.comments.findIndex(x => (x['id'] == comId));
        this.comments[index]['replies'] = replies;
      },
      err => {
        console.log(err);
      }
    );
  }
  _addReply(reply) {
    return Observable.create(observer => {
      this.apiservice._addComment(reply).subscribe(
        topic => {
            reply['created_date'] = topic['created_date'];
            reply['author_name'] = localStorage.getItem('userName');
            reply['author_image'] = localStorage.getItem('userImage') ? localStorage.getItem('userImage') : this.defaultImage;
            let index = this.comments.findIndex(x => (x['id'] == reply.pid));
            this.comments[index]['replies'].push(reply);
            this.comments[index].reply_count++;
            observer.next({success: true});
            observer.complete();
        },
        err => {
          observer.error(err);
        }
      );
    });
  }

  reportComment(commentid,datapost){
    // console.log(datapost);return;
    this.apiservice._commentReport(datapost).subscribe(
      comment => {
        let index = this.comments.findIndex(x => (x['id'] == commentid));
        //this.comments.splice(index,1);
        return true;
       },
       error => {
        console.error("Error saving topic!");
        return Observable.throw(error);
       }
    );
  }
  

}
