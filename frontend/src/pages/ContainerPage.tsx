import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import {
  ActionIcon,
  Anchor,
  Container,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { IconArrowLeft, IconCheck, IconPencil, IconTrash } from "@tabler/icons-react";
import { api } from "../api/client";
import type { ContainerWithItems } from "../types";
import { ItemList } from "../components/ItemList";
import { AddItemForm } from "../components/AddItemForm";

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
    <Container size="md" py="xl">
      <Stack gap="lg">
        <Anchor component={Link} to="/" size="sm">
          <Group gap={4}>
            <IconArrowLeft size={14} /> Back to overview
          </Group>
        </Anchor>

        <Group justify="space-between">
          {editingLabel ? (
            <Group>
              <TextInput
                value={labelDraft}
                onChange={(e) => setLabelDraft(e.currentTarget.value)}
                onKeyDown={(e) => e.key === "Enter" && saveLabel()}
                autoFocus
              />
              <ActionIcon onClick={saveLabel} variant="light">
                <IconCheck size={16} />
              </ActionIcon>
            </Group>
          ) : (
            <Group>
              <Title order={2}>{container.label}</Title>
              <ActionIcon variant="subtle" onClick={() => setEditingLabel(true)}>
                <IconPencil size={16} />
              </ActionIcon>
            </Group>
          )}
          <ActionIcon color="red" variant="subtle" onClick={deleteContainer}>
            <IconTrash size={18} />
          </ActionIcon>
        </Group>

        <Stack gap="sm">
          <Text fw={500}>Contents</Text>
          <ItemList
            items={container.items}
            onUpdate={updateItem}
            onDelete={deleteItem}
            emptyLabel="This container is empty."
          />
          <AddItemForm onAdd={addItem} />
        </Stack>
      </Stack>
    </Container>
  );
}
