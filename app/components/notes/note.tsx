import { Note as PrismaNote } from "@prisma/client";
import { useAsyncValue } from "@remix-run/react";

import { NoteError } from "./error";
import { isError } from "./utils/is-error";

export function Note() {
  const value = useAsyncValue();

  if (isError(value)) {
    return <NoteError error={value} />;
  }

  const { title, body } = value as PrismaNote;
  return (
    <>
      <h3 className="text-2xl font-bold">{title}</h3>
      <p className="py-6">{body}</p>
    </>
  );
}
