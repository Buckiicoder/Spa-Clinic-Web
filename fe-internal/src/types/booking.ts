export interface Booking {
  id: string;

  booking_code: string;

  customer_id: number;

  service_id: number;

  name: string;

  phone: string;

  email?: string;

  service_name: string;

  booking_date: string;

  booking_time: string;

  quantity: number;

  status: string;

  // payment
  has_unpaid_payment: boolean;

  unpaid_profiles: number;
}