export interface SalesforceAccount {
  Id: string;
  Name: string;
}

export interface SalesforceContact {
  Id: string;
  LastName: string;
  Email: string;
  Phone?: string;
}

export interface SalesforceQueryResponse<T> {
  records: T[];
}
