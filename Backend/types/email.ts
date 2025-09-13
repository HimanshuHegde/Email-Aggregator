export interface Email {
  id ?: number
  subject :string
  body :string
  from :string
  to :string
  folder :string
  name :string
  aiLabel :string
  date :Date 
  accountId :number
  // account? :string
}

export interface Accounts{
    email: string;
    AppPass: string;
    userId?: number;
}

export interface Res {
  uid: number;
  message: {
    account: string;
    from: string;
    to: string;
    folder: string;
    subject: string;
    name: string;
    body?: string;
    date: Date;
  };
}
