import { Button } from "components/button";
import { Field } from "components/field";
import ImageUpload from "components/image/ImageUpload";
import { Input } from "components/input";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { useAuth } from "contexts/auth-context";
import { auth, db } from "firebase-app/firebase-config";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
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
import {
  checkEmailExistsByUid,
  checkUsernameExistsByUid,
} from "utils/constants";
import useGetUserIdByEmail from "hooks/useGetUserIdByEmail";

const phoneRegExp =
  /^(0|84)(2(0[3-9]|1[0-6|8|9]|2[0-2|5-9]|3[2-9]|4[0-9]|5[1|2|4-9]|6[0-3|9]|7[0-7]|8[0-9]|9[0-4|6|7|9])|3[2-9]|5[5|6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])([0-9]{7})$/;
const birthdayRegExp =
  /^(?:0[1-9]|[12]\d|3[01])([\/.-])(?:0[1-9]|1[012])\1(?:19|20)\d\d$/;

const schema = yup.object({
  fullname: yup
    .string()
    .max(125, "Please do not enter more than 125 characters")
    .required("Please enter your fullname"),
  username: yup
    .string()
    .max(125, "Please do not enter more than 125 characters")
    .required("Please enter your username"),
  description: yup
    .string()
    .max(125, "Please do not enter more than 125 characters"),
  email: yup
    .string()
    .matches(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please enter valid email address"
    )
    .required("Please enter your email address")
    .max(125, "Your email must not exceed 125 characters"),
  password: yup
    .string()
    .min(8, "Your password must be at least 8 characters or greater")
    .max(125, "Your password must not exceed 125 characters")
    .required("Please enter your password"),
  phone: yup.string().matches(phoneRegExp, {
    message: "Phone not valid",
    excludeEmptyString: true,
  }),
  birthday: yup.string().matches(birthdayRegExp, {
    message: "birthday not valid",
    excludeEmptyString: true,
  }),
});

const UserProfile = () => {
  const { userInfo } = useAuth();

  const {
    control,
    handleSubmit,
    setValue,
    getValues,
    setError,
    clearErrors,
    formState: { errors, isValid, isSubmitting },
    reset,
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {},
  });

  const navigate = useNavigate();

  // hook get user id by email account login
  const { userId } = useGetUserIdByEmail(userInfo.email || "");

  const imageUrl = getValues("avatar");
  const imageRegex = /%2F(\S+)\?/gm.exec(imageUrl);
  let imageName = "";
  if (imageUrl === "/default-avatar.png") {
    imageName = imageUrl;
  } else {
    imageName = imageRegex?.length > 0 ? imageRegex[1] : "";
  }

  const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
    useFirebaseImage(
      setValue,
      getValues,
      // imageName,
      // daleteAvatar,
      setError,
      clearErrors
    );

  const handleUpdateProfile = async (values) => {
    if (!isValid) return;
    const checkUser = await checkUsernameExistsByUid(
      values.username,
      values.uid
    );
    const checkEmail = await checkEmailExistsByUid(values.email, values.uid);

    if (checkUser) {
      setError("username", {
        type: "manual",
        message: "Username already exists",
      });
    } else if (checkEmail) {
      setError("email", {
        type: "manual",
        message: "Email already exists",
      });
    } else if (!checkUser && !checkEmail) {
      clearErrors("username");
      clearErrors("email");
      try {
        await updateProfile(auth.currentUser, {
          displayName: values.fullname,
        });
        const colRef = doc(db, "users", userId);
        await updateDoc(colRef, {
          ...values,
          avatar: image,
        });
        if (userInfo?.email !== values.email) {
          createUserWithEmailAndPassword(auth, values.email, values.password);
        }
        Swal.fire("Updated!", "Update user successfully.", "success");
      } catch (error) {
        toast.error("Update user failed!");
      }
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

  // fetch data user by user id
  useEffect(() => {
    async function fetchData() {
      if (!userId) return null;
      const colRef = doc(db, "users", userId);
      const singleDoc = await getDoc(colRef);

      reset(singleDoc.data());
    }

    fetchData();
  }, [userId, reset]);

  if (!userInfo) return null;
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
            name="image"
            error={errors?.image?.message}
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
              error={errors?.birthday?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Mobile Number</Label>
            <Input
              type="number"
              control={control}
              name="phone"
              placeholder="Enter your phone number"
              error={errors?.phone?.message}
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
            <Label>New Password</Label>
            <InputPasswordToggle
              control={control}
              error={errors?.password?.message}
            ></InputPasswordToggle>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Description</Label>
            <Textarea
              name="description"
              control={control}
              error={errors?.description?.message}
            ></Textarea>
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
        {errors.fullname ||
        errors.username ||
        errors.description ||
        errors.email ||
        errors.password ||
        errors.phone ||
        errors.birthday ? (
          <Button
            type="submit"
            kind="primary"
            className="mx-auto w-[200px]"
            disabled={true}
          >
            Update
          </Button>
        ) : (
          <Button
            type="submit"
            kind="primary"
            className="mx-auto w-[200px]"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Update
          </Button>
        )}
      </form>
    </div>
  );
};

export default UserProfile;
