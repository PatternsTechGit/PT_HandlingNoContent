# Handling HTTP 204 - No Content

## What is HTTP 204 - No Content
The HTTP 204 No Content status response code indicates that a request has succeeded, but the server side respond with **no body** or returned **null** result.


# About this exercise

## Backend Code Base:

Previously we have developed an **API** solution in asp.net core in which we have

* EF Code first approach to generate database of a fictitious bank application called **BBBank**.
* We have implemented **AutoWrapper** in BBankAPI project. 

For more details see [data seeding](https://github.com/PatternsTechGit/PT_AzureSql_EFDataSeeding) lab.

## Frontend Codebase
Previously we have angular application in which we have

* FontAwesome library for icons.
* Bootstrap library for styling.
* Created client side models to receive data.
* Created transaction service to call the API.
* Fixed the CORS error on the server side.
* Populated html table, using data returned by API.
* Handled AutoWrapper results.

For more details see [Angular calling API](https://github.com/PatternsTechGit/PT_AngularCallingAPI) lab.


## **In this exercise**

In this exercise again we will be working on both **frontend** & **backend** codebase.

**Backend Codebase**

#### On server side we will:
* Create an **account controller** with method `GetAccountByAccountNumber`.
* Create an **account service** and a contract for this service in the **Service** project.
* Register the **service in asp.net core middleware** as scoped.


**Frontend Codebase**
#### On frontend side we will:
* Create a new form with Image & input field.
* Perform **focusout** & **focusin** events functionality.
* Create client side **models** to map data for API.
* Create the **account service** to call the API.



# Server Side Implementation

Follow the below steps to implement server side code changes:

## Step 1: Create AccountByUserResponse class

We will create a new class named **AccountByUserResponse** in **Entities** project under **Responses** folder which will contain the account related information and user Image url as below :

```cs
public class AccountByUserResponse
    {
        public string AccountId { get; set; }
        public string AccountNumber { get; set; }
        public string AccountTitle { get; set; }
        public decimal CurrentBalance { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public AccountStatus AccountStatus { get; set; }
        public string UserImageUrl { get; set; }
    }
```

## Step 2: Creating Interface for Account Service

In **Services** project create an interface (contract) in **Contracts** folder to implement the separation of concerns.
It will make our code testable and injectable as a dependency.

```csharp
public interface IAccountsService
{
    Task<AccountByUserResponse> GetAccountByAccountNumber(string accountNumber);
}
```

## Step 3: Implementing Account Service 

In **Services** project we will be implementing account service. Create new file **AccountService.cs** In this file we will be implementing **IAccountsService** interface.

 In `GetAccountByAccountNumber` method we are checking if account exists by accountNumber or does not exists. If the account exist then return the AccountByUserResponse object otherwise return null as below   

```csharp
 public class AccountService : IAccountsService
    {
        private readonly BBBankContext _bbBankContext;
        public AccountService(BBBankContext BBBankContext)
        {
            _bbBankContext = BBBankContext;
        }
        public async Task<AccountByUserResponse> GetAccountByAccountNumber(string accountNumber)
        {
            var account =  _bbBankContext.Accounts.Where(x => x.AccountNumber == accountNumber).FirstOrDefault();
            if (account == null)
                return null;
            else
            {
                return new AccountByUserResponse
                {
                    AccountId = account.Id,
                    AccountNumber = account.AccountNumber,
                    AccountStatus = account.AccountStatus,
                    AccountTitle = account.AccountTitle,
                    CurrentBalance = account.CurrentBalance,
                    UserImageUrl = account.User.ProfilePicUrl
                };
            }
        }
    }
```

## Step 4: Dependency Injecting BBBankContext & AccountService 

In `Program.cs` file we will inject the **IAccountsService** to services container, so that we can use the relevant object in services.

```csharp
builder.Services.AddScoped<IAccountsService, AccountService>();
```

## Step 5: SettingUp Accounts Controller 

Create a new API controller named `AccountsController` and inject the `IAccountsService` using the constructor.

```csharp
private readonly IAccountsService _accountsService;
public AccountsController(IAccountsService accountsService)
{
    _accountsService = accountsService;
}
```

Now we will create an API method **GetAccountByAccountNumber** in `AccountsController` to call the service to check either account exists or not.

```csharp
[Route("api/[controller]")]
    [ApiController]
    public class AccountsController : ControllerBase
    {
        private readonly IAccountsService _accountsService;
        public AccountsController(IAccountsService accountsService)
        {
            _accountsService = accountsService;
        }

        [HttpGet]
        [Route("GetAccountByAccountNumber/{accountNumber}")]
        public async Task<ApiResponse> GetAccountByAccountNumber(string accountNumber)
        {
            var account = await _accountsService.GetAccountByAccountNumber(accountNumber);
            if (account == null)
                return new ApiResponse($"no Account exists with accountnumber {accountNumber}", 204);
            return new ApiResponse("Account By Number Returned", account);
        }
    }
```
If the account exists then we will return **ApiResponse** with result.

IF the account does not exists or null then we will return **ApiResponse** with message and **204 status code**. 


Run the project and see its working. 

# Frontend Implementation
Follow the below steps to implement frontend code changes:


## Step 1: Create/Update model classes

Go to `api-Response.ts` in **models** folder and add a new property **statusCode** which will contain the status code received from server side as below:

```ts
export interface ApiResponse {
    isError: boolean;
    message: string;
    statusCode: number;
    responseException: ResponseException;
}
```
Create a new file `account-by-x.ts`  in **models** folder and which will contain account related properties as below:
```ts
import { ApiResponse } from "./api-Response";

 export class AccountByX {
    accountId: string;
    accountTitle: string;
    userImageUrl: string;
    currentBalance: number;
    accountStatus: string;
    accountNumber: string;
  }

  export interface GetAccountByXResponse extends ApiResponse {
    result: AccountByX
  }
```

## Step 2: Setup Account Service

Create a new service `accounts.service.ts` using cli command in **services** folder

```ts
ng g service accounts
```

which will contain the `getAccountByAccountNumber` method which will call the API method to get account information by accountNumber as below :

```ts
export default class AccountsService {
  constructor(private httpClient: HttpClient) { }

  getAccountByAccountNumber(accountNumber: string): Observable<GetAccountByXResponse> {
    return this.httpClient.get<GetAccountByXResponse>(`${environment.apiUrlBase}Accounts/GetAccountByAccountNumber/${accountNumber}`);
  }
}
```

## Step 3: Import FormsModule 
Go to `app.module.ts` file and add **FormsModule** reference in imports as below : 

```ts
import { FormsModule } from '@angular/forms';
imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule ,
    FormsModule
  ],
```

## Step 4: SettingUp UI 
Go to `app.component.html` and add Image control that is bind to the users profile picture, add labels and input field with **focusout** and **focusin** events. All these filed are bind as two way binding to `AccountByX` model.



```ts
<div class="container-fluid">
    <app-toolbar></app-toolbar>
</div>

<div class="row">
    <div class="col-12 col-sm-6">
        <div class="card card-user">
            <div class="card-body">
                <div class="author">
                    <div class="block block-one"></div>
                    <div class="block block-two"></div>
                    <div class="block block-three"></div>
                    <div class="block block-four"></div>

                    <img alt="..." class=" avatar" src="{{toAccount?.userImageUrl}}" />
                    <h5 class="title">{{toAccount?.accountTitle}}</h5>
                    <p class="account-number">{{toAccount?.accountNumber}}</p>
                    <p class="balance">Balance: <b>$ {{toAccount.currentBalance}}</b> <span
                            *ngIf="toAccount?.accountStatus === 'Active'"
                            class="account-status active">Active</span><span
                            *ngIf="toAccount?.accountStatus === 'InActive'"
                            class="account-status inactive">Inactive</span></p>
                    <div class="amount-cont">
                        <div class="error-message">
                            <p class="text-warning">
                                 {{message}}
                            </p>
                        </div>
                        <div class="form-row">
                            <div class="col-sm-2"></div>
                            <div class="col-sm-8 my-1">
                                <input type="text" [(ngModel)]="toAccount.accountNumber"
                                    style="margin-left: 50%; width: 240px;" class="form-control"
                                    id="depositAccountNumber" placeholder="Account number" (focusout)="getToAccount()" (focusin)="clearMessage()">
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>


<router-outlet></router-outlet>
```


## Step 4: Getting Existing Account 

Go to `app.component.ts` and create `getToAccount` function which will be called on **focusout** event of input field. This method will call the 
 `getAccountByAccountNumber` method of `AccountsService`.
 Once the response is received from API then it will check the **statusCode**. If the statusCode is **204** then we will get the error/warning message from **data.result** object. Otherwise we will set the 
toAccount object with received result.

We will create `initializeTo` to empty the form, so that we can reset the form on **ngOnInit** and after **204 error** received.

Here is the code as below :

```ts
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
```

## Step 6: SettingUp Styling
Go to `app.component.css` and add the following **css** for styling. 

```css

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #ffffff;
  background-clip: border-box;
  border: 0.0625rem solid rgba(34, 42, 66, 0.05);
  border-radius: 0.2857rem;
}
.card {
  background: #27293d;
  border: 0;
  position: relative;
  width: 100%;
  margin-bottom: 30px;
  box-shadow: 0 1px 20px 0px rgba(0, 0, 0, 0.1);
}
.card .card-body {
  padding: 15px;
}
.card .card-body .card-description {
  color: rgba(255, 255, 255, 0.6);
}
.card .avatar {
  width: 30px;
  height: 30px;
  overflow: hidden;
  border-radius: 50%;
  margin-bottom: 15px;
}
.card-user {
  overflow: hidden;
}
.card-user .author {
  text-align: center;
  text-transform: none;
  margin-top: 25px;
}
.card-user .author a+p.description {
  margin-top: -7px;
}
.card-user .author .block {
  position: absolute;
  height: 100px;
  width: 250px;
}
.card-user .author .block.block-one {
  background: rgba(225, 78, 202, 0.6);
  background: -webkit-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -o-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -moz-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
  -webkit-transform: rotate(150deg);
  -moz-transform: rotate(150deg);
  -ms-transform: rotate(150deg);
  -o-transform: rotate(150deg);
  transform: rotate(150deg);
  margin-top: -90px;
  margin-left: -50px;
}
.card-user .author .block.block-two {
  background: rgba(225, 78, 202, 0.6);
  background: -webkit-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -o-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -moz-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
  -webkit-transform: rotate(30deg);
  -moz-transform: rotate(30deg);
  -ms-transform: rotate(30deg);
  -o-transform: rotate(30deg);
  transform: rotate(30deg);
  margin-top: -40px;
  margin-left: -100px;
}
.card-user .author .block.block-three {
  background: rgba(225, 78, 202, 0.6);
  background: -webkit-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -o-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -moz-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
  -webkit-transform: rotate(170deg);
  -moz-transform: rotate(170deg);
  -ms-transform: rotate(170deg);
  -o-transform: rotate(170deg);
  transform: rotate(170deg);
  margin-top: -70px;
  right: -45px;
}
.card-user .author .block.block-four {
  background: rgba(225, 78, 202, 0.6);
  background: -webkit-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -o-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: -moz-linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  background: linear-gradient(to right, rgba(225, 78, 202, 0.6) 0%, rgba(225, 78, 202, 0) 100%);
  filter: progid:DXImageTransform.Microsoft.BasicImage(rotation=10);
  -webkit-transform: rotate(150deg);
  -moz-transform: rotate(150deg);
  -ms-transform: rotate(150deg);
  -o-transform: rotate(150deg);
  transform: rotate(150deg);
  margin-top: -25px;
  right: -45px;
}
.card-user .avatar {
  width: 124px;
  height: 124px;
  border: 5px solid #2b3553;
  border-bottom-color: transparent;
  background-color: transparent;
  position: relative;
}
.card-user .card-body {
  min-height: 240px;
}
.card-user hr {
  margin: 5px 15px;
}
.card-user .card-description {
  margin-top: 30px;
}
.title {
  font-weight: 400;
  color: rgba(255, 255, 255, 1);
  font-size: .875rem;
  text-transform: uppercase;
}
.account-number {
  font-size: 1.125rem;
  color: rgba(255, 255, 255, 0.6);
}
.card .balance {
  margin: 25px 0;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.8);
  position: relative;
}
.card .balance b {
  font-weight: 600;
}
.card .balance span.account-status {
  background: #2da3e0;
  margin-left: 10px;
  margin-top: -1px;
  padding: 2px 6px;
  color: #27293d;
  font-size: .75rem;
  border-radius: .25rem;
  text-transform: uppercase;
  /* position: absolute; */
}
.card .balance span.account-status.active {
  background: #2da3e0;
}
.card .balance span.account-status.inactive {
  background: #e3879e;
}
.card .amount-cont {
  color: rgba(255, 255, 255, 0.6);
  font-size: .875rem;
  font-weight: 300;
}
.form-control {
  background-color: #27293d;
  font-size: 1.5rem;
  font-weight: 300;
  color: #fff;
  border: 1px solid #e14eca;
}
.input-group-text {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.5;
  color: #fff;
  background-color: #27293d;
  border: 1px solid #e14eca;
}
.error-message {
  text-align: center;
}
.text-warning {
  color: #ff8d72 !important;
  font-size: .875rem;
  font-weight: 300;
  margin-bottom: 1px;
}

```

------
### Final Output:

Now run the application and see its working as below :  

![NoContent](https://user-images.githubusercontent.com/100709775/182832367-5a050247-56c8-4199-afb4-2466beb4dc6b.gif)



