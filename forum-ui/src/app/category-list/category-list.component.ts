import { Component, OnInit } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { AuthorizationService} from '../shared/authorization.service';
import { Router } from '@angular/router';

export interface Category {
	id: number;
	slug: string;
	name: string;
	desc: string;
	langId: number;
	userId: string;
}
export interface Channels {
	id: number;
	name: string;
}

@Component({
  selector: 'app-category-list',
  templateUrl: './category-list.component.html',
  styleUrls: ['./category-list.component.scss']
})

export class CategoryListComponent implements OnInit {

	categories: any;
	catData : Category = {
		id: 0,
		name: '',
		slug: '',
		desc: '',
		langId: 1,
		userId: ''
	};
	userId;
  p: any;
	channels: Channels[];
	editBtnClicked: boolean = false;

  	constructor(private apiService: ApisService, private router:Router, private _auth: AuthorizationService) {
  		this.channels = this.apiService.channels;
  		this.fetchCategories()
	}

  	ngOnInit() {
  	
  	}
  	
  	fetchCategories(){
  		this.apiService._fetchCategories().subscribe(data => {
  			this.categories = data['data']
  		})
  	}
  	addEditCat(data, type) {
  		// console.log(type)
  		// console.log(data)
      if(type == 'edit') {
  			this.catData.id = data.termId;
  			this.catData.slug = data.catSlug;
  			this.catData.name = data['term_details.termDetailName'];
  			this.catData.desc = data['term_details.termDetailDesc'];
  			this.catData.langId = data['term_details.langId'];
  			this.catData.userId = data['createBy']
  		}
  		else{
        this._auth.getAuthenticatedUser().subscribe((result) => {
          this.userId = result['user_id'];
    			this.catData.id = 0;
    			this.catData.slug = '';
    			this.catData.name = '';
    			this.catData.desc = '';
    			this.catData.langId = 1;
    			this.catData.userId = this.userId;
        });
  		}
  		this.editBtnClicked = true
  	}
  	onSubmit(){
  		this.apiService._createOrUpdateCat(this.catData).subscribe(data => {
  			if(data['success']){
  				this._window().location.href = '/categorylist/';
  				// this.router.navigate(['/categorylist/']);
      			return true;
  			}
  			else{
  				alert('error found')
  			}
  		}) 
  	}
  	_window(): any {
    	return window;
  	}

}
