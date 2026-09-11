import { Link } from "react-router-dom";
import { IconBox } from "@tabler/icons-react";
import type { Container } from "../types";
import styles from "../styles/ui.module.css";

export function ContainerCard({ container }: { container: Container }) {
  return (
    <Link to={`/containers/${container.id}`} className={styles.card}>
      <div className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}>
        <IconBox size={28} stroke={1.5} />
        <div>
          <p className={`${styles.heading} ${styles.textSm}`}>{container.label}</p>
          <p className={`${styles.textDimmed} ${styles.textXs}`}>
            {container.item_count} item{container.item_count === 1 ? "" : "s"}
          </p>
        </div>
      </div>
    </Link>
  );
}
