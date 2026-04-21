export interface InventoryTransactionItem {
  id?: number;
  product_id: number;
  product_name?: string;
  quantity: number;
  unit_price: number;
  total_price?: number;
  note?: string;
}

export interface InventoryTransaction {
  id: number;
  code: string;
  type: "IMPORT" | "EXPORT" | "ADJUST";
  note?: string;
  total_extra_cost: number;
  transaction_date: string;
  created_at: string;
  items: InventoryTransactionItem[];
}
