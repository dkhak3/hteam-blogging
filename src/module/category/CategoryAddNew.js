import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Field, FieldCheckboxes } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import { db } from "firebase-app/firebase-config";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React from "react";
import { useForm } from "react-hook-form";
import { toast } from "react-toastify";
import slugify from "slugify";
import { categoryStatus } from "utils/constants";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";

const schema = yup.object({
  name: yup
    .string()
    .required("Please enter your name")
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
});

const CategoryAddNew = () => {
  const {
    control,
    handleSubmit,
    watch,
    reset,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {
      name: "",
      slug: "",
      status: categoryStatus.APPROVED,
      createdAt: new Date(),
    },
  });
  console.log("errors", errors);

  const handleAddNewCategory = async (values) => {
    console.log("values", values);
    if (!isValid) return;

    try {
      let slugURL = "";
      const newValues = { ...values };
      const slug = slugify(values.slug || values.name, { lower: true });
      slugURL = slug + "-" + Math.floor(Math.random() * 999999);
      newValues.slug = slugURL;
      newValues.status = Number(newValues.status);

      const colRef = collection(db, "categories");

      await addDoc(colRef, {
        ...newValues,
        createdAt: serverTimestamp(),
      });
      toast.success("Create new category successfully");
    } catch (error) {
      toast.error(error.message);
    } finally {
      reset({ name: "", slug: "", status: 1, createdAt: new Date() });
    }
  };

  const watchStatus = watch("status");

  return (
    <div>
      <DashboardHeading
        title="New category"
        desc="Add new category"
      ></DashboardHeading>
      <form onSubmit={handleSubmit(handleAddNewCategory)} autoComplete="off">
        <div className="form-layout">
          <Field>
            <Label>Name</Label>
            <Input
              control={control}
              name="name"
              placeholder="Enter your category name"
              error={errors?.name?.message}
            ></Input>
          </Field>
          <Field>
            <Label>Slug</Label>
            <Input
              control={control}
              name="slug"
              placeholder="Enter your slug"
              error={errors?.slug?.message}
            ></Input>
          </Field>
        </div>
        <div className="form-layout">
          <Field>
            <Label>Status</Label>
            <FieldCheckboxes>
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === categoryStatus.APPROVED}
                value={categoryStatus.APPROVED}
              >
                Approved
              </Radio>
              <Radio
                name="status"
                control={control}
                checked={Number(watchStatus) === categoryStatus.UNAPPROVED}
                value={categoryStatus.UNAPPROVED}
              >
                Unapproved
              </Radio>
            </FieldCheckboxes>
          </Field>
        </div>
        <Button
          type="submit"
          kind="primary"
          className="mx-auto w-[250px]"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Add new category
        </Button>
      </form>
    </div>
  );
};

export default CategoryAddNew;
