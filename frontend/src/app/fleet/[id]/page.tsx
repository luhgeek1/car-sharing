import CarDetailClient from "./CarDetailClient";

export function generateStaticParams() {
  return [{ id: "_" }];
}

export default function Page() {
  return <CarDetailClient />;
}
