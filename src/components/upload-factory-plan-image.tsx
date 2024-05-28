import { FileUploader } from "react-drag-drop-files";
import { useQueryClient } from "@tanstack/react-query";

export const UploadFactoryPlanImage = () => {
  const queryClient = useQueryClient();
  const fileTypes = ["JPG", "PNG", "JPEG"];

  const uploadImage = async (file: File) => {
    const reader = new FileReader();

    reader.onload = async () => {
      const base64 = reader.result?.toString().split(",")[1];
      if (base64) {
        const response = await fetch("/api/uploadFactoryPlan", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ image: base64 }),
        });

        if (!response.ok) {
          console.error("Failed to upload image");
        } else {
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          //@ts-expect-error
          void queryClient.invalidateQueries([
            "companyRouter",
            "isFactoryPlan",
          ]);
        }
      }
    };

    reader.readAsDataURL(file);
  };

  return (
    <div className="w-100 flex justify-center">
      <FileUploader handleChange={uploadImage} name="file" types={fileTypes} />
    </div>
  );
};
