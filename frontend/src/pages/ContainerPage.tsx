import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { TextInput } from "@mantine/core";
import { IconArrowLeft, IconCheck, IconPencil, IconTrash } from "@tabler/icons-react";
import { api } from "../api/client";
import type { ContainerWithItems } from "../types";
import { ItemList } from "../components/ItemList";
import { AddItemForm } from "../components/AddItemForm";
import styles from "../styles/ui.module.css";

export function ContainerPage() {
  const { id } = useParams();
  const containerId = Number(id);
  const navigate = useNavigate();

  const [container, setContainer] = useState<ContainerWithItems | null>(null);
  const [editingLabel, setEditingLabel] = useState(false);
  const [labelDraft, setLabelDraft] = useState("");

  const refresh = async () => {
    const data = await api.getContainer(containerId);
    setContainer(data);
    setLabelDraft(data.label);
  };

  useEffect(() => {
    refresh();
  }, [containerId]);

  if (!container) return null;

  const addItem = async (name: string, quantity?: number) => {
    await api.createItem({ name, quantity, container_id: containerId });
    refresh();
  };

  const updateItem = async (itemId: number, changes: { name?: string; quantity?: number }) => {
    await api.updateItem(itemId, changes);
    refresh();
  };

  const deleteItem = async (itemId: number) => {
    await api.deleteItem(itemId);
    refresh();
  };

  const saveLabel = async () => {
    if (labelDraft.trim() && labelDraft !== container.label) {
      await api.renameContainer(containerId, labelDraft.trim());
      await refresh();
    }
    setEditingLabel(false);
  };

  const deleteContainer = async () => {
    if (!confirm(`Delete "${container.label}" and all its items?`)) return;
    await api.deleteContainer(containerId);
    navigate("/");
  };

  return (
    <div className={styles.container}>
      <div className={`${styles.stack} ${styles.gapMd}`}>
        <Link to="/" className={styles.anchor}>
          <span className={`${styles.group} ${styles.noWrap}`} style={{ gap: 4 }}>
            <IconArrowLeft size={14} /> Back to overview
          </span>
        </Link>

        <div className={`${styles.group} ${styles.justifyBetween} ${styles.noWrap}`}>
          {editingLabel ? (
            <div className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}>
              <TextInput
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && saveLabel()}
                classNames={{ input: styles.input }}
                autoFocus
              />
              <button
                type="button"
                className={`${styles.iconBtn} ${styles.iconBtnLight}`}
                onClick={saveLabel}
                aria-label="Save label"
              >
                <IconCheck size={16} />
              </button>
            </div>
          ) : (
            <div className={`${styles.group} ${styles.noWrap} ${styles.gapSm}`}>
              <h2 className={`${styles.heading} ${styles.heading2}`}>{container.label}</h2>
              <button
                type="button"
                className={styles.iconBtn}
                onClick={() => setEditingLabel(true)}
                aria-label="Rename container"
              >
                <IconPencil size={16} />
              </button>
            </div>
          )}
          <button
            type="button"
            className={`${styles.iconBtn} ${styles.iconBtnDanger}`}
            onClick={deleteContainer}
            aria-label="Delete container"
          >
            <IconTrash size={18} />
          </button>
        </div>

        <div className={`${styles.stack} ${styles.gapSm}`}>
          <p className={`${styles.heading} ${styles.textSm}`}>Contents</p>
          <ItemList
            items={container.items}
            onUpdate={updateItem}
            onDelete={deleteItem}
            emptyLabel="This container is empty."
          />
          <AddItemForm onAdd={addItem} />
        </div>
      </div>
    </div>
  );
}
