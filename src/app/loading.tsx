import Spinner from "@/components/ui/spinner";
export default function Loading() {
  return (
    <div className="w-screen h-screen bg-body flex items-center justify-center">
      <Spinner size="medium" />
    </div>
  );
}
