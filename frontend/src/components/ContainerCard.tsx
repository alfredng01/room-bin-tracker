import { Link } from "react-router-dom";
import { Card, Group, Text } from "@mantine/core";
import { IconBox } from "@tabler/icons-react";
import type { Container } from "../types";

export function ContainerCard({ container }: { container: Container }) {
  return (
    <Card
      component={Link}
      to={`/containers/${container.id}`}
      withBorder
      padding="md"
      radius="md"
      style={{ textDecoration: "none", color: "inherit" }}
    >
      <Group wrap="nowrap">
        <IconBox size={28} stroke={1.5} />
        <div>
          <Text fw={500}>{container.label}</Text>
          <Text size="xs" c="dimmed">
            {container.item_count} item{container.item_count === 1 ? "" : "s"}
          </Text>
        </div>
      </Group>
    </Card>
  );
}
