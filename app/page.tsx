"use client";

import { useState } from "react";
import { createBoard } from "./lib/createBoard";
import { useRouter } from "next/navigation";
import styles from "./home.module.css";
import spinner from "./spinner.module.css";
import { PROGRESS_TYPE } from "./lib/seed";

export default function Home() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit() {
    if (loading) return;

    if (!name || !password) {
      alert("Enter a world name and password");
      return;
    }

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

    setLoading(true);

    try {
      const id = await createBoard(name, password, progressType);
      router.push(`/board?id=${id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create world");
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter") submit();
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.panel}>
        <h1 className={styles.title}>Terraria Checklist</h1>
        <p className={styles.subtitle}>Progress Tracker</p>

        <div className={styles.field}>
          <input
            placeholder="World Name"
            onChange={e => setName(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
        </div>

        <div className={styles.field}>
          <input
            type="password"
            placeholder="World Password"
            onChange={e => setPassword(e.target.value)}
            onKeyDown={handleKey}
            disabled={loading}
          />
        </div>

        <button onClick={submit} disabled={loading}>
          {loading ? "Creating World..." : "Create World"}
        </button>

        {loading && <div className={spinner.spinner} />}
      </div>
    </div>
  );
}
