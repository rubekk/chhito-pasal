import { error } from "@sveltejs/kit";
import { categories } from "$lib/store";

export const load = ({ params }) => {
  const urlSlug = params.slug.toLowerCase();
  const category = categories.find(item => item.slug.toLowerCase() === urlSlug);

  if (category) return { data: category };

  throw error(404, "Category not found");
};

