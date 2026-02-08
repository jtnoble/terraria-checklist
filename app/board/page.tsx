"use client";

import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import bcrypt from "bcryptjs";
import styles from "./board.module.css";
import spinner from "../spinner.module.css";
import { createChecklist } from "../lib/createBoard";
import { PROGRESS_TYPE } from "../lib/seed";

// Types
interface Item {
  id: string;
  label: string;
  completed: boolean;
  sort_order?: number;
}

interface Category {
  id: string;
  name: string;
  items: Item[];
  sort_order?: number;
}

interface Checklist {
  id: string;
  board_id: string;
  name: string;
  created_at?: string;
}

export default function BoardPage() {
  const [boardId, setBoardId] = useState<string | null>(null);
  const [authed, setAuthed] = useState(false);
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [activeChecklist, setActiveChecklist] = useState<string | null>(null);
  const [loadingNewChecklist, setLoadingNewChecklist] = useState(false);
  const [data, setData] = useState<Category[]>([]);

  // Get board ID from URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    if (id) setBoardId(id);
  }, []);

  // Check auth
  useEffect(() => {
    if (!boardId) return;
    setAuthed(!!localStorage.getItem(`board:${boardId}:auth`));
  }, [boardId]);

  // Fetch checklists
  useEffect(() => {
    if (!authed || !boardId) return;
    supabase
      .from("checklists")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at")
      .then(res => {
        const cl = (res.data as Checklist[]) || [];
        setChecklists(cl);
        if (cl.length && !activeChecklist) setActiveChecklist(cl[0].id);
      });
  }, [authed, boardId, activeChecklist]);

  // Fetch categories + items for active checklist
  useEffect(() => {
    if (!authed || !activeChecklist) return;
    supabase
      .from("categories")
      .select("id,name,items(id,label,completed)")
      .eq("checklist_id", activeChecklist)
      .order("sort_order")
      .then(res => setData((res.data as Category[]) || []));
  }, [authed, activeChecklist]);

  // LOGIN
  async function login() {
    if (loading) return;
    setLoading(true);

    try {
      const { data } = await supabase
        .from("boards")
        .select("password_hash")
        .eq("id", boardId)
        .single();

      const ok = await bcrypt.compare(password, data?.password_hash);
      if (!ok) {
        alert("Wrong password");
        setLoading(false);
        return;
      }

      localStorage.setItem(`board:${boardId}:auth`, "true");
      setAuthed(true);
      setLoading(false);
    } catch (err) {
      console.error(err);
      alert("Failed to load board");
      setLoading(false);
    }
  }

  // TOGGLE TASK COMPLETE
  async function toggle(itemId: string, completed: boolean) {
    await supabase.from("items").update({ completed }).eq("id", itemId);
    setData(prev =>
      prev.map(c => ({
        ...c,
        items: c.items.map(i => (i.id === itemId ? { ...i, completed } : i)),
      }))
    );
  }

  // TASK CRUD
  async function addTask(cat: Category) {
    const label = prompt("New task label");
    if (!label) return;
    const { data: newItem } = await supabase
      .from("items")
      .insert({ category_id: cat.id, label, sort_order: cat.items.length })
      .select()
      .single();
    setData(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, items: [...c.items, newItem] } : c))
    );
  }

  async function deleteTask(cat: Category, item: Item) {
    if (!confirm("Delete this task?")) return;
    await supabase.from("items").delete().eq("id", item.id);
    setData(prev =>
      prev.map(c => (c.id === cat.id ? { ...c, items: c.items.filter(i => i.id !== item.id) } : c))
    );
  }

  // CATEGORY CRUD
  async function addCategory() {
    if (!activeChecklist) return;
    const name = prompt("New category name");
    if (!name) return;

    const { data: newCat } = await supabase
      .from("categories")
      .insert({ checklist_id: activeChecklist, name, sort_order: data.length })
      .select()
      .single();

    setData(prev => [...prev, { ...newCat, items: [] }]);
  }

  async function deleteCategory(cat: Category) {
    if (!confirm(`Delete category "${cat.name}" and all its tasks?`)) return;
    await supabase.from("categories").delete().eq("id", cat.id);
    setData(prev => prev.filter(c => c.id !== cat.id));
  }

  async function renameCategory(cat: Category) {
    const newName = prompt("New category name", cat.name);
    if (!newName) return;
    await supabase.from("categories").update({ name: newName }).eq("id", cat.id);
    setData(prev => prev.map(c => (c.id === cat.id ? { ...c, name: newName } : c)));
  }

  // CHECKLIST CRUD
  async function addChecklist() {
    if (loadingNewChecklist || !boardId) return;
    const name = prompt("New checklist name");
    if (!name) return;
    const progressTypeInput = prompt("Enter '1' for PRE HARDMODE, '2' for HARDMODE, or nothing for nothing");
    let progressType;
    switch (progressTypeInput) {
      case "1":
        progressType = PROGRESS_TYPE.PRE_HARDMODE;
        break;
      case "2":
        progressType = PROGRESS_TYPE.HARDMODE;
        break;
      default:
        progressType = PROGRESS_TYPE.DEFAULT_PROGRESS;
    }

    setLoadingNewChecklist(true);
    try {
      const newCL = await createChecklist(boardId, name, progressType);
      setChecklists(prev => [...prev, newCL]);
      setActiveChecklist(newCL.id);
    } catch (err) {
      console.error(err);
      alert("Failed to create checklist");
    } finally {
      setLoadingNewChecklist(false);
    }
  }

  async function deleteChecklist(cl: Checklist) {
    if (!confirm("Delete this checklist and all its tasks?")) return;
    await supabase.from("checklists").delete().eq("id", cl.id);
    setChecklists(prev => prev.filter(c => c.id !== cl.id));
    if (activeChecklist === cl.id) setActiveChecklist(checklists[0]?.id || null);
  }

  async function renameChecklist(cl: Checklist) {
    const newName = prompt("New checklist name", cl.name);
    if (!newName) return;
    await supabase.from("checklists").update({ name: newName }).eq("id", cl.id);
    setChecklists(prev => prev.map(c => (c.id === cl.id ? { ...c, name: newName } : c)));
  }

  if (!boardId) return <p>Missing board ID</p>;

  // PASSWORD ENTRY
  if (!authed) {
    return (
      <div className={styles.wrapper}>
        <div className={styles.panel}>
          <h1 className={styles.title}>Enter World Password</h1>

          <input
            type="password"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={e => { if (e.key === "Enter") login(); }}
            disabled={loading}
          />

          <br /><br />

          <button onClick={login} disabled={loading}>
            {loading ? "Entering World..." : "Enter World"}
          </button>

          {loading && <div className={spinner.spinner} />}
        </div>
      </div>
    );
  }

  // MAIN BOARD UI
  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h1 className={styles.title}>Terraria Checklist</h1>

        {/* CHECKLIST TABS */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                {checklists.map(cl => (
                <button
                    key={cl.id}
                    onClick={() => setActiveChecklist(cl.id)}
                    style={{
                    background: cl.id === activeChecklist ? "#7bd88f" : "#6b4e2e",
                    color: "#fff",
                    padding: "6px 12px",
                    fontSize: 12,
                    border: "2px solid #4a3520",
                    cursor: "pointer"
                    }}
                >
                    {cl.name}
                </button>
                ))}
            </div>

            {/* Checklist controls */}
            {activeChecklist && (
                <div style={{ display: "flex", gap: 4 }}>
                <button onClick={() => renameChecklist(checklists.find(c => c.id === activeChecklist)!)}>✏️ Rename</button>
                <button onClick={() => deleteChecklist(checklists.find(c => c.id === activeChecklist)!)}>🗑️ Delete</button>
                </div>
            )}



          {/* Add checklist */}
          <button onClick={addChecklist} disabled={loadingNewChecklist}>
            {loadingNewChecklist ? "Creating... DO NOT RELOAD" : "+ Add Tab"}
          </button>
          {loadingNewChecklist && <div className={spinner.spinner} style={{ display: "inline-block", marginLeft: 8 }} />}
        </div>

        {/* Copy Link */}
        <div style={{ marginBottom: 12 }}>
            <button
                onClick={() => {
                navigator.clipboard.writeText(window.location.href);
                alert("Board link copied!");
                }}
            >
                📋 Copy Link
            </button>
        </div>

        {/* Add category */}
        <div style={{ marginBottom: 12 }}>
          <button onClick={addCategory}>+ Add Category</button>
        </div>
        
        {/* CATEGORY GRID */}
        <div className={styles.grid}>
          {data.map(cat => (
            <section key={cat.id} className={styles.category}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <h2>{cat.name}</h2>
                <div style={{ display: "flex", gap: 4 }}>
                  <button onClick={() => renameCategory(cat)}>✏️</button>
                  <button onClick={() => deleteCategory(cat)}>🗑️</button>
                </div>
              </div>

              {/* ITEMS */}
              {cat.items.map(item => (
                <div key={item.id} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <input type="checkbox" checked={item.completed} onChange={e => toggle(item.id, e.target.checked)} />
                  <span style={{ flex: 1, textDecoration: item.completed ? "line-through" : "none", color: item.completed ? "#9c9486" : undefined }}>
                    {item.label}
                  </span>
                  <button onClick={() => deleteTask(cat, item)}>🗑️</button>
                </div>
              ))}

              {/* ADD NEW TASK */}
              <div style={{ marginTop: 8 }}>
                <button onClick={() => addTask(cat)}>+ Add Task</button>
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}
