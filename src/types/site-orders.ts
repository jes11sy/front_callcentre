export interface SiteOrder {
  id: number;
  city: { id: number; name: string } | null;
  site: string;
  clientName: string;
  phone: string;
  status: string;
  comment: string | null;
  commentOperator: string | null;
  callbackAt: string | null;
  createdAt: string;
  orderId: number | null;
}

export interface SiteOrdersResponse {
  data: SiteOrder[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

