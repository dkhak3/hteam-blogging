import { Button } from "components/button";
import { Field } from "components/field";
import ImageUpload from "components/image/ImageUpload";
import { Input } from "components/input";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { useAuth } from "contexts/auth-context";
import { auth, db } from "firebase-app/firebase-config";
import {
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from "firebase/auth";
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

const phoneRegExp =
  /^(0|84)(2(0[3-9]|1[0-6|8|9]|2[0-2|5-9]|3[2-9]|4[0-9]|5[1|2|4-9]|6[0-3|9]|7[0-7]|8[0-9]|9[0-4|6|7|9])|3[2-9]|5[5|6|8|9]|7[0|6-9]|8[0-6|8|9]|9[0-4|6-9])([0-9]{7})$/;
const birthdayRegExp = /^\d{4}\-(0?[1-9]|1[012])\-(0?[1-9]|[12][0-9]|3[01])$/;
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
    .email("Please enter valid email address")
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
  const [userId, setUserId] = useState();
  const [userList, setUserList] = useState([]);
  // get userid by email
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

  // get all user
  useEffect(() => {
    const colRef = collection(db, "users");
    if (userInfo) {
      let results = [];
      onSnapshot(colRef, (snapshot) => {
        snapshot.forEach((doc) => {
          results.push({
            id: doc.id,
            ...doc.data(),
          });
        });
        setUserList(results);
      });
    }
  }, [userInfo]);

  const imageUrl = getValues("avatar");
  const imageRegex = /%2F(\S+)\?/gm.exec(imageUrl);
  let imageName = "";
  if (imageUrl === "/default-avatar.png") {
    imageName = imageUrl;
  } else {
    imageName = imageRegex?.length > 0 ? imageRegex[1] : "";
  }

  const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
    useFirebaseImage(setValue, getValues, imageName, daleteAvatar);

  const handleUpdateProfile = async (values) => {
    if (!isValid) return;

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
        if (userInfo?.email !== values.email) {
          createUserWithEmailAndPassword(auth, values.email, values.password);
        }
        Swal.fire("Updated!", "Update user successfully.", "success");
      }
    });
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

  // get user by id
  useEffect(() => {
    async function fetchData() {
      if (!userId) return null;
      const colRef = doc(db, "users", userId);
      const singleDoc = await getDoc(colRef);

      reset(singleDoc.data());
    }

    fetchData();
  }, [userId, reset]);

  const handleChangeUserName = (e) => {
    setValue("username", e.target.value);
    for (let i = 0; i < userList.length; i++) {
      const item = userList[i];

      if (item.username === getValues("username")) {
        setError("username", {
          type: "custom",
          message: "username already exists",
        });
        return;
      } else if (item.username !== getValues("username")) {
        return clearErrors("username");
      }
    }
  };

  const handleChangeEmail = (e) => {
    setValue("email", e.target.value);
    for (let i = 0; i < userList.length; i++) {
      const item = userList[i];

      if (item.email === getValues("email")) {
        setError("email", {
          type: "custom",
          message: "email already exists",
        });
        return;
      } else if (item.email !== getValues("email")) {
        return clearErrors("email");
      }
    }
  };

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
              onChange={handleChangeUserName}
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
              onChange={handleChangeEmail}
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
