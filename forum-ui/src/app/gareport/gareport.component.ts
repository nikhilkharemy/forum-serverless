import { Component, OnInit, ViewChild } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { AuthorizationService } from '../shared/authorization.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';

export interface Country {
  name: string;
  flag: string;
  area: number;
  population: number;
}

@Component({
  selector: 'app-gareport',
  templateUrl: './gareport.component.html',
  styleUrls: ['./gareport.component.scss']
})

export class GareportComponent implements OnInit {

  p: any;
  searchChannel: any = '';
  searchCategory: any = '';
  sortingCriteria: any = '4';
  feeds: any = [];
  isLoaded = false;
  isLoadedFeeds = false;
  filteredFeeds: any;
  userId;
  offset = 0;
  limit = 10;
  editBtnClicked = false;
  topic;
  categories: any;
  isReset: boolean = false;
  isFilter: boolean = false;
  channels;
  sortOn;
  source = ['Default', 'Web', 'Android'];
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
  anchors: any;
  filterDate: any;
  filterAnchor: any = [];
  dropdownSettings: any;
  totalTopics: any = 0;
  totalComments: any = 0;
  totalReportedComments: any = 0;
  totalLikes: any = 0;
  totalViews: any = 0;
  userRole: any;

  alltags = [
  ];
  selectedTags = [

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

  constructor(private apiService: ApisService, private router: Router, private auth: AuthorizationService) {
    this.channels = this.apiService.channels;
    this.sortOn = this.apiService.sortOn;
    let token = localStorage.getItem('accessToken');
    this.apiService._getUserRole(localStorage.getItem('userId'), token).subscribe(data => {
      if (data['success']) {
        this.userRole = data['data'].uType;
        this.userId = localStorage.getItem('userId');
        if (data['data'].uType == 2) {
          this.searchChannel = data['data'].defaultLanguage == 6 ? '3' : data['data'].defaultLanguage ? data['data'].defaultLanguage : '';
          // this.searchChannel = data['data'].defaultLanguage == 6 ? '' : data['data'].defaultLanguage;
          this.fetchTopics(localStorage.getItem('userId'));
        }
        else {
          this.getAnchorList();
          this.fetchTopics(0);
        }
        this.fetchCategories(this.searchChannel);
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  ngOnInit() {
    // this.getAnchorList();
  }
  fetchTopics(userId: any = 0, cPage: any = 1) {
    this.apiService.countTopic({ anchorId: userId, offset: this.offset, limit: this.limit, language: this.searchChannel }).subscribe(feeds => {
      if (feeds['success'] && feeds['totalTopics'] > 0) {
        this.totalTopics = feeds['totalTopics'];
        this.totalComments = feeds['totalComments'];
        this.totalLikes = feeds['totalLikes'];
      }
      this.isLoadedFeeds = true;
      this.isLoaded = true;
    });
  }
  fetchCategories(langId) {
    langId = langId > 0 ? langId : 0;
    this.apiService._fetchCategories(langId).subscribe(data => {
      this.categories = data['data'];
      this.searchCategory = '';
    })
    if (this.userRole == 1)
      this.getAnchorList();
  }
  onSubmit() {
    this.topic.anchor = 0;

    if (this.topic.userId == 0) {
      this.topic.anchor = 0;
    } else {
      this.topic.anchor = 1;
    }
    if (this.topic.seo.title == '') {
      this.topic.seo.title = this.topic.eng_title + ' | ' + this.topic.title
    }
    if (this.topic.seo.description == '') {
      this.topic.seo.description = this.topic.description
    }
    // console.log(this.topic);return;
    this.apiService.updateTopic(this.topic).subscribe(data => {
      if (data['success']) {
        this._window().location.href = '/topiclist';
        // this.router.navigate(['/topic-list']);
      }
    },
      error => {
        console.error("Error saving topic!");
        return Observable.throw(error);
      });
  }
  getAnchorList() {
    let channel = this.searchChannel > 0 ? this.searchChannel : 0;
    this.apiService._getAnchorList(channel).subscribe(data => {
      this.anchors = data;
      this.anchors.push({
        dispName: "All Anchors",
        dispPic: "",
        uType: "all",
        userId: "-1"
      },
        {
          dispName: "All Admin",
          dispPic: "",
          uType: "all",
          userId: "-2"
        },
        {
          dispName: "All Users",
          dispPic: "",
          uType: "all",
          userId: ""
        })
      this.filterAnchor = [{
        dispName: "All Users",
        dispPic: "",
        uType: "all",
        userId: ""
      }];
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
  _window(): any {
    return window;
  }
  filterData() {
    const postData = {};
    if (this.filterAnchor && this.filterAnchor.length) {
      Object.assign(postData, { anchorId: this.filterAnchor[0].userId });
    }
    if (this.filterDate && this.filterDate.length) {
      let startDate = new Date(this.filterDate[0]).getFullYear() + '-' + (new Date(this.filterDate[0]).getMonth() + 1) + '-' + new Date(this.filterDate[0]).getDate();
      let endDate = new Date(this.filterDate[1]).getFullYear() + '-' + (new Date(this.filterDate[1]).getMonth() + 1) + '-' + new Date(this.filterDate[1]).getDate();
      Object.assign(postData, { startDate: startDate, endDate: endDate })
    }
    if (this.searchChannel && this.searchChannel > 0) {
      Object.assign(postData, { language: this.searchChannel });
    }
    if (this.searchCategory && this.searchCategory > 0) {
      Object.assign(postData, { category: this.searchCategory });
    }
    if (this.sortingCriteria && this.sortingCriteria > 0) {
      Object.assign(postData, { sortOn: this.sortingCriteria });
    }
    if (this.userRole == 2) {
      Object.assign(postData, { anchorId: this.userId });
    }
    this.apiService.countTopic(postData).subscribe(feeds => {
      if (feeds) {
        this.totalTopics = feeds['totalTopics'];
        this.totalComments = feeds['totalComments'];
        this.totalLikes = feeds['totalLikes'];
      } else {
        this.totalTopics = 0;
        this.totalComments = 0;
        this.totalReportedComments = 0;
        this.totalLikes = 0;
        this.totalViews = 0;
      }
      this.feeds = feeds;
      this.filteredFeeds = feeds;
      this.isLoadedFeeds = true;
      this.isLoaded = true;
      this.isFilter = false;
      this.isReset = true;
    });
  }
  resetData() {
    const postData = { anchorId: 0, language: '', sortingCriteria: '4' };
    this.filterAnchor = [{
      dispName: "All Users",
      dispPic: "",
      uType: "all",
      userId: ""
    }];
    this.apiService.countTopic(postData).subscribe(feeds => {
      if (feeds) {
        this.totalTopics = feeds['totalTopics'];
        this.totalComments = feeds['totalComments'];
        this.totalLikes = feeds['totalLikes'];
      } else {
        this.totalTopics = 0;
        this.totalComments = 0;
        this.totalReportedComments = 0;
        this.totalLikes = 0;
        this.totalViews = 0;
      }
      this.feeds = feeds;
      this.filteredFeeds = feeds;
      this.isLoadedFeeds = true;
      this.isLoaded = true;
      this.isFilter = false;
      this.isReset = false;
      this.sortingCriteria = '4';
    });
  }
  onItemSelect(item: any) {
    this.isFilter = true;
    this.isReset = true;
    // console.log(item);
    // console.log(this.selectedTags);
  }
  OnItemDeSelect(item: any) {
    // console.log(item);
    // console.log(this.selectedTags);
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
    this.selectedTags.push({ id: index + 1, itemName: items })
  }
  loadArticles(pageNo) {
    this.offset = (pageNo * 10) - 9;
    this.fetchTopics(0, pageNo)

  }

  getCategoryName(catID, langID) {
    let catDetails = this.categories.filter(x => (x['termId'] == catID && x['term_details.langId']));
    return catDetails[0]['term_details.termDetailDesc'];
  }

}
