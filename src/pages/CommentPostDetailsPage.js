import { yupResolver } from "@hookform/resolvers/yup";
import { Field } from "components/field";
import { Textarea } from "components/input";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { v4 } from "uuid";
import * as yup from "yup";

const schema = yup.object({
  fullname: yup.string().required("Please enter your fullname"),
  email: yup
    .string()
    .email("Please enter valid email address")
    .required("Please enter your email address"),
  password: yup
    .string()
    .min(8, "Your password must be at least 8 characters or greater")
    .required("Please enter your password"),
});

const CommentPostDetailsPage = ({ postInfo, userInfo }) => {
  const {
    control,
    handleSubmit,
    formState: { errors, isValid, isSubmitting },
  } = useForm({
    mode: "onChange",
    // resolver: yupResolver(schema),
  });
  const [comments, setComments] = useState([]);

  const handleAddComment = ({ comment }) => {
    console.log("comment", comment);
  };

  return (
    <div className="flex justify-center items-center">
      <div className="h-auto px-7 w-[700px] rounded-[12px] bg-white p-4 shadow-md border">
        <p className="text-xl font-semibold text-blue-900 cursor-pointer transition-all hover:text-black">
          Add Comment
        </p>
        <form onSubmit={handleSubmit(handleAddComment)}>
          <Field>
            <Textarea
              row={8}
              name="comment"
              placeholder="Add your comments here"
              control={control}
              className="h-[100px] px-3 text-sm py-1 mt-5 outline-none border-gray-300 w-full resize-none border rounded-lg placeholder:text-sm"
              error={errors?.message?.message}
            ></Textarea>
          </Field>

          <div className="flex justify-between mt-2">
            <p className="text-sm text-blue-900 ">
              Enter atleast 15 characters
            </p>
            <button
              type="submit"
              className="h-12 w-[150px] bg-blue-400 text-sm text-white rounded-lg transition-all cursor-pointer hover:bg-blue-600"
            >
              Submit comment
            </button>
          </div>
        </form>

        {postInfo &&
          postInfo.commentIdUsers.map((comment) => (
            <div key={v4()}>{comment}</div>
          ))}
        <ul>
          <li>
            <div className="author">
              <div className="author-image">
                <img
                  src="https://avatars.githubusercontent.com/u/94631848?v=4"
                  alt=""
                  className="w-[100px] h-[100px] rounded-lg"
                />
              </div>
              <div className="author-content">
                <div className="author-name">Nguyễn Kha</div>
                <div className="author-desc">
                  Bài viết hay quá, tui hâm mộ ông! Bài viết hay quá, tui hâm mộ
                  ông! Bài viết hay quá, tui hâm mộ ông! Bài viết hay quá, tui
                  hâm mộ ông! Bài viết hay quá, tui hâm mộ ông!
                </div>
              </div>
            </div>
          </li>
          <li>
            <div className="author">
              <div className="author-image">
                <img
                  src="https://avatars.githubusercontent.com/u/94631848?v=4"
                  alt=""
                  className="w-[100px] h-[100px] rounded-lg"
                />
              </div>
              <div className="author-content">
                <div className="author-name">Nguyễn Kha</div>
                <div className="author-desc">
                  Bài viết hay quá, tui hâm mộ ông! Bài viết hay quá, tui hâm mộ
                  ông! Bài viết hay quá, tui hâm mộ ông! Bài viết hay quá, tui
                  hâm mộ ông! Bài viết hay quá, tui hâm mộ ông!
                </div>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>
  );
};

export default CommentPostDetailsPage;
