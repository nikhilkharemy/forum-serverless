import { Injectable } from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import { Observable } from 'rxjs/Observable';
import { Feed } from '../models/Feeds';

@Injectable({
  providedIn: 'root'
})
export class FeedsService {
  // feedsUrl = 'https://jsonplaceholder.typicode.com/posts';
  // feedsUrl = 'https://search.niklive.in/english/_search?q=(tags:%22news%22)%20&from=0&size=18&sort=post_date:desc';
  feedsUrl = 'https://search.niklive.in/english/_search?q=(post_type:%22post%22)%20&from=0&size=28&sort=post_date:desc';

  constructor(private http: HttpClient) {}

  getFeeds(): Observable<Feed> {
    return this.http.get<Feed>(this.feedsUrl);
  }
}
