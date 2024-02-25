import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import ImageUpload from "components/image/ImageUpload";
import { Input } from "components/input";
import { Label } from "components/label";
import { Textarea } from "components/textarea";
import { auth, db } from "firebase-app/firebase-config";
import { updateProfile } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import useFirebaseImage from "hooks/useFirebaseImage";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import {
  checkEmailExistsByUid,
  checkUsernameExistsByUid,
  userRole,
  userStatus,
} from "utils/constants";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import InputPasswordToggle from "components/input/InputPasswordToggle";
import Loading from "components/common/Loading";

const schema = yup.object({
  fullname: yup
    .string()
    .required("Please enter your fullname")
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
    .max(125, "Your fullname must not exceed 125 characters"),
  username: yup
    .string()
    .matches(/^\S*$/, "Whitespace is not allowed")
    .max(125, "Your username must not exceed 155 characters")
    .required("Please enter your username")
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .matches(/^[a-z0-9]+(?:[_-][a-z0-9]+)*$/, "Invalid slug format"),
  description: yup
    .string()
    // .matches(
    //   /^\S+(?:\s+\S+)*$/,
    //   "Whitespace at the beginning and end is not allowed"
    // )
    // .test(
    //   "noMultipleWhitespace",
    //   "Multiple whitespaces are not allowed",
    //   (value) => !/\s\s+/.test(value)
    // )
    .max(100, "Your description must not exceed 100 characters"),
  email: yup
    .string()
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

const UserUpdate = () => {
  const {
    control,
    handleSubmit,
    watch,
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
  const [params] = useSearchParams();
  const userId = params.get("id");
  const navigate = useNavigate();
  const watchStatus = watch("status");
  const watchRole = watch("role");
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

  const handleUpdateUser = async (values) => {
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
        message: "email already exists",
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
          role: Number(values.role),
          status: Number(values.status),
          permissions: [
            Number(values.role) === userRole.ADMIN ? "ADMIN_FUNC" : "USER_FUNC",
          ],
        });

        toast.success("Update user successfully!");
        navigate("/manage/users");
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

  useEffect(() => {
    async function fetchData() {
      if (!userId) return null;
      const colRef = doc(db, "users", userId);
      const singleDoc = await getDoc(colRef);

      reset(singleDoc.data());
    }

    fetchData();
  }, [userId, reset]);

  if (!userId) return <Loading></Loading>;

  return (
    <div>
      <DashboardHeading
        title="Update user"
        desc={`Update your user id: ${userId}`}
      ></DashboardHeading>
      <form onSubmit={handleSubmit(handleUpdateUser)}>
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
              name="fullname"
              placeholder="Enter your fullname"
              control={control}
              error={errors?.fullname?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Username</Label>
            <Input
              name="username"
              placeholder="Enter your username"
              control={control}
              error={errors?.username?.message}
            ></Input>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Email</Label>
            <Input
              name="email"
              placeholder="Enter your email"
              control={control}
              type="email"
              error={errors?.email?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Password</Label>
            <InputPasswordToggle
              control={control}
              error={errors?.password?.message}
            ></InputPasswordToggle>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Status</Label>
            <FieldCheckboxes>
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === userStatus.ACTIVE}
                value={userStatus.ACTIVE}
              >
                Active
              </Radio>
              {/* <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === userStatus.PENDING}
                value={userStatus.PENDING}
              >
                Pending
              </Radio> */}
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === userStatus.BAN}
                value={userStatus.BAN}
              >
                Banned
              </Radio>
            </FieldCheckboxes>
          </Field>
          <Field>
            <Label>Role</Label>
            <FieldCheckboxes>
              <Radio
                name="role"
                control={control}
                checked={Number(watchRole) === userRole.ADMIN}
                value={userRole.ADMIN}
              >
                Admin
              </Radio>
              {/* <Radio
                name="role"
                control={control}
                checked={Number(watchRole) === userRole.MOD}
                value={userRole.MOD}
              >
                Moderator
              </Radio> */}
              <Radio
                name="role"
                control={control}
                checked={Number(watchRole) === userRole.USER}
                value={userRole.USER}
              >
                User
              </Radio>
            </FieldCheckboxes>
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

export default UserUpdate;
