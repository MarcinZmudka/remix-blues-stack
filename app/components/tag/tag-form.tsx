import { useFetcher } from "@remix-run/react";

import { Tags } from "../../models/tag.server";

import { CreateTag } from "./create-tag";
import { Tag } from "./tag";

interface TagFormProps {
  tags: Tags;
}

export function TagForm({ tags }: TagFormProps) {
  const fetcher = useFetcher({ key: "create-tag" });

  const newlyCreatedTagName = fetcher.formData?.get("name")?.toString();

  return (
    <>
      <div className="mt-2 ">
        <div className="flex gap-2 flex-col">
          {tags.map((tag) => (
            <Tag key={tag.id} {...tag} />
          ))}
          {newlyCreatedTagName ? (
            <Tag id="new" name={newlyCreatedTagName} optimistic />
          ) : null}
        </div>
      </div>
      <CreateTag />
    </>
  );
}
