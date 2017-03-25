import { Component, OnInit, ViewChild } from '@angular/core';
import { ApisService } from '../services/apis.service';
import { AuthorizationService } from '../shared/authorization.service';
import { AngularEditorConfig } from '@kolkov/angular-editor';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
// import undefined = require('firebase/empty-import');

export interface Country {
    name: string;
    flag: string;
    area: number;
    population: number;
}

@Component({
    selector: 'app-topic-list',
    templateUrl: './topic-list.component.html',
    styleUrls: ['./topic-list.component.scss']
})

export class TopicListComponent implements OnInit {
    p: any;
    searchChannel: any = '';
    searchCategory: any = '';
    sortingCriteria: any = '4';
    feeds: any = [];
    isLoaded = false;
    isLoadedFeeds = false;
    loading: boolean = false;
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
    totalTopicsPagination: any = [];
    filterdCategories: any = [];

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
                    this.fetchTopics(localStorage.getItem('userId'), 1);
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
        Object.assign(postData, { offset: this.offset });
        Object.assign(postData, { limit: this.limit });
        Object.assign(postData, { totalTopics: this.offset > 0 ? this.totalTopics : 0 });
        const pageNo = (this.offset + 10) / 10;
        this.setTopicVariables(postData, 'admin', pageNo);
        // this.setTopicVariables({ anchorId: userId, offset: this.offset, limit: this.limit, language: this.searchChannel, totalTopics: this.offset > 0 ? this.totalTopics : 0 }, 'admin', cPage);
    }
    setTopicVariables(postData, type = 'admin', cPage = 0) {
        this.loading = true;
        this.apiService.listTopic(postData, type).subscribe(feeds => {
            if (feeds['success'] && feeds['totalTopics'] > 0 && this.offset == 0) {
                this.totalTopicsPagination = [];
                this.totalTopics = feeds['totalTopics'];
                let Obj = { id: "0" }
                for (let i = 0; i < feeds['totalTopics'] ; i++) {
                    Obj = { 'id': `${i}` }
                    this.totalTopicsPagination.push(Obj)
                }
            }
            this.p = cPage
            this.feeds = feeds['topicList'];
            this.filteredFeeds = feeds['topicList'];
            this.isLoadedFeeds = true;
            this.isLoaded = true;
            this.filterdCategories = this.categories;
            this.loading = false;
            this.isFilter = false;
            this.isReset = true;
        });
    }
    editModal(feedData) {
        // this.topic = feedData;
        this.topic = {};
        this.selectedTags = [];
        if (feedData.tTags != '' && feedData.tTags != null) {
            let tags = feedData.tTags.split(',');
            tags.forEach((tag, index) => {
                this.addNewItem(tag, index);
            })
        }
        let metaDetail = feedData.article_details.length ? JSON.parse(feedData.article_details[0].meta_details) : [];
        let lang = this.channels.find(data => data.id == (feedData.langId == 6 ? 3 : feedData.langId));
        this.topic = {
            "id": feedData.tId,
            "eng_title": feedData.engTitle ? feedData.engTitle.replace(/\\/g, '') : '',
            "title": feedData.tTitle ? feedData.tTitle.replace(/\\/g, '') : '',
            "channel": lang.name,
            "cat_id": feedData.categoryId ? feedData.categoryId : '',
            "description": feedData.tDescription ? feedData.tDescription.replace(/\\/g, '') : '',
            "referer": feedData.refId > 0 ? feedData.refId : '',
            "tags": feedData.tTags != '' ? this.selectedTags : [],
            "userId": feedData.isAnchor == 1 ? feedData.createBy : 0,
            "created_by": feedData.modifiedBy ? feedData.modifiedBy : '',
            "articleId": feedData.refId > 0 ? feedData.refId : 0,
            "seo": {
                "title": metaDetail.title ? metaDetail.title.replace(/\\/g, '') : '',
                "description": metaDetail.description ? metaDetail.description.replace(/\\/g, '') : '',
                "keywords": metaDetail.keywords ? metaDetail.keywords.replace(/\\/g, '') : '',
                "regional_keywords": metaDetail.regional_keywords ? metaDetail.regional_keywords.replace(/\\/g, '') : ''
            },
            "slug": feedData.tSlug ? feedData.tSlug : '',
            "category": { id: 0, name: "", isNew: 0 },
            "image": feedData.tImage ? feedData.tImage : "",
        }
        if (this.userRole == 2) {
            this.topic.anchor = 1;
            this.topic.userId = this.userId;
        }
        // this.topic.createBy = this.topic.isAnchor == 1 ? this.topic.createBy : 0;
        this.editBtnClicked = true
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
        this.offset = 0;
        const postData = {offset: 0};
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
        this.setTopicVariables(postData, 'admin', 0);
    }
    resetData() {
        this.offset = 0;
        const postData = { anchorId: 0, language: '', sortingCriteria: '4', offset: 0 };
        this.filterAnchor = [{
            dispName: "All Users",
            dispPic: "",
            uType: "all",
            userId: ""
        }];
        this.setTopicVariables(postData, 'admin', 0);
    }
    onItemSelect(item: any) {
        this.isFilter = true;
        this.isReset = true;
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
        this.offset = (pageNo * 10) - 10;
        this.fetchTopics(0, pageNo);
    }

    getCategoryName(catID, langID) {
        let catDetails = this.categories.filter(x => (x['termId'] == catID && x['term_details.langId']));
        return catDetails[0]['term_details.termDetailDesc'];
    }

}
