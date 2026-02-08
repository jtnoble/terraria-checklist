import { supabase } from "./supabase";
import bcrypt from "bcryptjs";
import { PRE_HARDMODE, HARDMODE, PROGRESS_TYPE, Category } from "./seed";

export async function createBoard(name: string, password: string, progressType: PROGRESS_TYPE) {
  const password_hash = await bcrypt.hash(password, 10);

  const getCategories = (progressType: PROGRESS_TYPE): Category[] => {
    switch (progressType) {
      case PROGRESS_TYPE.PRE_HARDMODE:
        return PRE_HARDMODE;
      case PROGRESS_TYPE.HARDMODE:
        return HARDMODE;
      default:
        return [];
    }
  };


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

  const categories: Category[] = getCategories(progressType);
  for (let i = 0; i < categories.length; i++) {
    const cat = categories[i];
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

export async function createChecklist(boardId: string, name: string, progressType: PROGRESS_TYPE) {
  const getCategories = (progressType: PROGRESS_TYPE): Category[] => {
    switch (progressType) {
      case PROGRESS_TYPE.PRE_HARDMODE:
        return PRE_HARDMODE;
      case PROGRESS_TYPE.HARDMODE:
        return HARDMODE;
      default:
        return [];
    }
  };

  // 1. Create checklist
  const { data: checklist } = await supabase
    .from("checklists")
    .insert({ board_id: boardId, name })
    .select()
    .single();

  if (!checklist) throw new Error("Failed to create checklist");

  // 2. Prepare all categories for batch insert
  const categories: Category[] = getCategories(progressType);
  const categoriesToInsert = categories.map((cat, idx) => ({
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
    categories[catIdx].items.map((label, itemIdx) => ({
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