import EditCarClient from "./EditCarClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <EditCarClient />;
}
