import Loader from "@/components/kokonutui/loader";

export default function Loading() {
  return (
    <div className="flex h-[80vh] w-full items-center justify-center">
      <Loader 
        title="Loading..." 
        subtitle="Please wait while we prepare your space." 
        size="md" 
      />
    </div>
  );
}
