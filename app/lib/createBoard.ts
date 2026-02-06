import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import { DEFAULT_CATEGORIES } from "./seed";

export async function createBoard(name: string, password: string) {
  const password_hash = await bcrypt.hash(password, 10);

  const { data: board } = await supabase
    .from("boards")
    .insert({ name, password_hash })
    .select()
    .single();

  // create default checklist
  const { data: checklist } = await supabase
    .from("checklists")
    .insert({ board_id: board.id, name: "Default Checklist" })
    .select()
    .single();

  for (let i = 0; i < DEFAULT_CATEGORIES.length; i++) {
    const cat = DEFAULT_CATEGORIES[i];
    const { data: category } = await supabase
      .from("categories")
      .insert({
        checklist_id: checklist.id,
        name: cat.name,
        sort_order: i,
      })
      .select()
      .single();

    for (let j = 0; j < cat.items.length; j++) {
      await supabase.from("items").insert({
        category_id: category.id,
        label: cat.items[j],
        sort_order: j,
      });
    }
  }

  return board.id;
}

export async function createChecklist(boardId: string, name: string) {
  // 1. Create checklist
  const { data: checklist } = await supabase
    .from("checklists")
    .insert({ board_id: boardId, name })
    .select()
    .single();

  if (!checklist) throw new Error("Failed to create checklist");

  // 2. Prepare all categories for batch insert
  const categoriesToInsert = DEFAULT_CATEGORIES.map((cat, idx) => ({
    checklist_id: checklist.id,
    name: cat.name,
    sort_order: idx
  }));

  // Insert all categories at once
  const { data: insertedCategories } = await supabase
    .from("categories")
    .insert(categoriesToInsert)
    .select();

  if (!insertedCategories) throw new Error("Failed to create categories");

  // 3. Prepare all items for batch insert
  const itemsToInsert = insertedCategories.flatMap((cat, catIdx) =>
    DEFAULT_CATEGORIES[catIdx].items.map((label, itemIdx) => ({
      category_id: cat.id,
      label,
      completed: false,
      sort_order: itemIdx
    }))
  );

  if (itemsToInsert.length > 0) {
    await supabase.from("items").insert(itemsToInsert);
  }

  return checklist;
}