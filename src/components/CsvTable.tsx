function CsvTable({ data }: { data: Array<Array<string>> | null }) {
  if (!data) return null;
  const labels: Array<string> = data?.[0];
  const rows: Array<Array<string>> = data.slice(1);

  return (
    <table>
      <thead>
        <tr>
          {labels.map((label) => {
            return <th>{label}</th>;
          })}
        </tr>
      </thead>
      <tbody>
        <>
          {rows.map((row) => (
            <tr>
              {row.map((col) => (
                <td>{col}</td>
              ))}
            </tr>
          ))}
        </>
      </tbody>
    </table>
  );
}

export default CsvTable;
