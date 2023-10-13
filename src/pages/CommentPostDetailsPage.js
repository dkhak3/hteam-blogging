import { yupResolver } from "@hookform/resolvers/yup";
import { Button } from "components/button";
import { Field } from "components/field";
import { Textarea } from "components/input";
import { useAuth } from "contexts/auth-context";
import { db } from "firebase-app/firebase-config";
import {
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  onSnapshot,
  query,
  updateDoc,
  where,
} from "firebase/firestore";
import { Input } from "postcss";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import { v4 as uuidv4 } from "uuid";
import * as yup from "yup";

const schema = yup.object({
  comment: yup
    .string()
    .required("Please enter your comment")
    .max(200, "Your comment must not exceed 200 characters"),
});

const CommentPostDetailsPage = ({ postInfo = {}, userInfo = {} }) => {
  const {
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isValid },
  } = useForm({
    mode: "onChange",
    resolver: yupResolver(schema),
  });
  const [loadingButton, setLoadingButton] = useState(false);
  const [comments, setComments] = useState([]);
  const [userByEmail, setUserByEmail] = useState();
  const [InputEdit, setInputEdit] = useState(false);
  const [InputEditValue, setInputEditValue] = useState("");
  const [inputValue, setInputValue] = useState("");
  const commentRef = doc(db, "posts", postInfo?.id);

  useEffect(() => {
    comments.forEach((item) => {
      console.log(item);
    });
  }, [comments]);

  useEffect(() => {
    const docRef = doc(db, "posts", postInfo?.id);
    onSnapshot(docRef, (snapshot) => {
      setComments(snapshot.data().commentIdUsers);
    });
  }, [postInfo?.id]);

  useEffect(() => {
    async function fetchData() {
      if (!userInfo) return;
      const colRef = query(
        collection(db, "users"),
        where("email", "==", userInfo?.email)
      );
      onSnapshot(colRef, (snapshot) => {
        snapshot.forEach((doc) => {
          doc.data() && setUserByEmail({ id: doc.id, ...doc.data() });
        });
      });
    }

    fetchData();
  }, [userInfo, userInfo?.email]);

  const handleAddComment = ({ comment }) => {
    if (!isValid) return;
    if (userInfo) {
      setLoadingButton(true);
      updateDoc(commentRef, {
        commentIdUsers: arrayUnion({
          userId: userByEmail.id,
          username: userByEmail.username,
          fullname: userByEmail.fullname,
          avatar: userByEmail.avatar,
          comment: comment,
          createdAt: new Date(),
          commentId: uuidv4(),
        }),
      }).then(() => {
        toast.success("Comment this post is successfully");
        reset();
        setLoadingButton(false);
      });
    } else {
      toast.info("Please login to do it");
    }
  };

  const handleDeleteComment = (comment) => {
    updateDoc(commentRef, {
      commentIdUsers: arrayRemove(comment),
    })
      .then((e) => {
        toast.success("Remove comment this post is successfully");
      })
      .catch((error) => {
        toast.error("Cannot remove comment this post is successfully");
      });
  };

  const handleEditComment = async (comment) => {
    console.log("comment", inputValue);
    setInputEdit(false);
    const updateArrayCompany = {
      commentIdUsers: arrayUnion({
        ...comment,
        comment: inputValue,
      }),
    };
    updateDoc(commentRef, updateArrayCompany)
      .then(() => {
        alert("Ok");
      })
      .catch((error) => {
        alert(error.message);
      });
  };

  if (!userInfo) return;
  return (
    <div className="flex justify-center items-center">
      <div className="w-full h-auto px-7 rounded-[12px] bg-white p-4 shadow-md border">
        <p className="text-xl mb-5 font-semibold text-blue-900 cursor-pointer transition-all hover:text-black">
          Add Comment
        </p>
        <form onSubmit={handleSubmit(handleAddComment)}>
          <Field>
            <Textarea
              row={4}
              name="comment"
              placeholder="Add your comments here"
              control={control}
              className="font-sm p-[16px] outline-none border-gray-300 w-full resize-none border rounded-lg placeholder:text-sm"
              error={errors?.comment?.message}
            ></Textarea>
          </Field>

          <div className="flex justify-end mt-2">
            <Button
              type="submit"
              kind="ghost"
              className="h-12 w-[200px] hover:text-white rounded-lg transition-all cursor-pointer hover:bg-primary"
              isLoading={loadingButton}
              disabled={loadingButton}
            >
              Submit comment
            </Button>
          </div>
        </form>

        <ul>
          {comments.length > 0 &&
            comments.map((item) => (
              <li key={uuidv4()}>
                <div className="author">
                  <div className="author-image">
                    <img
                      src={item.avatar}
                      alt={item.fullname}
                      className="w-[100px] h-[100px] rounded-lg"
                    />
                  </div>
                  <div className="author-content">
                    <div className="author-name">
                      <Link to={`/author/${item.username}`}>
                        {item.fullname}
                      </Link>
                    </div>
                    {InputEdit &&
                    item.userId === userByEmail.id &&
                    item.commentId === InputEditValue.commentId ? (
                      <Field>
                        <Textarea
                          row={4}
                          name="comment"
                          placeholder="Edit your comments here"
                          control={control}
                          className="font-sm p-[16px] outline-none border-gray-300 w-full resize-none border rounded-lg placeholder:text-sm"
                          error={errors?.comment?.message}
                          onChange={(e) => setInputValue(e.target.value)}
                          value={inputValue}
                        ></Textarea>
                      </Field>
                    ) : (
                      <div className="author-desc">{item.comment}</div>
                    )}
                  </div>
                  {item.userId === userByEmail.id && (
                    <>
                      {InputEdit &&
                      item.commentId === InputEditValue.commentId ? (
                        <div
                          onClick={() => handleEditComment(item)}
                          className="flex items-center justify-center gap-x-10 cursor-pointer bg-[#6191e6] hover:bg-blue-500 flex-[0.1] transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="#fff"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M4.5 12.75l6 6 9-13.5"
                            />
                          </svg>
                        </div>
                      ) : (
                        <div
                          onClick={() => {
                            setInputEditValue(item);
                            setInputEdit(true);
                          }}
                          className="flex items-center justify-center gap-x-10 cursor-pointer bg-[#6191e6] hover:bg-blue-500 flex-[0.1] transition-all"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            strokeWidth="1.5"
                            stroke="#fff"
                            className="w-7 h-7"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10"
                            />
                          </svg>
                        </div>
                      )}
                      <div
                        onClick={() => handleDeleteComment(item)}
                        className="flex items-center justify-center gap-x-10 cursor-pointer bg-[#fc5776] rounded-r-lg hover:bg-red-500 flex-[0.1] transition-all"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="1.5"
                          stroke="#fff"
                          className="w-7 h-7"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0"
                          />
                        </svg>
                      </div>
                    </>
                  )}
                </div>
              </li>
            ))}
        </ul>
      </div>
    </div>
  );
};

export default CommentPostDetailsPage;
