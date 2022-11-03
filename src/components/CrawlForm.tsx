import { FormEvent, FormEventHandler, ReactPropTypes, useState } from "react";

type CrawlFormProps = {
  handleSubmit: (event: FormEvent<HTMLFormElement>) => void;
  handleInput: (event: FormEvent<HTMLInputElement>) => void;
};

function CrawlForm(props: CrawlFormProps) {
  const { handleSubmit, handleInput } = props;

  return (
    <form id="crawl" onSubmit={handleSubmit}>
      <div>
        <input
          id="url"
          type="text"
          name="url"
          placeholder="https://example.com/"
          onInput={handleInput}
        />
      </div>
      <div>
        <input type="submit" value="Crawl" />
      </div>
    </form>
  );
}

export default CrawlForm;
