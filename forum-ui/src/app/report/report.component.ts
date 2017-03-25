import { Component, OnInit, Input } from '@angular/core';
import { CommentsComponent } from '../comments/comments.component';
import { AuthorizationService } from '../shared/authorization.service';
import { ApisService } from '../services/apis.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

@Component({
  selector: 'app-report',
  templateUrl: './report.component.html',
  styleUrls: ['./report.component.scss']
})
export class ReportComponent implements OnInit {
  @Input() comId;
  showdiv: boolean = false;
  isOtherClicked: any = 0;
  userId: any;
  reportreason : string = '';
  reportreasontext : string = '';

  constructor(private commentsComp: CommentsComponent, private auth: AuthorizationService, private apiservice:ApisService,private router: Router) { 
    this.auth.getAuthenticatedUser().subscribe((result) => {
      this.userId = result['user_id'];
    });
		// this.userId = this.auth.getAuthenticatedUser()!= null ? this.auth.getAuthenticatedUser()['username'] : '';
	}

  ngOnInit() {
  }

  showOthers(val){

  }
  
  reportComment(commentid){   
    let reasontoreport : string = '';
    if( this.reportreason == 'other'){
      reasontoreport = this.reportreasontext;
    }else{
      reasontoreport = this.reportreason;
    }
    let datapost = {cId:commentid,createBy:this.userId,actType:5,report_reasons:reasontoreport};
    this.commentsComp.reportComment(commentid, datapost);
    this.showdiv = false;
  }
}
