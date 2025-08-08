import { toast } from "react-toastify";

export async function convertDocument(
  file: File,
  sourceFormat: string,
  targetFormat: string
): Promise<{ blob: Blob; filename: string }> {
  const toastId = toast.info("Converting your document...", {
    autoClose: false,
    position: "top-right",
  });

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("source_format", sourceFormat.toLowerCase());
    formData.append("target_format", targetFormat.toLowerCase());

    const response = await fetch(
      "https://services.pilox.com/convert-document",
      {
        method: "POST",
        headers: {
          Authorization: "Bearer a9X3l7Zq2YB5c8W1D6v4K0NmAeTgJpRfLQdVxMwCsHk",
        },
        mode: "cors",
        credentials: "include",
        body: formData,
      }
    );

    if (!response.ok) {
      toast.dismiss(toastId);
      const errorData = await response.json();
      throw new Error(errorData.error || "Conversion failed");
    }

    const originalName = file.name.split(".").slice(0, -1).join(".");
    // Create new filename with target format
    const newFilename = `${originalName}.${targetFormat.toLowerCase()}`;

    toast.dismiss(toastId);
    toast.success("✨ Document converted successfully!", {
      autoClose: 3000,
      position: "top-right",
    });

    return {
      blob: await response.blob(),
      filename: newFilename,
    };
  } catch (error) {
    console.error("Conversion error:", error);
    toast.dismiss(toastId);
    toast.error("Failed to convert document", {
      autoClose: 5000,
      position: "top-right",
    });
    throw error;
  }
}
