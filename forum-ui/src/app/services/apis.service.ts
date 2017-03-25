import { Injectable, OnInit } from '@angular/core';
import { HttpClient, HttpHeaders, HttpRequest, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { catchError, retry } from 'rxjs/operators';
import { environment } from '../../environments/environment';
import { Http, Headers } from '@angular/http';


export interface Language {
    id: number;
    name: string;
}

const httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' })
};

const apiurl = environment.api_url;

@Injectable({
    providedIn: 'root'
})
export class ApisService {

    languages: Language[] = [
        { id: 1, name: 'English' },
        { id: 2, name: 'Hindi' },
        { id: 3, name: 'Marathi' },
        { id: 4, name: 'Bengali' },
        { id: 5, name: 'Gujarati' },
        { id: 6, name: 'Punjabi' }
    ];
    channels = [
        { id: 1, name: 'English' },
        { id: 3, name: 'Hindi' },
        { id: 5, name: 'Marathi' },
        { id: 7, name: 'Bengali' },
        { id: 4, name: 'Gujarati' },
        { id: 6, name: 'Ganga' },
        { id: 519, name: 'Punjabi' }
    ];
    sortOn = [
        { id: 1, name: 'Comments (Max)' },
        { id: 10, name: 'Comments (Min)' },
        { id: 2, name: 'Likes (Max)' },
        { id: 20, name: 'Likes (Min)' },
        { id: 3, name: 'Views (Max)' },
        { id: 30, name: 'Views (Min)' },
        { id: 4, name: 'CreatedDate (Latest)' },
        { id: 40, name: 'CreatedDate (Oldest)' }
        // {id: 5, name: 'Reported Comments'}
    ];

    constructor(private http: HttpClient) {

    }

    createTopic(topic: any) {
        let body = JSON.stringify(topic);
        return this.http.post(apiurl + '/topic/create', body, httpOptions);
    }
    updateTopic(topic: any) {
        let body = JSON.stringify(topic);
        return this.http.post(apiurl + '/topic/update', body, httpOptions);
    }
    // createTopic(articleId: any, channelId: any, anchorId: any = 0){

    //     let body = JSON.stringify({articleUrl: articleId, isID: 1, channelId: channelId, user_id: anchorId});
    //     return this.http.post(apiurl + '/topic/create',body, httpOptions);

    // signIn(email: any, password: any) {
    //     let body = JSON.stringify({email: email, password: password});
    //     return this.http.post(apiurl + '/user/login', body, httpOptions);
    // }
    isTokenValid(token: any) {
        const body = JSON.stringify({ token: token });
        return this.http.post(apiurl + '/user/verifyToken', body, httpOptions);
    }
    register(email: any, name: any, token: any): Promise<any> {
        const promise = new Promise((resolve, reject) => {
            const body = JSON.stringify({ email: email, name: name, token: token });
            // resolve(this.http.post(apiurl + '/user/new', body, httpOptions));
            const httpOptions = {
                headers: new HttpHeaders({
                    'Content-Type': 'application/json',
                    'Authorization': token
                })
            };
            this.http.post(apiurl + '/user/new', body, httpOptions).subscribe((data2) => {
                resolve(data2);
            }, (err) => {
                reject(err);
            });
        });
        return promise;
    }
    // refreshAccessToken() {
    //     return this.http.post(apiurl + '/user/refreshAccessToken', '', {responseType: 'text'});
    // }
    // signOut() {
    //     return this.http.post(apiurl + '/user/logout', '', httpOptions);
    // }
    // updatePassword(password: any) {
    //     const body = JSON.stringify({password: password});
    //     return this.http.post(apiurl + '/user/refreshAccessToken', body, httpOptions);
    // }
    // resetPassword(email: any) {
    //     const body = JSON.stringify({email: email});
    //     return this.http.post(apiurl + '/user/resetPassword', body, httpOptions);
    // }
    listTopic(select: any, user: any = 'user') {
        select['isApp'] = '0';
        let body = JSON.stringify(select);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        if (user == 'admin') {
            return this.http.post(apiurl + '/topic/admin-list', body, httpOptions);
        } else {
            return this.http.post(apiurl + '/topic/list', body, httpOptions);
        }
    }
    countTopic(select: any) {
        select['isApp'] = '0';
        let body = JSON.stringify(select);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
            return this.http.post(apiurl + '/topic/count-admin-list', body, httpOptions);
    }
    getTopicDetail(id, userId = 0) {
        let data = { userId: userId }
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/topic/getById/' + id, data, httpOptions);
    }
    _addComment(comment_data: any) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/comment/create', comment_data, httpOptions);
    }
    _getUserName(userId) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/user/find/' + userId, httpOptions);
    }
    _getReplies(comId) {
        let data = { offset: 0, limit: 10 };
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/comment/getReplies/' + comId, data);
    }
    _updateView(recordDetail) {
        return this.http.post(apiurl + '/topic_views/create', recordDetail);
    }
    _getUserProfile(userId) {
        return this.http.get(apiurl + '/user/profile/' + userId);
    }
    _getCountries() {
        return this.http.get(apiurl + '/countries');
    }
    _getStates(countryId) {
        return this.http.get(apiurl + '/states/' + countryId);
    }
    _getCities(stateId) {
        return this.http.get(apiurl + '/cities/' + stateId);
    }
    _updateProfile(userData, token) {
        // const headers = new Headers();
        // headers.append('authorization', token);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': token
            })
        };
        return this.http.post(apiurl + '/user/profile/update', userData, httpOptions);
    }

    _commentReport(userData) {
        // const headers = new Headers();
        // headers.append('authorization', token);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/commentactivity/create', userData, httpOptions);
    }

    _followTopic(userData) {
        // const headers = new Headers();
        // headers.append('authorization', token);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/topic/follow', userData, httpOptions);
    }

    _getTopicWatchlist(userData) {
        // const headers = new Headers();
        // headers.append('authorization', token);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/topic/isfollowed', userData, httpOptions);
    }

    _getReportedComments() {
        // const headers = new Headers();
        // headers.append('authorization', token);
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.get(apiurl + '/comment/getcommentreportlist', httpOptions);
    }

    _updateReportStatus(userdata) {
        // const headers = new Headers();
        // headers.append('authorization', token);
        // if(userdata.action == 'approve'){
        // }
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': localStorage.accessToken ? localStorage.getItem('accessToken') : ''
            })
        };
        return this.http.post(apiurl + '/comment/updatereport', userdata, httpOptions);
    }
    _getCommentReportsList(cId) {
        // const httpOptions = {
        //     headers: new HttpHeaders({
        //         'Content-Type':  'application/json',
        //         //'Authorization': token
        //     })
        // };
        return this.http.get(apiurl + '/comment/getcommentReports/' + cId, httpOptions);
    }
    _getAnchorList(langId) {
        return this.http.get(apiurl + '/user/anchorNadmin/list/' + langId, httpOptions);
    }
    _fetchStory(data) {
        return this.http.post(apiurl + '/topic/fetchWPStory', data);
    }
    _fetchCategories(language = 3) {
        return this.http.get(apiurl + '/term/all/' + language);
    }
    _createOrUpdateCat(data) {
        let body = JSON.stringify(data);
        return this.http.post(apiurl + '/term/createOrUpdate', data, httpOptions);
    }
    _window(): any {
        return window;
    }
    _getUserRole(userId, token) {
        const httpOptions = {
            headers: new HttpHeaders({
                'Content-Type': 'application/json',
                'Authorization': token
            })
        };
        return this.http.get(apiurl + '/user/role/' + userId, httpOptions);
    }
    _getUserRoleUsingEmail(email: any) {
        const body = JSON.stringify({ email: email });
        return this.http.post(apiurl + '/user/roleUsingEmail', body, httpOptions);
    }
    convertToSlug = (Text) => {
        return Text
            .toLowerCase()
            .replace(/[^\w ]+/g, '')
            .replace(/ +/g, '-')
            ;
    }

    getLang(lang) {
        lang = Number(lang);
        let langCode = '';
        switch (lang) {
            case 1:
                langCode = "en";
                break;
            case 6:
                langCode = "en";
                break;
            case 4:
                langCode = "gu";
                break;
            case 5:
                langCode = "mr";
                break;
            case 7:
                langCode = "bn";
                break;
            case 519:
                langCode = "pa";
                break;
            default:
                langCode = "hi";
        }
        return langCode
    }

}
