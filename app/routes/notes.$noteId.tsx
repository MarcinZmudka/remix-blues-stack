import type { LoaderFunctionArgs } from "@remix-run/node";
import { defer } from "@remix-run/node";
import {
  Await,
  isRouteErrorResponse,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { Suspense } from "react";
import invariant from "tiny-invariant";

import { getNoteDeleyed } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { Note, NoteSkeleton } from "../components/notes";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  const userId = await requireUserId(request);
  invariant(params.noteId, "Note Id is required");

  const note = getNoteDeleyed(
    {
      id: params.noteId,
      userId,
    },
    3000,
  );

  if (!note) {
    throw new Response("Note not found", {
      status: 404,
      statusText: "Note not found",
    });
  }

  return defer({
    note,
    noteId: params.noteId,
  });
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  return (
    <div>
      <Suspense fallback={<NoteSkeleton />} key={data.noteId}>
        <Await resolve={data.note}>
          <Note />
        </Await>
      </Suspense>

      <hr className="my-4" />
      <div>Hello</div>
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
