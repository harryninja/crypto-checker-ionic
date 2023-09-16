import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class NewsProvider {

  constructor(public http: HttpClient) {
  }

  getNews() {
    let apiURL = `https://min-api.cryptocompare.com/data/v2/news/?lang=PT`;
    return this.http.get(apiURL)
      .map((res: any) => res.Data)
      .toPromise();
  }

}
