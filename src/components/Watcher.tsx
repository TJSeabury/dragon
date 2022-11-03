import { useEffect, useState } from "react";
import { invoke } from "@tauri-apps/api/tauri";

function Watcher() {
  const [statuses, setStatuses] = useState({});

  async function getStatuses() {
    setStatuses(await invoke("statuses"));
  }

  useEffect(() => {
    getStatuses();

    const id = setInterval(getStatuses, 1000);
    return () => clearInterval(id);
  }, []);

  return (
    <div>
      <h2>Statuses</h2>
      <ul>
        {Object.entries(statuses).map(([k, v]) => {
          return (
            <p>
              <>
                <strong>{k}</strong>: {v}
              </>
            </p>
          );
        })}
      </ul>
    </div>
  );
}

export default Watcher;
