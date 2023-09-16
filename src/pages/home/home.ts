import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { QuoteProvider } from "../../providers/quote/quote.provider";
import { HoldingsProvider } from "../../providers/holdings/holdings.provider";
import { IHolding } from "../../providers/holdings/holdings.interface";
import { UtilityProvider } from "../../providers/utility/utility.provider";
import { ItemSliding } from 'ionic-angular';
import { default as swal } from "sweetalert2";
import { CurrencyPipe } from '@angular/common';

// GSAP.
import { TweenMax, Linear } from "gsap/TweenMax";

declare const SplitText: any;


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  holdings: IHolding[] = [];
  isDisplayFiat: boolean = false;
  refreshOnLoad: boolean = true;

  constructor(public navCtrl: NavController,
    public holdingsProvider: HoldingsProvider,
    public quoteProvider: QuoteProvider,
    public utilityProvider: UtilityProvider,
    public currencyPipe: CurrencyPipe) {
  }

  ionViewDidEnter() {
    if (this.refreshOnLoad) this.loadHoldings();
  }

  animateText(classId: string, price: string) {
    setTimeout(() => {
      TweenMax.to(classId, 2, {
        scrambleText: {
          text: price,
          chars: "0123456789",
          ease: Linear.easeNone,
          speed: 0.7
        }
      })
    }, 500);
  }

  toggleDisplay() {
    this.isDisplayFiat = !this.isDisplayFiat;
  }

  getIconImage(holding: IHolding): string {
    return this.quoteProvider.getIcon(holding.id, 64);
  }

  getTotalBalance(currency: string): string {
    let amount = this.holdings.length > 0 ? this.holdings.reduce((amount, holding: IHolding) => amount + holding.quote.quotes[currency].price * holding.amount, 0) : 0;
    let description = "";
    if (currency === "USD") {
      description = this.currencyPipe.transform(amount, "USD").toString();
    }
    else {
      description = amount.toFixed(2).toString() + " BTC";
    }
    return description;
  }

  addCoin() {
    this.refreshOnLoad = true;
    this.navCtrl.push('SelectCoinPage');
  }

  editCoin(holding: IHolding, index: number, slidingItem: ItemSliding) {
    this.refreshOnLoad = true;
    slidingItem.close();
    this.navCtrl.push('EditHoldingPage', { holding, index });
  }

  loadHoldings(refresher?) {
    this.utilityProvider.displayLoading();
    this.holdingsProvider.loadHoldings(refresher).then((holdings: IHolding[]) => {
      this.holdings = holdings;
      this.animateText("#total-balance-USD", this.getTotalBalance("USD"));
      this.animateText("#total-balance-BTC", this.getTotalBalance("BTC"));
      this.utilityProvider.dismissLoading();
    }).catch(_ => {
      this.utilityProvider.dismissLoading();
    });
  }

  refreshHoldings(refresher) {
    this.loadHoldings(refresher);
  }

  removeCoin(holding: IHolding) {
    this.holdingsProvider.removeHolding(holding).then((holdings: IHolding[]) => this.holdings = holdings)
      .then(() => {
        swal({
          title: `Coin Removida!`,
          text: `${holding.quote.name} foi removida do seu portfólio!`,
          confirmButtonClass: "btn btn-success",
          type: "success"
        });
      });
  }

  promptRemoveCoin(holding: IHolding, index: number, slidingItem: ItemSliding) {
    slidingItem.close();
    swal({
      title: 'Remover Coin?',
      text: `Tem certeza que deseja remover ${holding.quote.name} do seu portfólio?`,
      type: 'warning',
      showCancelButton: true,
      confirmButtonClass: "btn btn-success",
      cancelButtonClass: "btn btn-danger",
      confirmButtonText: 'Sim'
    }).then((result) => {
      if (result.value) this.removeCoin(holding);
    }).catch(console.log);
  }

  coinInfo(holding: IHolding) {
    this.refreshOnLoad = false;
    this.navCtrl.push('CoinInfoPage', { holding });
  }

}
