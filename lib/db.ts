import { neon } from '@neondatabase/serverless';

const sql = neon(process.env.DATABASE_URL!);

export { sql };

// Types
export type Kid = {
  id: number;
  name: string;
  grade: string | null;
  shoe_size: string | null;
  parent_name: string | null;
  parent_email: string | null;
  parent_phone: string | null;
  notes: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Equipment = {
  id: number;
  type: 'shoes' | 'broom';
  size: string | null;
  brand: string | null;
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  status: 'available' | 'checked_out' | 'retired';
  notes: string | null;
  photo_url: string | null;
  created_at: Date;
  updated_at: Date;
};

export type Checkout = {
  id: number;
  equipment_id: number;
  kid_id: number;
  checked_out_at: Date;
  returned_at: Date | null;
  notes: string | null;
};

export type CheckoutWithDetails = Checkout & {
  kid_name: string;
  equipment_type: 'shoes' | 'broom';
  equipment_size: string | null;
  equipment_brand: string | null;
};
