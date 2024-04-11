import { useFetcher } from "@remix-run/react";

interface TagProps {
  id: string;
  name: string;
  optimistic?: boolean;
}

export function Tag({ id, name, optimistic }: TagProps) {
  const fetcher = useFetcher<{ error: string }>();

  const isDeleting =
    fetcher.state === "submitting" && fetcher.formData?.get("id") === id;

  const isDeleteError = !!fetcher.data?.error;
  return (
    <fetcher.Form method="post" className={`${isDeleting ? "hidden" : ""}`}>
      <div
        className={`flex items-center gap-2 ${isDeleteError ? "text-red-500" : ""}`}
      >
        <input type="hidden" name="id" value={id} readOnly className="hidden" />
        <input
          type="text"
          name="name"
          readOnly
          value={name}
          className="border border-gray-300 rounded px-2 py-1"
        />
        {optimistic ? null : (
          <button
            type="submit"
            name="action"
            value="_delete_tag"
            className="bg-red-500 text-white px-2 py-1 rounded"
          >
            {isDeleteError ? "retry" : "delete"}
          </button>
        )}
      </div>
    </fetcher.Form>
  );
}
