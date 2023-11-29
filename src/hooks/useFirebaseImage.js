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
        //
        //     break;
        //   case "running":
        //
        //     break;
        //   default:
        //
        // }
      },
      (error) => {
        //
        setImage("");
      },
      () => {
        getDownloadURL(uploadTask.snapshot.ref).then((downloadURL) => {
          //
          setImage(downloadURL);
        });
      }
    );
  };
  const handleSelectImage = (e) => {
    const file = e.target.files[0];

    if (!file) return;
    if (file.type === "image/png" || file.type === "image/jpeg") {
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
        //
        setImage("");
        setProgress(0);
        cb && cb();
      })
      .catch((error) => {
        //
        //
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
