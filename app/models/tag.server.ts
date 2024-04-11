import type { Note, Tag } from "@prisma/client";

import { prisma } from "~/db.server";

export type { Note } from "@prisma/client";

export function getTagListItems({ noteId }: { noteId: Note["id"] }) {
  return prisma.tag.findMany({
    where: { noteId },
    select: { id: true, name: true },
  });
}

export type Tags = Awaited<ReturnType<typeof getTagListItems>>;

export function createTag({
  noteId,
  name,
}: Pick<Tag, "name"> & { noteId: Note["id"] }) {
  return prisma.tag.create({
    data: {
      name,
      note: {
        connect: {
          id: noteId,
        },
      },
    },
  });
}

export function deleteTag({ id }: Pick<Tag, "id">) {
  return prisma.tag.delete({
    where: { id },
  });
}
