import { Button } from "components/button";
import { Radio } from "components/checkbox";
import { Field } from "components/field";
import { Input } from "components/input";
import { Label } from "components/label";
import { db } from "firebase-app/firebase-config";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import DashboardHeading from "module/dashboard/DashboardHeading";
import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import slugify from "slugify";
import { categoryStatus } from "utils/constants";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import Loading from "components/common/Loading";

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
    .required("Please enter your slug")
    .transform((value) => (typeof value === "string" ? value.trim() : value)) // Loại bỏ khoảng trắng ở đầu và cuối chuỗi
    .matches(
      /^[a-z0-9-]*$/,
      "Slug must contain only lowercase letters, numbers, and hyphens"
    )
    .max(100, "Please do not enter more than 100 characters"),
});

const CategoryUpdate = () => {
  const {
    control,
    reset,
    watch,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
    defaultValues: {},
  });
  const [params] = useSearchParams();
  const categoryId = params.get("id");
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchDate() {
      const colRef = doc(db, "categories", categoryId);
      const singleDoc = await getDoc(colRef);

      reset(singleDoc.data());
    }

    fetchDate();
  }, [categoryId, reset]);

  const watchStatus = watch("status");

  const handleUpdateCategory = async (values) => {
    if (!isValid) return;
    try {
      const colRef = doc(db, "categories", categoryId);
      await updateDoc(colRef, {
        name: values.name,
        slug: slugify(values.slug || values.title, { lower: true }),
        status: Number(values.status),
      });
      toast.success("Update category successfully!");
      navigate("/manage/category");
    } catch (error) {
      toast.error("Update category failed!");
    }
  };
  if (!categoryId) return <Loading></Loading>;
  return (
    <div>
      <DashboardHeading
        title="Update category"
        desc={`Update your category id: ${categoryId}`}
      ></DashboardHeading>
      <form onSubmit={handleSubmit(handleUpdateCategory)} autoComplete="off">
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
            <div className="flex flex-wrap gap-x-5">
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
            </div>
          </Field>
        </div>
        <Button
          kind="primary"
          className="mx-auto w-[200px]"
          type="submit"
          disabled={isSubmitting}
          isLoading={isSubmitting}
        >
          Update category
        </Button>
      </form>
    </div>
  );
};

export default CategoryUpdate;
