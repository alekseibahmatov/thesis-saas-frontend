import Image from "next/image";
import { useEffect, useState } from "react";
import { MachinePopovers } from "~/components/machine-popovers";

export const FactoryPlanImage = () => {
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const fetchImage = async () => {
    const response = await fetch("/api/getFactoryPlan");
    if (response.ok) {
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      setImageUrl(url);
    } else {
      console.error("Failed to fetch image");
    }
  };

  useEffect(() => {
    void fetchImage();
  }, []);

  return (
    <div className="relative h-[600px] w-full">
      {!!imageUrl && (
        <Image
          src={imageUrl}
          alt="Factory Plan"
          style={{
            userSelect: "none",
            pointerEvents: "none",
          }}
          layout="fill"
          objectFit="contain"
        />
      )}
      <MachinePopovers />
    </div>
  );
};
