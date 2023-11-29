import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Dropdown } from "components/dropdown";
import { Field, FieldCheckboxes } from "components/field";
import ImageUpload from "components/image/ImageUpload";
import { Input, Textarea } from "components/input";
import { Label } from "components/label";
import Toggle from "components/toggle/Toggle";
import { db } from "firebase-app/firebase-config";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import useFirebaseImage from "hooks/useFirebaseImage";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect, useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { categoryStatus, postStatus, userRole } from "utils/constants";
import ReactQuill, { Quill } from "react-quill";
import "react-quill/dist/quill.snow.css";
import { toast } from "react-toastify";
import ImageUploader from "quill-image-uploader";
import axios from "axios";
import { imgbbAPI } from "config/apiConfig";
import slugify from "slugify";
import { useAuth } from "contexts/auth-context";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

Quill.register("modules/imageUploader", ImageUploader);

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
    .transform((value) => (typeof value === "string" ? value.trim() : value)), // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
  // .matches(
  //   /^[a-z0-9-]*$/,
  //   "Slug must contain only lowercase letters, numbers, and hyphens"
  // ),
  // .max(100, "Please do not enter more than 100 characters"),
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

const PostUpdate = () => {
  const { userInfo } = useAuth();

  const [params] = useSearchParams();
  const postId = params.get("id");
  const navigate = useNavigate();
  const {
    handleSubmit,
    control,
    setValue,
    watch,
    reset,
    getValues,
    setError,
    clearErrors,
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

  const imageUrl = getValues("image");
  // const imageName = getValues("image_name");
  // const { image, setImage, progress, handleSelectImage, handleDeleteImage } =
  //   useFirebaseImage(
  //     setValue,
  //     getValues,
  //     imageName,
  //     setError,
  //     clearErrors
  //     // deletePostImage,
  //   );
  const {
    image,
    setImage,
    handleResetUpload,
    progress,
    handleSelectImage,
    handleDeleteImage,
  } = useFirebaseImage(setValue, getValues, setError, clearErrors);

  useEffect(() => {
    setImage(imageUrl);
  }, [imageUrl, setImage]);

  const watchHot = watch("hot");
  const watchStatus = watch("status");

  // get data
  useEffect(() => {
    async function fetchData() {
      if (!postId) return;
      const docRef = doc(db, "posts", postId);
      const docSnapshot = await getDoc(docRef);
      if (docSnapshot.data()) {
        reset(docSnapshot.data());
        setSelectCategory(docSnapshot.data()?.category || "");
        // setContent(docSnapshot.data()?.content || "");
        // setValue("content", docSnapshot.data()?.content || "");
      }
    }
    fetchData();
  }, [postId, reset, setValue]);

  const [selectCategory, setSelectCategory] = useState("");
  const [categories, setCategories] = useState([]);

  // get category list
  useEffect(() => {
    async function getCategoriesData() {
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
    getCategoriesData();
  }, []);

  // handle set category name
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

  // handle update
  const updatePostHandler = async (values) => {
    if (!isValid) return;
    try {
      const docRef = doc(db, "posts", postId);
      values.status = Number(values.status);
      values.slug = slugify(
        values.slug + "-" + Math.floor(Math.random() * 999999) || values.title,
        { lower: true }
      );
      await updateDoc(docRef, {
        ...values,
        category: JSON.parse(values.category),
        image,
        status:
          values.user.role === userRole.ADMIN
            ? postStatus.APPROVED
            : postStatus.PENDING,
      });
      handleResetUpload();
      toast.success("Update post successfully!");
      navigate("/manage/posts");
    } catch (error) {}
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

  if (!postId) return null;
  return (
    <>
      <DashboardHeading
        title="Update post"
        desc="Update post content"
      ></DashboardHeading>
      <form onSubmit={handleSubmit(updatePostHandler)}>
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
              disabled
              className="cursor-no-drop opacity-50"
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
            <Dropdown>
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
              <span className="inline-block p-3 text-sm font-medium text-green-600 rounded-lg bg-green-50">
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
                control={control}
                render={({ field }) => (
                  <div>
                    <ReactQuill
                      placeholder="Write your content..."
                      modules={modules}
                      theme="snow"
                      className={`${
                        errors.content ? "!border !border-red-500" : ""
                      }`}
                      {...field}
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
            Update post
          </Button>
        ) : (
          <Button
            type="submit"
            kind="primary"
            className="mx-auto w-[250px]"
            isLoading={isSubmitting}
            disabled={isSubmitting}
          >
            Update post
          </Button>
        )}
      </form>
    </>
  );
};

export default PostUpdate;
