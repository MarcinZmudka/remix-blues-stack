import { z } from "zod";

const ErrorSchema = z.object({
  status: z.number(),
  message: z.string(),
});

type ErrorResponse = z.infer<typeof ErrorSchema>;

export const isError = (note: unknown): note is ErrorResponse => {
  return ErrorSchema.safeParse(note).success;
};
