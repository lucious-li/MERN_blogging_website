import React, { useContext, useState } from "react";
import { getDay } from "../common/date";
import { UserContext } from "../App";
import toast from "react-hot-toast";
import CommentField from "./comment-field.component";
import { BlogContext } from "../pages/blog.page";
import axios from "axios";

const CommentCard = ({ index, leftVal, commentData }) => {
  let {
    commented_by: {
      personal_info: { profile_img, fullname, username: commented_by_username },
    },
    commentedAt,
    comment,
    _id,
    children,
  } = commentData;

  let {
    blog,
    blog: {
      comments,
      comments: { results: commentArr },
      activity,
      activity: { total_parent_comments },
      author: {
        personal_info: { username: blog_author_name },
      },
    },
    setBlog,
    setTotalParentCommentsLoaded,
  } = useContext(BlogContext);

  let {
    userAuth: { access_token, username },
  } = useContext(UserContext);

  const [isReplying, setReplying] = useState(false);

  const getParentIndex = () => {
    let startingPoint = index - 1;

    try {
      while (
        commentArr[startingPoint].childrenLevel >= commentData.childrenLevel
      ) {
        startingPoint--;
      }
    } catch {
      startingPoint = undefined;
    }

    return startingPoint;
  };

  const removeCommentsCard = (startingPoint, isDelete = false) => {
    if (commentArr[startingPoint]) {
      while (
        commentArr[startingPoint].childrenLevel > commentData.childrenLevel
      ) {
        commentArr.splice(startingPoint, 1);
        if (!commentArr[startingPoint]) {
          break;
        }
      }
    }
    if (isDelete) {
      let parentIndex = getParentIndex();

      if (parentIndex != undefined) {
        commentArr[parentIndex].children = commentArr[
          parentIndex
        ].children.filter((child) => child != _id);

        if (!commentArr[parentIndex].children.length) {
          commentArr[parentIndex].isReplyLoaded = false;
        }
      }

      commentArr.splice(index, 1);
    }
    if (commentData.childrenLevel == 0 && isDelete) {
      setTotalParentCommentsLoaded((preVal) => preVal - 1);
    }
    setBlog({
      ...blog,
      comments: { results: commentArr },
      activity: {
        ...activity,
        total_parent_comments:
          total_parent_comments -
          (commentData.childrenLevel == 0 && isDelete ? 1 : 0),
      },
    });
  };

  const handleReplyClick = () => {
    if (!access_token) {
      return toast.error("login first to leave a reply");
    }
    setReplying((preVal) => !preVal);
  };

  const hideReplies = () => {
    commentData.isReplyLoaded = false;
    removeCommentsCard(index + 1);
  };

  const LoadReplies = ({ skip = 0, currentIndex = index }) => {
    if (commentArr[currentIndex].children.length) {
      hideReplies();

      axios
        .post(import.meta.env.VITE_SERVER_DOMAIN + "/get-replies", {
          _id: commentArr[currentIndex]._id,
          skip,
        })
        .then(({ data: { replies } }) => {
          commentArr[currentIndex].isReplyLoaded = true;
          for (let i = 0; i < replies.length; i++) {
            replies[i].childrenLevel =
              commentArr[currentIndex].childrenLevel + 1;

            commentArr.splice(currentIndex + 1 + i + skip, 0, replies[i]);
          }

          setBlog({
            ...blog,
            comments: { ...comments, results: commentArr },
          });
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const deleteComment = (e) => {
    e.target.setAttribute("disabled", true);
    axios
      .post(
        import.meta.env.VITE_SERVER_DOMAIN + "/delete-comment",
        {
          _id,
        },
        { headers: { Authorization: `Bearer ${access_token}` } }
      )
      .then(({ data }) => {
        e.target.removeAttribute("disabled");
        removeCommentsCard(index + 1, true);
      })

      .catch((err) => {
        console.log(err);
      });
  };

  const LoadMoreReplies = () => {
    let parentIndex = getParentIndex();
    let button = (
      <button
        onClick={() =>
          LoadReplies({
            skip: index - parentIndex,
            currentIndex: parentIndex,
          })
        }
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-md flex items-center gap-2"
      >
        Load More Replies
      </button>
    );

    if (commentArr[index + 1]) {
      if (
        commentArr[index + 1].childrenLevel < commentArr[index].childrenLevel
      ) {
        if (index - parentIndex < commentArr[parentIndex].children.length) {
          return button;
        }
      }
    } else {
      if (parentIndex) {
        if (index - parentIndex < commentArr[parentIndex].children.length) {
          return button;
        }
      }
    }
  };

  return (
    <div className="w-full  " style={{ paddingLeft: `${leftVal * 10}px` }}>
      <div className="my-5 p-6 rounded-md border border-grey">
        <div className="flex gap-3 items-center mb-8">
          <img src={profile_img} className="w-6 h-6 rounded-full" />
          <p className="line-clamp-1">
            {fullname}@{commented_by_username}
          </p>
          <p className="min-w-fit">{getDay(commentedAt)}</p>
        </div>

        <p className="font-gelasio text-xl ml-3">{comment}</p>
        <div className="flex gap-5 items-center mt-5">
          {commentData.isReplyLoaded ? (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounder-md flex items-center gap-2 "
              onClick={hideReplies}
            >
              <i className="fi fi-rs-comment-dots"></i> Hide Reply
            </button>
          ) : (
            <button
              className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounder-md flex items-center gap-2 "
              onClick={LoadReplies}
            >
              <i className="fi fi-rs-comment-dots"></i> {children.length} Reply
            </button>
          )}

          <button className="underline" onClick={handleReplyClick}>
            Reply
          </button>

          {username == commented_by_username || username == blog_author_name ? (
            <button
              onClick={deleteComment}
              className="p-2 px-3 rounded-md border border-grey ml-auto hover:bg-red/30 hover:text-red flex items-center"
            >
              <i className="fi fi-bs-trash"></i>
            </button>
          ) : (
            ""
          )}
        </div>

        {isReplying ? (
          <div className="mt-8">
            <CommentField
              action="reply"
              index={index}
              replyingTo={_id}
              setReplying={setReplying}
            />
          </div>
        ) : (
          ""
        )}
      </div>

      <LoadMoreReplies />
    </div>
  );
};

export default CommentCard;
