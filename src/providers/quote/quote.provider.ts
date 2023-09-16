import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import 'rxjs/add/operator/toPromise';
import { IListing, IQuote } from "./quote.interface";
import { IHolding } from "../holdings/holdings.interface";

@Injectable()
export class QuoteProvider {

  public listings: IListing[];

  constructor(public http: HttpClient) {
  }

  // Get a list of all cryptocurrency listings.
  getListings(): Promise<IListing[]> {
    return new Promise((resolve, reject) => {
      if (this.listings) resolve(this.listings);
      let apiURL = `https://api.coinmarketcap.com/v2/listings/`;
      this.http.get(apiURL)
        .map((res: any) => res.data)
        .toPromise()
        .then(listings => resolve(listings))
        .catch(reject);
    });
  }

  filterListings(searchTerm): Promise<IListing[]> {
    return new Promise((resolve, reject) => {
      this.getListings()
        .then(listings => {
          let filteredListings = listings.filter((listing: IListing) => {
            return listing.name.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1 ||
              listing.symbol.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1;
          });
          resolve(filteredListings);
        })
        .catch(reject);
    })
  }

  getQuotes(holdings: IHolding[]): Promise<IQuote[]> {
    return Promise.all(holdings.map(holding => this.getQuote(holding.id)));
  }

  // Get the ticker data for a specific cryptocurrency.
  getQuote(id: number): Promise<IQuote> {
    let apiURL = `https://api.coinmarketcap.com/v2/ticker/${id}/?convert=BTC`;
    return this.http.get(apiURL)
      .map((res: any) => res.data)
      .toPromise();
  }

  getIcon(id: number, size: number): string {
    return `https://s2.coinmarketcap.com/static/img/coins/${size}x${size}/${id}.png`
  }

}
