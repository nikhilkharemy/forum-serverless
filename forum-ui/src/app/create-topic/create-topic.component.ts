import { Component, OnInit } from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import { NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { detachEmbeddedView } from '@angular/core/src/view';
import { ApisService } from '../services/apis.service';
import { Observable } from 'rxjs';
import { AuthorizationService } from '../shared/authorization.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';

export interface Category {
  id: number;
  name: string;
}

export interface Language {
  id: number;
  name: string;
}

@Component({
  selector: 'app-create-topic',
  templateUrl: './create-topic.component.html',
  styleUrls: ['./create-topic.component.scss']
})
export class CreateTopicComponent implements OnInit {
  categories = []
  languages: Language[] = [{ id: 2, name: 'Hindi' },
  { id: 3, name: 'Marathi' },
  { id: 4, name: 'Bengali' },
  { id: 5, name: 'Gujarati' },
  { id: 6, name: 'Punjabi' }]

  channels: any;
  p: any;
  config: AngularEditorConfig = {
    editable: true,
    spellcheck: true,
    height: '20rem',
    minHeight: '20rem',
    placeholder: 'Enter text here...',
    translate: 'no',
    customClasses: [
      {
        name: "quote",
        class: "quote",
      },
      {
        name: 'redText',
        class: 'redText'
      },
      {
        name: "titleText",
        class: "titleText",
        tag: "h1",
      },
    ]
  };
  details = [];
  dropdownSettings: any;
  articleId: any;
  topic = {
    "eng_title": "",
    "title": "",
    "channel": '',
    "is_featured": 1,
    "cat_id": "",
    "tags": [],
    "description": "",
    "referer": "wordpress",
    "userId": "0",
    "created_by": "",
    "anchor": 0,
    "articleId": 0,
    "seo": {
      "title": '',
      "description": '',
      "keywords": '',
      "regional_keywords": '',
      "website_url": ''
    },
    "slug": '',
    "category": { id: 0, name: "", isNew: 0 },
    "image": "",
    // "topic_details" : [{
    //   "lang_id":"",
    //   "title":"",
    //  "description":""
    // }] 
  }
  userId;
  anchors: any;
  articleErr: any = '';
  public start: Date = new Date("10/07/2017");
  public end: Date = new Date("11/25/2017");
  alltags = [
  ];
  selectedItems = [

  ];
  tagsDropdownSettings = {
    singleSelection: false,
    text: "Select Tags",
    selectAllText: 'Select All',
    unSelectAllText: 'UnSelect All',
    enableSearchFilter: true,
    addNewItemOnFilter: true,
    classes: "myclass custom-class col-12 col-md"
  };
  userRole: any;

  constructor(private apiservice: ApisService, private router: Router, private _auth: AuthorizationService) {
    this.channels = this.apiservice.channels;
    this.channels.push({ id: 6, name: 'Abpganga' });
    this._auth.getAuthenticatedUser().subscribe((result) => {
      this.userId = result['user_id'];
      let token = localStorage.getItem('accessToken');
      this.apiservice._getUserRole(this.userId, token).subscribe(data => {
        if(data['success']){
          this.userRole = data['data'].uType;
        }
      })
    });

  }

  ngOnInit() {
    // this.getAnchorList();
    // this.fetchCategories();
  }

  onSubmit(form: NgForm) {
    // let eng_lang_object: any =  {
    //   "lang_id": 1, 
    //   "title": this.topic.eng_title, 
    //   "description": this.topic.description
    // };
    // this.topic.topic_details.push(eng_lang_object);
    // this.topic.userId = this.topic.userId[0].userId;
    // console.log(this.topic);return;
    this.topic.anchor = 0;
    if (this.topic.userId == "0") {
      this.topic.userId = this.userId;
      this.topic.anchor = 0;
    } else {
      this.topic.anchor = 1;
    }
    if(this.userRole == 2){
      this.topic.anchor = 1;
      this.topic.userId = this.userId;
    }
    if (this.topic.seo.title == '') {
      this.topic.seo.title = this.topic.eng_title + ' | ' + this.topic.title
    }
    if (this.topic.seo.description == '') {
      this.topic.seo.description = this.topic.description
    }
    this.topic.created_by = this.userId;
    // console.log(this.topic);return;
    this.apiservice.createTopic(this.topic).subscribe(data => {
      this.router.navigate(['/restapi/']);
      return true;
    },
      error => {
        console.error("Error saving topic!");
        return Observable.throw(error);
      });
    // this.apiservice.createTopic(this.articleId, this.topic.channel, created_by).subscribe(
    //        topic => {
    //           let slug = topic['topic']['topic_slug']
    //           if(slug[slug.length -1] == '-')
    //             slug = slug.slice(0, -1);
    //           // this.router.navigate(['/topic/'+slug+'-'+topic['id']])
    //           this.router.navigate(['/restapi/'])
    //           return true;
    //         },
    //         error => {
    //          console.error("Error saving topic!");
    //          return Observable.throw(error);
    //         }
    //   );
  }
  createTopicSlug() {
    if (this.topic.eng_title != '') {
      this.topic.slug = this.apiservice.convertToSlug(this.topic.eng_title)
    }
  }

  addlanguagediv() {
    this.details.push(this.details.length);
  }
  getAnchorList(langId) {
    this.apiservice._getAnchorList(langId).subscribe(data => {
      this.anchors = data
      this.topic.userId = "0";
      this.dropdownSettings = {
        singleSelection: true,
        idField: 'userId',
        textField: 'dispName',
        // selectAllText: 'Select All',
        // unSelectAllText: 'UnSelect All',
        // itemsShowLimit: 3,
        addNewItemOnFilter: true,
        allowSearchFilter: true
    };
    });
  }
  fetchStory() {
    if(this.articleId.includes('-')){
      let articleUrl = this.articleId.split('-');
      this.topic.articleId = articleUrl[articleUrl.length - 1]
    }
    else{
      this.topic.articleId = this.articleId
    }
    console.log(this.topic.articleId)
    // return;
    this.articleErr = '';
    let data = {
      wp_id: this.topic.articleId,
      channel: this.topic.channel
    };
    this.apiservice._fetchStory(data).subscribe((data) => {
      if (data['success'] == false && data['msg'] == 'exists') {
        this.articleErr = '*Topic with this id already exists!';
        return;
      }
      else {
        if (data['tags']) {
          data['tags'].forEach((tag, index) => {
            this.addNewItem(tag, index);
          })
        }
        this.topic.seo = data['seo'];
        this.topic.seo.title = this.topic.seo.title.replace(/\\/g, '')
        this.topic.seo.description = this.topic.seo.description.replace(/\\/g, '')
        this.topic.seo.keywords = this.topic.seo.keywords.replace(/\\/g, '')
        this.topic.seo.regional_keywords = this.topic.seo.regional_keywords.replace(/\\/g, '')
        this.topic.seo.website_url = data['website_url'];
        this.topic.title = data['title'].replace(/\\/g, '');
        this.topic.description = data['excerpt'].replace(/\\/g, '');
        this.topic.eng_title = data['title_en'].replace(/\\/g, '');
        this.topic.image = data['thumbnail_large'];
        let catIndex = this.categories.findIndex(x => (x['catSlug'] == data['section_slug'] && x['term_details.termDetailName'] == data['section']));
        // let catIndex = this.categories.findIndex(x => (x['catSlug'] == data['all_category_data'][0]['slug']));
        // console.log(data['all_category_data'][0]['slug'])
        if (catIndex != -1) {
          this.topic.cat_id = this.categories[catIndex]['termId']
          this.topic.category = this.categories[catIndex]
        }
        else {
          // console.log(data['all_category_data'][0]);return;
          let newCat = { id: 0, name: data['section'], termId: 0, isNew: 1, catSlug: data['section_slug'] };
          newCat['term_details.termDetailName'] = data['section'];
          this.categories.push(newCat);
          // console.log(this.categories)
          this.topic.category = newCat;
          this.topic.cat_id = this.categories[this.categories.length - 1]['termId'];
        }
        // console.log(this.topic);return;
        this.topic.slug = this.apiservice.convertToSlug(data['title_en'])
      }
    })
  }
  fetchCategories() {
    let langId = this.channels.find(data => (data.name == this.topic.channel))
    this.getAnchorList(langId.id);

    // console.log(langId)
    this.apiservice._fetchCategories(langId.id).subscribe(data => {
      this.categories = data['data'];
      // this.topic.cat_id = 0;
    })
  }
  onItemSelect(item: any) {
    // console.log(item);
    // console.log(this.selectedItems);
  }
  OnItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.selectedItems);
  }
  onSelectAll(items: any) {
    // console.log(items);
  }
  onDeSelectAll(items: any) {
    // console.log(items);
  }
  addNewItem(items: any, index) {
    // console.log(index);
    if (!index)
      index = this.alltags.length;
    this.alltags.push({ id: index + 1, itemName: items });
    this.topic.tags.push({ id: index + 1, itemName: items })
  }

}
