import { Component, OnInit } from '@angular/core';
import { AccountByX } from './models/account-by-x';
import { LineGraphData } from './models/line-graph-data'
import AccountsService from './services/accounts.service';
import { TransactionService } from './services/transaction.service';

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
