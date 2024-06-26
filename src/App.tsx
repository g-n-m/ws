import { Show, createSignal, onMount } from "solid-js";
import logo from "./assets/logo.svg";
import { invoke } from "@tauri-apps/api/core";
import "./App.css";
import { locale, platform } from "@tauri-apps/plugin-os";
import { createStore } from "solid-js/store";
import { isPermissionGranted, requestPermission, sendNotification } from "@tauri-apps/plugin-notification";

function App() {
  const [system, setSystem] = createStore<
    Record<"platform" | "locale", null | string>
  >({
    platform: null,
    locale: null,
  });
  const [greetMsg, setGreetMsg] = createSignal("");
  const [name, setName] = createSignal("");

  onMount(async () => {
    const plat = await platform();
    const loc = await locale();

    setSystem({ platform: plat, locale: loc });

    // check if we can send
    const hasPermission = await isPermissionGranted();

    if (!hasPermission) {
      const permission = await requestPermission();

      if (permission === "granted") {
        console.log("Permission granted");
        sendNotification({
          title: "Hello from Rust!",
          body: "This is a notification from JavaScript and Rust",
        });
      } else {
        console.log("Permission denied");
      }
    } else {
      console.log("Already has permission");
      console.log("sendNotification ");
      sendNotification({
        title: "Hello from Rust!",
        body: "This is a notification from JavaScript and Rust",
      });
    }
  });

  async function greet() {
    // Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
    setGreetMsg(await invoke("greet", { name: name() }));
  }

  return (
    <div class="container">
       <h1>
        <Show when={system.platform}>{(p) => <>{p} - </>}</Show>
        <Show when={system.locale}>{(l) => <>{l} - </>}</Show>
      </h1>
      <div class="row">
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo vite" alt="Vite logo" />
        </a>
        <a href="https://tauri.app" target="_blank">
          <img src="/tauri.svg" class="logo tauri" alt="Tauri logo" />
        </a>
        <a href="https://solidjs.com" target="_blank">
          <img src={logo} class="logo solid" alt="Solid logo" />
        </a>
      </div>

      <p>Click on the Tauri, Vite, and Solid logos to learn more.</p>

      <form
        class="row"
        onSubmit={(e) => {
          e.preventDefault();
          greet();
        }}
      >
        <input
          id="greet-input"
          onChange={(e) => setName(e.currentTarget.value)}
          placeholder="Enter a name..."
        />
        <button type="submit">Greet</button>
      </form>

      <p>{greetMsg()}</p>
    </div>
  );
}

export default App;
