import type { ActionFunctionArgs, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import {
  ClientActionFunctionArgs,
  ClientLoaderFunctionArgs,
  isRouteErrorResponse,
  useFetchers,
  useLoaderData,
  useRouteError,
} from "@remix-run/react";
import { useEffect } from "react";
import invariant from "tiny-invariant";
import { z } from "zod";

import { getNote } from "~/models/note.server";
import { requireUserId } from "~/session.server";

import { TagForm } from "../components/tag";
import { createTag, deleteTag } from "../models/tag.server";
import { IndexDBCache } from "../utils/cache";

export const loader = async ({ params, request }: LoaderFunctionArgs) => {
  await new Promise((res) => setTimeout(res, 2000 * Math.random()));
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

  const data = await serverLoader<{ note: { tags: string[] } }>();

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

  await new Promise((res) => setTimeout(res, 2000 * Math.random()));

  const formDate = await request.formData();
  const { action, ...values } = Object.fromEntries(formDate);

  if (action === "_create_tag") {
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

  if (action === "_delete_tag") {
    const result = z.string().min(1).safeParse(values.id);

    if (!result.success) {
      const error = result.error.format();
      return {
        status: 400,
        json: { error: error._errors.join("\n") },
      };
    }

    await deleteTag({ id: result.data });
    return null;
  }

  return json({ success: true });
};

export default function NoteDetailsPage() {
  const data = useLoaderData<typeof loader>();

  const fetchers = useFetchers();

  const fetchersState = fetchers
    .filter((fetcher) => !fetcher.key.includes("create"))
    .map((fetcher) => fetcher.state);

  useEffect(() => {
    if (fetchersState.some((state) => state !== "idle")) {
      IndexDBCache.block();
    } else {
      IndexDBCache.unblock();
      IndexDBCache.setItem(data.note.id, data);
    }
  }, [fetchersState, data]);

  return (
    <div>
      <h3 className="text-2xl font-bold">{data.note.title}</h3>
      <p className="py-6">{data.note.body}</p>
      <hr className="my-4" />
      <TagForm tags={data.note.tags} />
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
