export default function getUrl() {
  if (typeof window !== "undefined") {
    const { protocol, host } = window.location;
    return `${protocol}//${host}`;
  }
  return "http://localhost:3000";
}
