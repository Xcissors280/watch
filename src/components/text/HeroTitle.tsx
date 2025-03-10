export interface HeroTitleProps {
  children?: React.ReactNode;
  className?: string;
}

export function HeroTitle(props: HeroTitleProps) {
  return (
    <h1
      className={`text-4xl font-bold text-white max-w-[300px] ${props.className ?? ""}`}
    >
      {props.children}
    </h1>
  );
}
