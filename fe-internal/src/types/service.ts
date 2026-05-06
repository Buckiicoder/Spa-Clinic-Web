export interface ServicePackage {
  id?: number;
  name: string;
  price: number;
  total_sessions?: number;
  unit: string;
  duration_per_unit?: number;
  is_active?: boolean;
}

export interface Service {
  id: number;
  name: string;
  area?: string | null;
  parent_id?: number | null;
  description?: string;
  duration?: number;
  is_active: boolean;

  packages: ServicePackage[];
}
