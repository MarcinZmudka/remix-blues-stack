import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  isRouteErrorResponse,
  useFetcher,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { createTag } from "../models/tag.server";
import { IndexDBCache } from "../utils/cache";

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

  return json({
    note,
  });
};

export const clientLoader = async ({
  params,
  serverLoader,
}: ClientLoaderFunctionArgs) => {
  const noteId = params.noteId;
  invariant(noteId, "Note Id is required");

  const cached = await IndexDBCache.getItem(noteId);

  if (cached) {
    return cached;
  }

  const data = await serverLoader();

  IndexDBCache.setItem(noteId, data);

  return data;
};

clientLoader.hydrate = true;

export const clientAction = async ({
  params,
  serverAction,
}: ClientActionFunctionArgs) => {
  invariant(params.noteId, "Note Id is required");

  IndexDBCache.removeItem(params.noteId);

  return serverAction();
};

export const action = async ({ params, request }: ActionFunctionArgs) => {
  invariant(params.noteId, "Note id is required");

  await new Promise((res) => setTimeout(res, 2000));

  const formDate = await request.formData();
  const { action, ...values } = Object.fromEntries(formDate);

  if (action === "create_tag") {
    const result = z.string().min(1).safeParse(values.name);

    if (!result.success) {
      const error = result.error.format();
      return {
        status: 400,
        json: { error: error._errors.join("\n") },
      };
    }
    const tag = await createTag({ name: result.data, noteId: params.noteId });

    return json({ tag });
  }

  return json({ success: true });
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();
  const fetcher = useFetcher<{
    status: number;
    json: {
      errors: { name: string };
    };
  }>({ key: "create-tag" });

  const isBusy = fetcher.state === "submitting";

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.body}</p>
      <hr className="my-4" />
      <div>
        {data.note.tags.map((tag) => (
          <li key={tag.id}>{tag.name}</li>
        ))}

        <fetcher.Form method="post" className="flex flex-col">
          <div className="flex items-center space-x-2 mt-2">
            <input
              type="text"
              name="name"
              className="border border-gray-300 rounded px-2 py-1"
            />
            <button
              type="submit"
              className={`${isBusy ? "bg-gray-500" : "bg-blue-500"} text-white px-2 py-1 rounded`}
              name="action"
              value="create_tag"
              disabled={isBusy}
            >
              Create Tag
            </button>
          </div>
          <span className="text-red-500">
            {fetcher.data?.json.errors.name ?? ""}
          </span>
        </fetcher.Form>
      </div>
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
