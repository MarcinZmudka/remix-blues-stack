interface NoteErrorProps {
  error?: { status: number; message: string };
}

export function NoteError({ error }: NoteErrorProps) {
  if (error) {
    return <p className="text-red-500">{error.message}</p>;
  }
  return <p className="text-red-500">Oops, something unexpected happend</p>;
}
