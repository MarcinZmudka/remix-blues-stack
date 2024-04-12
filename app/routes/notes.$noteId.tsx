import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  isRouteErrorResponse,
  useLoaderData,
  useRevalidator,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";

import { getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "Note Id is required");

  const note = await getNote({
    id: params.noteId,
    userId,
  });

  if (!note) {
    throw new Response("Note not found", {
      status: 404,
      statusText: "Note not found",
    });
  }

  return json(
    {
      note,
    },
    {
      headers: {
        "Cache-Control": "public, max-age=360",
      },
    },
  );
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const { revalidate } = useRevalidator();

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.body}</p>
      <hr className="my-4" />
      <button
        onClick={revalidate}
        className="rounded bg-green-500 px-4 py-2 text-white hover:bg-green-600 focus:bg-green-400"
      >
        Refresh
      </button>
    </div>
  );
}

export const ErrorBoundary = () => {
  const error = useRouteError();

  if (!isRouteErrorResponse(error)) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <h1 className="text-4xl font-bold mb-4">Unknown Error</h1>
        <p className="text-gray-500">An unknown error occurred.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center h-screen">
      <h1 className="text-4xl font-bold mb-4">{error.status}</h1>
      <p className="text-gray-500">{error.statusText}</p>
    </div>
  );
};
