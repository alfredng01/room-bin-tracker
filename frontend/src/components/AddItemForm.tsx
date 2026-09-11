import { useState } from "react";
import { Button, Group, NumberInput, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";

interface AddItemFormProps {
  onAdd: (name: string, quantity?: number) => void;
}

export function AddItemForm({ onAdd }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [quantity, setQuantity] = useState<number | string>("");

  const submit = () => {
    if (!name.trim()) return;
    const q = quantity === "" ? undefined : Number(quantity);
    onAdd(name.trim(), q);
    setName("");
    setQuantity("");
  };

  return (
    <Group
      wrap="nowrap"
      gap="sm"
      component="form"
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextInput
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        style={{ flex: 1 }}
        size="sm"
      />
      <NumberInput
        placeholder="Qty (1)"
        value={quantity}
        onChange={setQuantity}
        min={1}
        w={100}
        size="sm"
      />
      <Button type="submit" size="sm" leftSection={<IconPlus size={16} />}>
        Add
      </Button>
    </Group>
  );
}
