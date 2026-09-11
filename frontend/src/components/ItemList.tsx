import { useState } from "react";
import {
  ActionIcon,
  Group,
  NumberInput,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import type { Item } from "../types";

interface ItemListProps {
  items: Item[];
  onUpdate: (id: number, changes: { name?: string; quantity?: number }) => void;
  onDelete: (id: number) => void;
  emptyLabel: string;
}

export function ItemList({ items, onUpdate, onDelete, emptyLabel }: ItemListProps) {
  if (items.length === 0) {
    return (
      <Text c="dimmed" size="sm">
        {emptyLabel}
      </Text>
    );
  }

  return (
    <Stack gap="xs">
      {items.map((item) => (
        <ItemRow key={item.id} item={item} onUpdate={onUpdate} onDelete={onDelete} />
      ))}
    </Stack>
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
    <Group wrap="nowrap" justify="space-between" gap="sm">
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
        style={{ flex: 1 }}
        size="sm"
      />
      <NumberInput
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
        w={90}
        size="sm"
      />
      <ActionIcon color="red" variant="subtle" onClick={() => onDelete(item.id)}>
        <IconTrash size={16} />
      </ActionIcon>
    </Group>
  );
}
