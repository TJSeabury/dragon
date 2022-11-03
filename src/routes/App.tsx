import { ReactElement } from "react";
import "./App.css";

function App({ children }: { children: ReactElement | ReactElement[] }) {
  return (
    <div className="app">
      <div className="background">
        <span className="kanji">龍神</span>
      </div>

      <main>{children}</main>

      <nav>
        <ul>
          <li>
            <a href={`/`}>Watch</a>
          </li>
          <li>
            <a href={`/crawl`}>Crawl</a>
          </li>
        </ul>
      </nav>
    </div>
  );
}

export default App;
