export interface Booking {
  id: string;
  booking_code: string;
  name: string;
  phone: string;
  email?: string;
  service_name: string;
  booking_date: string;
  booking_time: string;
  quantity: number;
  status: string;
}
