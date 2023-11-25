import { Button } from "components/button";
import { db } from "firebase-app/firebase-config";
import { Dropdown } from "components/dropdown";
import { Field, FieldCheckboxes } from "components/field";
import { Input, Textarea } from "components/input";
import { Label } from "components/label";
import { categoryStatus, postStatus, userRole } from "utils/constants";
import { Radio } from "components/checkbox";
import { toast } from "react-toastify";
import { useAuth } from "contexts/auth-context";
import { Controller, useForm } from "react-hook-form";
import ImageUpload from "components/image/ImageUpload";
import React, { useEffect, useState, useMemo } from "react";
import slugify from "slugify";
import Toggle from "components/toggle/Toggle";
import useFirebaseImage from "hooks/useFirebaseImage";
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  where,
} from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import axios from "axios";
import { imgbbAPI } from "config/apiConfig";
import ReactQuill, { Quill } from "react-quill";
import ImageUploader from "quill-image-uploader";
import "react-quill/dist/quill.snow.css";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import { v4 as uuidv4 } from "uuid";

const schema = yup.object().shape({
  title: yup
    .string()
    .required("Please enter your title")
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .test(
      "noMultipleWhitespace",
      "Multiple whitespaces are not allowed",
      (value) => !/\s\s+/.test(value)
    )
    .max(100, "Please do not enter more than 100 characters"),
  slug: yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .matches(
      /^[a-z0-9-]*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .max(100, "Please do not enter more than 100 characters"),
  shortContent: yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .test(
      "noMultipleWhitespace",
      "Multiple whitespaces are not allowed",
      (value) => !/\s\s+/.test(value)
    )
    .max(100, "Please do not enter more than 100 characters")
    .required("Please enter your short content"),
  content: yup
    .string()
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .max(30000, "Please do not enter more than 30000 characters")
    .required("Please enter your content"),
  category: yup
    .string()
    .transform((originalValue, originalObject) => {
      // If the value is an object, convert it to a string, otherwise leave it as is
      return typeof originalValue === "object"
        ? JSON.stringify(originalValue)
        : originalValue;
    })
    .required("Please select an option"),
});

Quill.register("modules/imageUploader", ImageUploader);

const PostAddNew = () => {
  const { userInfo } = useAuth();

  const {
    control,
    watch,
    setValue,
    handleSubmit,
    getValues,
    reset,
    setError,
    clearErrors,
    register,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      title: "",
      slug: "",
      status: postStatus.PENDING,
      hot: false,
      image: "",
      category: "",
      user: {},
      shortContent: "",
      content: "",
    },
  });
  console.log("🚀 ~ file: PostAddNew.js:97 ~ PostAddNew ~ errors:", errors);

  const watchStatus = watch("status");
  const watchHot = watch("hot");

  const {
    image,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  } = useFirebaseImage(setValue, getValues, setError, clearErrors);

  const [categories, setCategories] = useState([]);
  const [selectCategory, setSelectCategory] = useState("");

  useEffect(() => {
    async function fetchUserData() {
      if (!userInfo.email) return;

      const q = query(
        collection(db, "users"),
        where("email", "==", userInfo.email)
      );

      const querySnapshot = await getDocs(q);
      querySnapshot.forEach((doc) => {
        setValue("user", {
          id: doc.id,
          ...doc.data(),
        });
      });
    }

    fetchUserData();
  }, [setValue, userInfo.email]);

  const addPostHandler = async (values) => {
    if (!isValid) return;
    try {
      let slugURL = "";
      const cloneValues = { ...values };
      const slug = slugify(values.slug || values.title, { lower: true });
      slugURL = slug + "-" + Math.floor(Math.random() * 999999);
      cloneValues.slug = slugURL;
      cloneValues.status = Number(values.status);
      const colRef = collection(db, "posts");
      await addDoc(colRef, {
        ...cloneValues,
        uid: uuidv4(),
        category: JSON.parse(values.category),
        image,
        loveIdUsers: [],
        commentIdUsers: [],
        createdAt: serverTimestamp(),
      });
      toast.success("Create new post successfully!");
      window.location.reload();
      reset({
        title: "",
        slug: "",
        status: postStatus.PENDING,
        category: {},
        hot: false,
        image: "",
        user: {},
        shortContent: "",
        content: "",
      });
      handleResetUpload();
      setSelectCategory({});
    } catch (error) {
    } finally {
    }
  };

  useEffect(() => {
    async function getData() {
      const colRef = collection(db, "categories");
      const q = query(colRef, where("status", "==", categoryStatus.APPROVED));
      const querySnapshot = await getDocs(q);
      let result = [];
      querySnapshot.forEach((doc) => {
        result.push({
          id: doc.id,
          ...doc.data(),
        });
      });
      setCategories(result);
    }
    getData();
  }, []);

  useEffect(() => {
    document.title = "Add new post";
  }, []);

  const handleClickOption = async (item) => {
    const colRef = doc(db, "categories", item.id);
    const docData = await getDoc(colRef);

    setValue("category", {
      id: docData.id,
      ...docData.data(),
    });
    clearErrors("category");

    setSelectCategory(item);
  };

  const modules = useMemo(
    () => ({
      toolbar: [
        ["bold", "italic", "underline", "strike"],
        ["blockquote"],
        [{ header: 1 }, { header: 2 }], // custom button values
        [{ list: "ordered" }, { list: "bullet" }],
        [{ header: [1, 2, 3, 4, 5, 6, false] }],
        ["link", "image", "video"],
        ["code-block"],
      ],
      imageUploader: {
        // imgbbAPI
        upload: async (file) => {
          const bodyFormData = new FormData();

          bodyFormData.append("image", file);
          const response = await axios({
            method: "post",
            url: imgbbAPI,
            data: bodyFormData,
            headers: {
              "Content-Type": "multipart/form-data",
            },
          });
          return response.data.data.url;
        },
      },
    }),
    []
  );

  return (
    <>
      <DashboardHeading title="Add post" desc="Add new post"></DashboardHeading>
      <form onSubmit={handleSubmit(addPostHandler)}>
        <div className="form-layout">
          <Field>
            <Label>Title</Label>
            <Input
              control={control}
              placeholder="Enter your title"
              name="title"
              error={errors?.title?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Slug</Label>
            <Input
              control={control}
              placeholder="Enter your slug"
              name="slug"
              error={errors?.slug?.message}
            ></Input>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Image</Label>
            <ImageUpload
              onChange={handleSelectImage}
              handleDeleteImage={handleDeleteImage}
              className="h-[250px]"
              progress={progress}
              image={image}
              name="image"
              error={errors?.image?.message}
            ></ImageUpload>
          </Field>
          <Field>
            <Label>Category</Label>
            <Dropdown name="category">
              <Dropdown.Select
                error={`${errors.category ? errors.category : ""}`}
                placeholder="Select the category"
              ></Dropdown.Select>
              <Dropdown.List>
                {categories.length > 0 &&
                  categories.map((item) => (
                    <Dropdown.Option
                      key={item.id}
                      onClick={() => handleClickOption(item)}
                    >
                      {item.name}
                    </Dropdown.Option>
                  ))}
              </Dropdown.List>
            </Dropdown>
            {errors?.category && (
              <span className="text-sm font-medium text-red-500 mb-6">
                {errors?.category?.message}
              </span>
            )}

            {selectCategory?.name && (
              <span className="inline-block p-3 rounded-lg bg-green-50 text-sm text-green-600 font-medium">
                {selectCategory?.name}
              </span>
            )}
          </Field>
        </div>
        <div className="mb-10">
          <Field>
            <Label>Short content</Label>
            <Textarea
              control={control}
              placeholder="Enter your short content"
              name="shortContent"
              error={errors?.shortContent?.message}
              className="w-full h-[82px] p-4 rounded-lg border border-collapse"
            ></Textarea>
          </Field>
        </div>
        <div className="mb-10">
          <Field>
            <Label>Content</Label>
            <div className="w-full entry-content">
              <Controller
                name="content"
                id="content"
                control={control}
                render={({ field }) => (
                  <div>
                    <ReactQuill
                      {...field}
                      placeholder="Write your content..."
                      modules={modules}
                      theme="snow"
                      className={`${
                        errors.content ? "!border !border-red-500" : ""
                      }`}
                    />
                    {errors.content && (
                      <span className="text-sm font-medium text-red-500 mb-6">
                        {errors.content.message}
                      </span>
                    )}
                  </div>
                )}
              />
            </div>
          </Field>
        </div>
        {Number(userInfo?.role) === userRole.ADMIN ? (
          <div className="form-layout">
            <Field>
              <Label>Feature post</Label>
              <Toggle
                on={watchHot === true}
                onClick={() => setValue("hot", !watchHot)}
              ></Toggle>
            </Field>
            <Field>
              <Label>Status</Label>
              <FieldCheckboxes>
                <Radio
                  name="status"
                  control={control}
                  checked={Number(watchStatus) === postStatus.APPROVED}
                  value={postStatus.APPROVED}
                >
                  Approved
                </Radio>
                <Radio
                  name="status"
                  control={control}
                  checked={Number(watchStatus) === postStatus.PENDING}
                  value={postStatus.PENDING}
                >
                  Pending
                </Radio>
                <Radio
                  name="status"
                  control={control}
                  checked={Number(watchStatus) === postStatus.REJECTED}
                  value={postStatus.REJECTED}
                >
                  Reject
                </Radio>
              </FieldCheckboxes>
            </Field>
          </div>
        ) : (
          ""
        )}
        {errors.title ||
        errors.slug ||
        errors.shortContent ||
        errors.content ||
        errors.image ? (
          <Button
            type="submit"
            kind="primary"
            className="mx-auto w-[250px]"
            disabled={true}
          >
            Add new post
          </Button>
        ) : (
          <Button
            type="submit"
            kind="primary"
            className="mx-auto w-[250px]"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Add new post
          </Button>
        )}
      </form>
    </>
  );
};

export default PostAddNew;
