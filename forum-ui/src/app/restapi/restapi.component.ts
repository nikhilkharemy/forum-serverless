import { Component, OnInit } from '@angular/core';
import { AuthorizationService} from '../shared/authorization.service';
import {Http, Headers} from '@angular/http';

export class PersonWithCars {
    constructor(public name: string, public age: number) {}
}

@Component({
    selector: 'app-restapi',
    templateUrl: './restapi.component.html',
    styleUrls: ['./restapi.component.scss']
})
export class RestApiComponent implements OnInit {

    _response: any;
    _data: any;

    constructor(private http: Http, private auth: AuthorizationService) {}

    ngOnInit() {
        const authenticatedUser = this.auth.getAuthenticatedUser();

        if (authenticatedUser == null) {
            window.location.href = '/';
            return;
        }
        const token = authenticatedUser['uid'];
        const headers = new Headers();
        headers.append('Authorization', token);
        const that = this;
            headers.append('Authorization', token);
            console.log(headers);
            this.http.get('https://fag00fi3md.execute-api.ap-south-1.amazonaws.com/beta/articles', {
                headers: headers
            })
            .subscribe(
                response => {
                    that._response = response.json();
                    that._data = that._response.Items;
                },
                error => {
                    console.log(error);
                }
            );

    }

}
