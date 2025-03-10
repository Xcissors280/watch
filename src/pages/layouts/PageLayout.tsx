import { Navigation } from "@/components/layout/Navigation";

export function PageLayout(props: { children: React.ReactNode }) {
  return (
    <>
      <Navigation />
      {props.children}
    </>
  );
}
