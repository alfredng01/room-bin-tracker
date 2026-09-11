export interface Item {
  id: number;
  name: string;
  quantity: number;
  container_id: number | null;
  created_at: string;
}

export interface Container {
  id: number;
  label: string;
  created_at: string;
  item_count: number;
}

export interface ContainerWithItems extends Container {
  items: Item[];
}
