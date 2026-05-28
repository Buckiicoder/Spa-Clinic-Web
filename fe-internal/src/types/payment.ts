export interface CustomerUnpaidProfile {
  profile_id: number;
  customer_id: number;
  service_id: number;
  package_id: number;
  total_sessions: number;
  used_sessions: number;
  status: string;
  started_at?: string;
  completed_at?: string;
  service_name: string;
  package_name: string;
  package_price: number;
  payment_id?: number;
  payment_code?: string;
  final_amount?: number;
  paid_amount?: number;
  remaining_amount?: number;
  payment_status?: string;
}
