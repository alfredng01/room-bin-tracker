import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import styles from "../styles/ui.module.css";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  limit: number;
  onChange: (page: number) => void;
}

export function Pagination({ page, totalPages, total, limit, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const first = (page - 1) * limit + 1;
  const last = Math.min(page * limit, total);

  return (
    <nav
      className={`${styles.group} ${styles.justifyBetween} ${styles.noWrap}`}
      aria-label="Freestanding items pages"
    >
      <span className={styles.textDimmed}>
        {first}–{last} of {total}
      </span>
      <div className={`${styles.group} ${styles.noWrap} ${styles.gapXs}`}>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onChange(page - 1)}
          disabled={page <= 1}
          aria-label="Previous page"
        >
          <IconChevronLeft size={16} />
        </button>
        <span className={styles.textSm}>
          Page {page} of {totalPages}
        </span>
        <button
          type="button"
          className={styles.iconBtn}
          onClick={() => onChange(page + 1)}
          disabled={page >= totalPages}
          aria-label="Next page"
        >
          <IconChevronRight size={16} />
        </button>
      </div>
    </nav>
  );
}
