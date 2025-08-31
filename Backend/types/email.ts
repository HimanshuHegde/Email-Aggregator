export interface Email {
  id?: string;
  subject: string;
  body: string;
  from: string;
  to: string;
  account: string;
  folder: string;
  name?: string;
  aiLabel?: string;
  date?: Date; 
}

export interface Accounts{
    email: string;
    password: string;
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
