import { useFetcher } from "@remix-run/react";
import { useEffect, useRef } from "react";

export function CreateTag() {
  const fetcher = useFetcher<{ errors: { name: string } }>({
    key: "create-tag",
  });
  const ref = useRef<HTMLFormElement>(null);

  const isAdding = fetcher.state === "submitting";
  const errors = fetcher.data?.errors;

  useEffect(() => {
    if (!isAdding && !errors) {
      ref.current?.reset();
    }
  }, [isAdding, errors]);
  return (
    <fetcher.Form method="post" ref={ref}>
      <div className="flex flex-col">
        <div className="flex items-center space-x-2 mt-2">
          <input
            type="text"
            name="name"
            id="tag-note-name"
            placeholder="New tag"
            className="border border-gray-300 rounded px-2 py-1"
          />

          <button
            type="submit"
            name="action"
            value="_create_tag"
            className={`${isAdding ? "bg-gray-500" : "bg-blue-500"} text-white px-2 py-1 rounded`}
            disabled={isAdding}
          >
            create
          </button>
        </div>
        {errors?.name ? (
          <p className="text-red-500 mt-2 ">{errors.name}</p>
        ) : null}
      </div>
    </fetcher.Form>
  );
}
