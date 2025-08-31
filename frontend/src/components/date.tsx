export default function PrettyDate({ value }: { value?: string | Date }) {
  if (!value) return null;
  const d = new Date(value);
  return <time dateTime={d.toISOString()}>{d.toLocaleString()}</time>;
}