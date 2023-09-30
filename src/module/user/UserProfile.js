import { Button } from "components/button";
import { Field } from "components/field";
import ImageUpload from "components/image/ImageUpload";
import { Input } from "components/input";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { useAuth } from "contexts/auth-context";
import { auth, db } from "firebase-app/firebase-config";
import { signOut, updateProfile } from "firebase/auth";
import {
  collection,
  doc,
  getDoc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import useFirebaseImage from "hooks/useFirebaseImage";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import Swal from "sweetalert2";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Loading from "components/common/Loading";
import { useNavigate } from "react-router-dom";

const schema = yup.object({
  fullname: yup
    .string()
    .max(100, "Please do not enter more than 100 characters")
    .required("Please enter your fullname"),
  username: yup
    .string()
    .max(100, "Please do not enter more than 100 characters")
    .required("Please enter your username"),
  description: yup
    .string()
    .max(100, "Please do not enter more than 100 characters"),
  email: yup
    .string()
    .email("Please enter valid email address")
    .required("Please enter your email address"),
  password: yup
    .string()
    .min(8, "Your password must be at least 8 characters or greater")
    .required("Please enter your password"),
});

const UserProfile = () => {
  const { userInfo } = useAuth();
  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const navigate = useNavigate();
  const [userId, setUserId] = useState();
  useEffect(() => {
    const colRef = collection(db, "users");
    if (userInfo?.email) {
      const queries = query(colRef, where("email", "==", userInfo?.email));
      onSnapshot(queries, (snapshot) => {
        snapshot.forEach((doc) => {
          setUserId(doc.id);
        });
      });
    }
  }, [userInfo?.email]);

  const imageUrl = getValues("avatar");
  const imageRegex = /%2F(\S+)\?/gm.exec(imageUrl);
  let imageName = "";
  if (imageUrl === "/default-avatar.png") {
    imageName = imageUrl;
    console.log(imageUrl);
  } else {
    imageName = imageRegex?.length > 0 ? imageRegex[1] : "";
  }

  const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
    useFirebaseImage(setValue, getValues, imageName, daleteAvatar);

  const handleUpdateProfile = async (values) => {
    if (!isValid) return;

    try {
      Swal.fire({
        title: "Are you sure?",
        text: "You won't be able to revert this!",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
      }).then(async (result) => {
        if (result.isConfirmed) {
          await updateProfile(auth.currentUser, {
            displayName: values.fullname,
          });
          const colRef = doc(db, "users", userId);
          await updateDoc(colRef, {
            ...values,
            avatar: image,
          });

          signOut(auth);
          if (userInfo?.email) navigate("/");
          Swal.fire("Updated!", "Update user successfully.", "success");
        }
      });
    } catch (error) {
      toast.error("Update user failed!");
    }
  };

  async function daleteAvatar() {
    const colRef = doc(db, "users", userId);
    await updateDoc(colRef, {
      avatar: "",
    });
  }

  useEffect(() => {
    setImage(imageUrl);
  }, [imageUrl, setImage]);

  useEffect(() => {
    async function fetchData() {
      if (!userId) return null;
      const colRef = doc(db, "users", userId);
      const singleDoc = await getDoc(colRef);

      reset(singleDoc.data());
    }

    fetchData();
  }, [userId, reset]);

  if (!userInfo) return <Loading></Loading>;
  return (
    <div>
      <DashboardHeading
        title="Account information"
        desc="Update your account information"
      ></DashboardHeading>
      <form onSubmit={handleSubmit(handleUpdateProfile)}>
        <div className="w-[200px] h-[200px] rounded-full mx-auto mb-10">
          <ImageUpload
            className="!rounded-full h-full"
            onChange={handleSelectImage}
            handleDeleteImage={handleDeleteImage}
            progress={progress}
            image={image}
          ></ImageUpload>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Fullname</Label>
            <Input
              control={control}
              name="fullname"
              placeholder="Enter your fullname"
              error={errors?.fullname?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Username</Label>
            <Input
              control={control}
              name="username"
              placeholder="Enter your username"
              error={errors?.username?.message}
            ></Input>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Date of Birth</Label>
            <Input
              type="date"
              control={control}
              name="birthday"
              placeholder="dd/mm/yyyy"
            ></Input>
          </Field>
          <Field>
            <Label>Mobile Number</Label>
            <Input
              type="number"
              control={control}
              name="phone"
              placeholder="Enter your phone number"
            ></Input>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Email</Label>
            <Input
              control={control}
              name="email"
              type="email"
              placeholder="Enter your email address"
              error={errors?.email?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Description</Label>
            <Textarea
              name="description"
              control={control}
              error={errors?.description?.message}
            ></Textarea>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>New Password</Label>
            <InputPasswordToggle
              control={control}
              error={errors?.password?.message}
            ></InputPasswordToggle>
          </Field>
          {/* <Field>
            <Label>Confirm Password</Label>
            <Input
              control={control}
              name="confirmPassword"
              type="password"
              placeholder="Enter your confirm password"
              onChange={(e) => setConfirmPassword(e.target.value)}
              value={confirmPassword}
            ></Input>
          </Field> */}
        </div>
        <Button
          type="submit"
          kind="primary"
          className="mx-auto w-[200px]"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Update
        </Button>
      </form>
    </div>
  );
};

export default UserProfile;
