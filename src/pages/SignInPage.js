import { Button } from "components/button";
import { Field } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import { useAuth } from "contexts/auth-context";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { NavLink, useNavigate } from "react-router-dom";
import AuthenticationPage from "./AuthenticationPage";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { toast } from "react-toastify";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "firebase-app/firebase-config";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import { collection, onSnapshot } from "firebase/firestore";

const schema = yup.object({
  email: yup
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
    .matches(
      /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/,
      "Please enter valid email address"
    )
    .required("Please enter your email address")
    .max(255, "Your email must not exceed 255 characters"),
  password: yup
    .string()
    .matches(/^\S*$/, "Whitespace is not allowed")
    .min(8, "Your password must be at least 8 characters or greater")
    .max(255, "Your password must not exceed 255 characters")
    .required("Please enter your password"),
});

const SignInPage = () => {
  const {
    handleSubmit,
    control,
    formState: { isValid, isSubmitting, errors },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });

  const { userInfo } = useAuth();
  const navigate = useNavigate();

  const [userEmailBan, setUserEmailBan] = useState([]);
  useEffect(() => {
    async function fetchData() {
      const colRef = collection(db, "users");
      onSnapshot(colRef, (snapShot) => {
        snapShot.forEach((doc) => {
          if (Number(doc.data().status) === 3) {
            setUserEmailBan((old) => [old, doc.data().email]);
          }
        });
      });
    }
    fetchData();
  }, []);

  useEffect(() => {
    document.title = "Login Page";
    if (userInfo?.email) navigate("/");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userInfo]);

  const handleSignIn = async (values) => {
    if (!isValid) return;

    try {
      if (userEmailBan !== null) {
        for (let i = 0; i < userEmailBan.length; i++) {
          const element = userEmailBan[i];
          if (element === values.email) {
            toast.info("Your account is BAN");
            signOut(auth);
            return;
          }
        }
      }
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast.success("Login successfully");
      navigate("/");
    } catch (error) {
      // if (error.message.includes("wrong-password"))
      //   toast.error("Email or password Incorrect");
      toast.error("Email or password Incorrect");
    }
  };

  return (
    <AuthenticationPage>
      <form
        className="form"
        onSubmit={handleSubmit(handleSignIn)}
        autoComplete="off"
      >
        <Field>
          <Label htmlFor="email">Email address</Label>
          <Input
            type="email"
            name="email"
            placeholder="example@gmail.com"
            control={control}
            error={errors?.email?.message}
          ></Input>
        </Field>
        <Field>
          <Label htmlFor="password">Password</Label>
          <InputPasswordToggle
            control={control}
            error={errors?.password?.message}
          ></InputPasswordToggle>
        </Field>
        <div className="have-account">
          You have not had an account?{" "}
          <NavLink to={"/sign-up"}>Register an account</NavLink>{" "}
        </div>
        <Button
          type="submit"
          className="w-full max-w-[300px] mx-auto"
          isLoading={isSubmitting}
          disabled={isSubmitting}
        >
          Login
        </Button>
      </form>
    </AuthenticationPage>
  );
};

export default SignInPage;
