import { TextInput } from "@mantine/core";
import { IconSearch, IconX } from "@tabler/icons-react";
import styles from "../styles/ui.module.css";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
}

export function SearchBar({ value, onChange }: SearchBarProps) {
  return (
    <div className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}>
      <IconSearch size={18} color="var(--color-text-dimmed)" />
      <TextInput
        placeholder="Search items…"
        value={value}
        onChange={(e) => onChange(e.currentTarget.value)}
        classNames={{ root: styles.growField, input: styles.input }}
      />
      {value && (
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onChange("")}
          aria-label="Clear search"
        >
          <IconX size={16} />
        </button>
      )}
    </div>
  );
}
