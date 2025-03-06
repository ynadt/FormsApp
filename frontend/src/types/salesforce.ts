export interface SalesforceAccountResponse {
  exists: boolean;
  account?: {
    id: string;
    name: string;
  };
  contact?: {
    id: string;
    lastName: string;
    email: string;
    phone?: string;
  };
}
