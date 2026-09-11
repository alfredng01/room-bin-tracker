import { useState } from "react";
import { NumberInput, TextInput } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { Item } from "../types";
import styles from "../styles/ui.module.css";

interface ItemListProps {
  items: Item[];
  onUpdate: (id: number, changes: { name?: string; quantity?: number }) => void;
  onDelete: (id: number) => void;
  emptyLabel: string;
}

export function ItemList({ items, onUpdate, onDelete, emptyLabel }: ItemListProps) {
  if (items.length === 0) {
    return <p className={styles.textDimmed}>{emptyLabel}</p>;
  }

  return (
    <div className={`${styles.stack} ${styles.gapXs}`}>
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </div>
  );
}

function ItemRow({
  item,
  onUpdate,
  onDelete,
}: {
  item: Item;
  onUpdate: (id: number, changes: { name?: string; quantity?: number }) => void;
  onDelete: (id: number) => void;
}) {
  const [name, setName] = useState(item.name);
  const [quantity, setQuantity] = useState<number | string>(item.quantity);

  return (
    <div className={`${styles.group} ${styles.justifyBetween} ${styles.noWrap} ${styles.gapSm}`}>
      <TextInput
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        onBlur={() => {
          if (name.trim() && name !== item.name) {
            onUpdate(item.id, { name: name.trim() });
          } else {
            setName(item.name);
          }
        }}
        classNames={{ root: styles.growField, input: styles.input }}
      />
      <NumberInput
        hideControls
        value={quantity}
        onChange={setQuantity}
        onBlur={() => {
          const q = Number(quantity);
          if (q > 0 && q !== item.quantity) {
            onUpdate(item.id, { quantity: q });
          } else {
            setQuantity(item.quantity);
          }
        }}
        min={1}
        classNames={{ root: styles.qtyField, input: styles.input }}
      />
      <button
        type="button"
        className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
        onClick={() => onDelete(item.id)}
        aria-label={`Delete ${item.name}`}
      >
        <IconTrash size={16} />
      </button>
    </div>
  );
}
