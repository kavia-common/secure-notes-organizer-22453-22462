export interface Category {
  id: string;
  name: string;
  color?: string; // hex string like #2563EB
  count?: number; // number of notes (optional, server computed)
}
