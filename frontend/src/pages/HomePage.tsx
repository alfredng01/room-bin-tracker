import { useEffect, useMemo, useState } from "react";
import { IconPlus } from "@tabler/icons-react";
import { api } from "../api/client";
import type { Container as ContainerType, PaginatedItems } from "../types";
import { ContainerCard } from "../components/ContainerCard";
import { ItemList } from "../components/ItemList";
import { AddItemForm } from "../components/AddItemForm";
import { Pagination } from "../components/Pagination";
import { SearchBar } from "../components/SearchBar";
import { SearchResults } from "../components/SearchResults";
import styles from "../styles/ui.module.css";

const PAGE_SIZE = 10;

export function HomePage() {
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [itemPage, setItemPage] = useState<PaginatedItems | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");

  const page = itemPage?.page ?? 1;

  // The server clamps out-of-range pages, so its response is the source of truth.
  const refresh = async (targetPage = page) => {
    const [containerList, items] = await Promise.all([
      api.getContainers(),
      api.getFreestandingItems(targetPage, PAGE_SIZE),
    ]);
    setContainers(containerList);
    setItemPage(items);
  };

  useEffect(() => {
    refresh(1).finally(() => setLoading(false));
  }, []);

  const addContainer = async () => {
    await api.createContainer();
    refresh();
  };

  const addItem = async (name: string, quantity?: number) => {
    await api.createItem({ name, quantity, container_id: null });
    // New items sort last; jump to the final page so the user sees what they added.
    const total = (itemPage?.total ?? 0) + 1;
    refresh(Math.ceil(total / PAGE_SIZE));
  };

  const updateItem = async (id: number, changes: { name?: string; quantity?: number }) => {
    await api.updateItem(id, changes);
    refresh();
  };

  const deleteItem = async (id: number) => {
    await api.deleteItem(id);
    refresh();
  };

  const trimmedQuery = useMemo(() => query.trim(), [query]);

  if (loading) return null;

  return (
    <div className={styles.container}>
      <div className={`${styles.stack} ${styles.gapLg}`}>
        <SearchBar value={query} onChange={setQuery} />

        {trimmedQuery ? (
          <SearchResults query={trimmedQuery} />
        ) : (
          <>
            <div className={`${styles.stack} ${styles.gapSm}`}>
              <h2 className={`${styles.heading} ${styles.heading2}`}>Freestanding Items</h2>
              <ItemList
                items={itemPage?.items ?? []}
                onUpdate={updateItem}
                onDelete={deleteItem}
                emptyLabel="No freestanding items yet."
              />
              {itemPage && (
                <Pagination
                  page={itemPage.page}
                  totalPages={itemPage.totalPages}
                  total={itemPage.total}
                  limit={itemPage.limit}
                  onChange={(p) => refresh(p)}
                />
              )}
              <AddItemForm onAdd={addItem} />
            </div>

            <div className={`${styles.stack} ${styles.gapSm}`}>
              <h2 className={`${styles.heading} ${styles.heading2}`}>Containers</h2>
              <div className={styles.grid}>
                {containers.map((c) => (
                  <ContainerCard key={c.id} container={c} />
                ))}
              </div>
              <button
                type="button"
                className={`${styles.btn} ${styles.btnLight}`}
                onClick={addContainer}
                style={{ alignSelf: "flex-start" }}
              >
                <IconPlus size={16} />
                Add bag/box/tote
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
