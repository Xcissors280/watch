import { Navigation } from "@/components/layout/Navigation";

export function HomeLayout(props: {
  showBg: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col min-h-screen pb-20">
      <Navigation bg={props.showBg} />
      {props.children}
    </div>
  );
}
