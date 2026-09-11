import { useEffect, useState } from "react";
import { Button, Container, Grid, Stack, Title } from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import { api } from "../api/client";
import type { Container as ContainerType, Item } from "../types";
import { ContainerCard } from "../components/ContainerCard";
import { ItemList } from "../components/ItemList";
import { AddItemForm } from "../components/AddItemForm";

export function HomePage() {
  const [containers, setContainers] = useState<ContainerType[]>([]);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = async () => {
    const [containerList, itemList] = await Promise.all([
      api.getContainers(),
      api.getFreestandingItems(),
    ]);
    setContainers(containerList);
    setItems(itemList);
  };

  useEffect(() => {
    refresh().finally(() => setLoading(false));
  }, []);

  const addContainer = async () => {
    await api.createContainer();
    refresh();
  };

  const addItem = async (name: string, quantity?: number) => {
    await api.createItem({ name, quantity, container_id: null });
    refresh();
  };

  const updateItem = async (id: number, changes: { name?: string; quantity?: number }) => {
    await api.updateItem(id, changes);
    refresh();
  };

  const deleteItem = async (id: number) => {
    await api.deleteItem(id);
    refresh();
  };

  if (loading) return null;

  return (
    <Container size="md" py="xl">
      <Stack gap="xl">
        <Stack gap="sm">
          <Title order={2}>Freestanding Items</Title>
          <ItemList
            items={items}
            onUpdate={updateItem}
            onDelete={deleteItem}
            emptyLabel="No freestanding items yet."
          />
          <AddItemForm onAdd={addItem} />
        </Stack>

        <Stack gap="sm">
          <Title order={2}>Containers</Title>
          <Grid>
            {containers.map((c) => (
              <Grid.Col key={c.id} span={{ base: 12, sm: 6, md: 4 }}>
                <ContainerCard container={c} />
              </Grid.Col>
            ))}
          </Grid>
          <Button
            variant="light"
            leftSection={<IconPlus size={16} />}
            onClick={addContainer}
            w={220}
          >
            Add bag/box/tote
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
