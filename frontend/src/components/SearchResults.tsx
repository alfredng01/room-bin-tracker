import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { IconBox } from "@tabler/icons-react";
import { api } from "../api/client";
import type { SearchResponse } from "../types";
import styles from "../styles/ui.module.css";

interface SearchResultsProps {
  query: string;
}

export function SearchResults({ query }: SearchResultsProps) {
  const [results, setResults] = useState<SearchResponse | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(() => {
      api.search(query).then((data) => {
        if (!cancelled) setResults(data);
      });
    }, 200);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [query]);

  if (!results) return null;

  const { freestandingItems, containers } = results;
  const hasResults = freestandingItems.length > 0 || containers.length > 0;

  if (!hasResults) {
    return <p className={styles.textDimmed}>No items matching "{query}".</p>;
  }

  return (
    <div className={`${styles.stack} ${styles.gapMd}`}>
      {freestandingItems.length > 0 && (
        <div className={`${styles.stack} ${styles.gapXs}`}>
          <p className={`${styles.heading} ${styles.textSm}`}>Freestanding items</p>
          <div className={`${styles.stack} ${styles.gapXs}`}>
            {freestandingItems.map((item) => (
              <div
                key={item.id}
                className={`${styles.group} ${styles.justifyBetween} ${styles.noWrap}`}
              >
                <span className={styles.textSm}>{item.name}</span>
                <span className={styles.textDimmed}>x{item.quantity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {containers.length > 0 && (
        <div className={`${styles.stack} ${styles.gapXs}`}>
          <p className={`${styles.heading} ${styles.textSm}`}>Found in containers</p>
          <div className={`${styles.stack} ${styles.gapXs}`}>
            {containers.map((c) => (
              <Link
                key={c.id}
                to={`/containers/${c.id}`}
                className={styles.card}
                style={{ padding: "10px 14px" }}
              >
                <div className={`${styles.group} ${styles.justifyBetween} ${styles.noWrap}`}>
                  <span className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}>
                    <IconBox size={18} stroke={1.5} />
                    <span className={styles.textSm}>{c.label}</span>
                  </span>
                  <span className={styles.textDimmed}>
                    {c.match_count} match{c.match_count === 1 ? "" : "es"}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
