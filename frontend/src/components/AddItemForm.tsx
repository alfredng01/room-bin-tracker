import { useState } from "react";
import { NumberInput, TextInput } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import styles from "../styles/ui.module.css";

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
    <form
      className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
    >
      <TextInput
        placeholder="Item name"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        classNames={{ root: styles.growField, input: styles.input }}
      />
      <NumberInput
        hideControls
        placeholder="Qty (1)"
        value={quantity}
        onChange={setQuantity}
        min={1}
        classNames={{ root: styles.qtyField, input: styles.input }}
      />
      <button type="submit" className={`${styles.btn} ${styles.btnFilled}`}>
        <IconPlus size={16} />
        Add
      </button>
    </form>
  );
}
