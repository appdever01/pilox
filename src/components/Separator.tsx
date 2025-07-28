export function Separator({ color = "white" }) {
  return (
    <div
      className="h-px w-full"
      style={{ backgroundColor: color, opacity: 0.1 }}
    />
  );
}
