import CrawlForm from "../components/CrawlForm";
import { wait, diff } from "../lib/Utils";
import { apiHost } from "../lib/env";
import { FormEvent, useState } from "react";

import { save } from "@tauri-apps/api/dialog";

import { parse, ParseResult } from "papaparse";
import CsvTable from "../components/CsvTable";
import { writeTextFile } from "@tauri-apps/api/fs";

class Job {
  id: string;
  status: string;
  elapsedTime: number;
  linksFound: number;
  linksCrawled: number;
  done: boolean;
  downloadLink: string;

  constructor(
    id = "",
    status = "idle",
    elapsedTime = 0,
    linksFound = 0,
    linksCrawled = 0,
    done = false,
    downloadLink = ""
  ) {
    this.id = id;
    this.status = status;
    this.elapsedTime = elapsedTime;
    this.linksFound = linksFound;
    this.linksCrawled = linksCrawled;
    this.done = done;
    this.downloadLink = downloadLink;
  }
}

function Crawl() {
  const [job, setjob] = useState(new Job());
  console.log(job);

  const [target, settarget] = useState("");

  const [csv, setcsv] = useState("");

  function handleInput(ev: FormEvent<HTMLInputElement>) {
    ev.preventDefault();
    settarget(ev.currentTarget.value);
  }

  async function handleSubmit(ev: FormEvent<HTMLFormElement>): Promise<void> {
    ev.preventDefault();
    console.log("Yee ha");

    const response = await fetch(`${apiHost}/api/start/`, {
      method: "POST",
      mode: "cors",
      cache: "no-cache",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        uuid: null,
        message: target || "",
      }),
    });

    let rData = await response.json();

    if (response.status === 422) {
      job.status = rData.message;
      reset();
      return;
    }

    const uuid = rData.uuid;
    job.status = rData.message;
    job.done = false;
    setjob(
      new Job(
        job.id,
        job.status,
        job.elapsedTime,
        job.linksFound,
        job.linksCrawled,
        job.done,
        job.downloadLink
      )
    );
    console.log(job);

    while (!job.done) {
      const checkResponse = await fetch(`${apiHost}/api/check/`, {
        method: "POST",
        mode: "cors",
        cache: "no-cache",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          uuid: uuid,
          message: "",
        }),
      });

      rData = await checkResponse.json();

      if (rData.Status === "done") job.done = true;

      job.id = rData.Uuid;
      job.status = rData.Status;
      job.elapsedTime = diff() / 1000;
      job.linksFound = rData.LinksFound;
      job.linksCrawled = rData.LinksCrawled;

      if (job.done) {
        job.downloadLink = `${apiHost}/api/finish/${uuid}`;
      }

      setjob(
        new Job(
          job.id,
          job.status,
          job.elapsedTime,
          job.linksFound,
          job.linksCrawled,
          job.done,
          job.downloadLink
        )
      );
      console.log(job);

      wait(100);
    }

    const csvResponse = await fetch(job.downloadLink);
    const data = await csvResponse.text();

    setcsv(data);
  }

  function reset() {
    setjob(new Job());
  }

  return (
    <main>
      <header>
        <h1>The hoard must grow.</h1>
        <p>Choose your target.</p>
      </header>
      <section>
        <CrawlForm handleSubmit={handleSubmit} handleInput={handleInput} />
        <div id="crawl-status">
          <p>ID: {job.id}</p>
          <p>Status: {job.status}</p>
          <p>Links found: {job.linksFound}</p>
          <p>Links crawled: {job.linksCrawled}</p>
          <p>Elapsed: {job.elapsedTime} seconds</p>
        </div>
        <div>
          <p>
            {csv ? (
              <button
                onClick={async () => {
                  const path = await save({
                    filters: [
                      {
                        name: "CSV",
                        extensions: ["csv"],
                      },
                    ],
                  });

                  await writeTextFile(path, csv);
                }}
              >
                Save
              </button>
            ) : null}
          </p>
        </div>
      </section>
      <CsvTable data={csv ? parse<Array<string>>(csv)?.data : null} />
    </main>
  );
}

export default Crawl;
