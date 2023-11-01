import slugify from "slugify";
import React, { useEffect } from "react";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import AuthenticationPage from "./AuthenticationPage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import { NavLink, useNavigate } from "react-router-dom";
import { Label } from "components/label";
import { Input } from "components/input";
import { Field } from "components/field";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { Button } from "components/button";
import { auth, db } from "firebase-app/firebase-config";
import { userRole, userStatus } from "utils/constants";
import { getStorage, ref, uploadBytesResumable } from "firebase/storage";

const schema = yup.object({
  fullname: yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .matches(
      /^\S+(?:\s+\S+)*$/,
      "Whitespace at the beginning and end is not allowed"
    )
    .test(
      "noMultipleWhitespace",
      "Multiple whitespaces are not allowed",
      (value) => !/\s\s+/.test(value)
    )
    .required("Please enter your fullname")
    .max(255, "Your fullname must not exceed 255 characters"),
  email: yup
    .string()
    .email("Please enter valid email address")
    .required("Please enter your email address")
    .max(255, "Your email must not exceed 255 characters"),
  password: yup
    .string()
    .matches(/^\S*$/, "Whitespace is not allowed")
    .min(8, "Your password must be at least 8 characters or greater")
    .max(255, "Your password must not exceed 255 characters")
    .required("Please enter your password"),
});

const SignUpPage = () => {
  const navigate = useNavigate();
  const myAvatar = process.env.PUBLIC_URL + "default-avatar.png";

  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const handleSignUp = async (values) => {
    if (!isValid) return;
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      await updateProfile(auth.currentUser, {
        displayName: values.fullname,
        photoURL: myAvatar,
      });

      await setDoc(doc(db, "users", auth.currentUser.uid), {
        fullname: values.fullname,
        email: values.email,
        password: values.password,
        username: slugify(
          values.fullname + Math.floor(Math.random() * 999999),
          { replacement: "", trim: true }
        ),
        avatar: myAvatar,
        status: userStatus.ACTIVE,
        role: userRole.USER,
        permissions: ["USER_FUNC"],
        bookmarkPostsId: [],
        lovePostsId: [],
        commentPosts: [],
        createdAt: serverTimestamp(),
      });

      handleUploadImage(myAvatar);
      toast.success("Register successfully!!!");
      navigate("/");
    } catch (error) {
      toast.error("Email already exists");
      console.log(error);
    }
  };

  const handleUploadImage = (file) => {
    const storage = getStorage();
    const storageRef = ref(storage, "images/" + file);
    uploadBytesResumable(storageRef, file);
  };

  useEffect(() => {
    document.title = "Register Page";
  }, []);

  return (
    <AuthenticationPage>
      <form
        className="form"
        onSubmit={handleSubmit(handleSignUp)}
        autoComplete="off"
      >
        <Field>
          <Label htmlFor="fullname">Fullname</Label>
          <Input
            type="text"
            name="fullname"
            placeholder="Enter your fullname"
            control={control}
            error={errors?.fullname?.message}
          />
        </Field>
        <Field>
          <Label htmlFor="email">Email address</Label>
          <Input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            control={control}
            error={errors?.email?.message}
          />
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <InputPasswordToggle
            control={control}
            error={errors?.password?.message}
          ></InputPasswordToggle>
        </Field>
        <div className="have-account">
          You already have an account? <NavLink to={"/sign-in"}>Login</NavLink>{" "}
        </div>
        <Button
          type="submit"
          className="w-full max-w-[300px] mx-auto"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Sign Up
        </Button>
      </form>
    </AuthenticationPage>
  );
};

export default SignUpPage;
