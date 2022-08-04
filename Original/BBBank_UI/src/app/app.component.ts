import { Component, OnInit } from '@angular/core';
import { LineGraphData } from './models/line-graph-data'
import { TransactionService } from './services/transaction.service';
import {AccountByX} from './models/account-by-x';
import AccountsService from './services/accounts.service';
@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  title = 'BBBankUI';
  lineGraphData: LineGraphData;
  toAccount: AccountByX;
  message:string
  constructor(private transactionService: TransactionService,private accountsService: AccountsService) { }

  ngOnInit(): void {
   
    this.initializeTo();
    this.transactionService
      .getLast12MonthBalances('')
      .subscribe({
        next: (data) => {
          this.lineGraphData = data.result;
        },
        error: (error) => {
          console.log(error.responseException.exceptionMessage);
        },
      });
  }

  getToAccount() {
    this.accountsService
      .getAccountByAccountNumber(this.toAccount.accountNumber)
      .subscribe({
        next: (data) => {
          if (data.statusCode == 204) {
            this.initializeTo();
            this.message = String(data.result);
          }
          else {
            this.toAccount = data.result
          }
        },
        error: (error) => {
          this.message = String(error);
        },
      });
  }

  clearMessage(){
    this.message='';
  }

  initializeTo() {
    this.toAccount = new AccountByX();
    this.toAccount.userImageUrl = '../../../assets/images/No-Image.png'
  }
}
