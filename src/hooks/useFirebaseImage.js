import {
  deleteObject,
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { useState } from "react";

export default function useFirebaseImage(
  setValue,
  getValues,
  setError,
  clearErrors,
  imageName = null,
  cb = null
) {
  const [progress, setProgress] = useState(0);
  const [image, setImage] = useState("");
  if (!setValue || !getValues) return;
  const handleUploadImage = (file) => {
    let name = file.name;
    name = name.replace(/\s+/g, "-");
    const storage = getStorage();
    const storageRef = ref(storage, "images/" + name);
    const uploadTask = uploadBytesResumable(storageRef, file);
    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progressPercent =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setProgress(progressPercent);
        // switch (snapshot.state) {
        //   case "paused":
        //     console.log("Upload is paused");
        //     break;
        //   case "running":
        //     console.log("Upload is running");
        //     break;
        //   default:
        //     console.log("Nothing at all");
        // }
      },
      (error) => {
        // console.log("Error");
        setImage("");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          // console.log("File available at", downloadURL);
          setImage(downloadURL);
        });
      }
    );
  };
  const handleSelectImage = (e) => {
    const file = e.target.files[0];
    console.log(
      "🚀 ~ file: useFirebaseImage.js:56 ~ handleSelectImage ~ file:",
      file
    );
    if (!file) return;
    if (file.type === "image/png" || file.type === "image/jpeg") {
      console.log("clear image error");
      setValue("image_name", file.name);
      handleUploadImage(file);
      clearErrors("image");
    } else {
      handleResetUpload();
      setError("image", {
        type: "manual",
        message: "Invalid file type. Only JPEG, PNG are allowed.",
      });
    }
  };

  const handleDeleteImage = () => {
    const storage = getStorage();
    const imageRef = ref(
      storage,
      "images/" + (imageName || getValues("image_name"))
    );
    deleteObject(imageRef)
      .then(() => {
        // console.log("Remove image successfully");
        setImage("");
        setProgress(0);
        cb && cb();
      })
      .catch((error) => {
        // console.log("handleDeleteImage ~ error", error);
        // console.log("Can not delete image");
        setImage("");
      });
  };
  const handleResetUpload = () => {
    setImage("");
    setProgress(0);
  };
  return {
    image,
    setImage,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  };
}
