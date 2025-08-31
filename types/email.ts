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
