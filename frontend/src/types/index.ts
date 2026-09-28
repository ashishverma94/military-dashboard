export type Role = "ADMIN" | "BASE_COMMANDER" | "LOGISTICS_OFFICER";

export type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  baseId: string | null;
};

export type Asset = {
  id: string;
  name: string;
  type: "WEAPON" | "VEHICLE" | "AMMUNITION" | "OTHER";
  unit: string;
  description?: string | null;
};

export type Base = { id: string; name: string; location: string };

export type Dashboard = {
  period: { from: string; to: string };
  metrics: {
    openingBalance: number;
    closingBalance: number;
    netMovement: number;
    purchases: number;
    transferIn: number;
    transferOut: number;
    assigned: number;
    expended: number;
  };
  details: { purchases: any[]; transfersIn: any[]; transfersOut: any[] };
  inventory: any[];
};
