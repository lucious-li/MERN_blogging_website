import { Link, useParams } from "react-router-dom";
import logo from "../imgs/logo.png";
import AnimationWrapper from "../common/page-animation";
import defaultBanner from "../imgs/blog_banner.png";
import { useContext, useEffect, useRef } from "react";
import { uploadImage } from "../common/aws";
import { toast, Toaster } from "react-hot-toast";
import { EditorContext } from "../pages/editor.pages";
import EditorJs from "@editorjs/editorjs";
import { tools } from "./tools.component";
import axios from "axios";
import { UserContext } from "../App";
import { useNavigate } from "react-router-dom";

const BlogEditor = () => {
  let {
    blog,
    blog: { title, banner, content, tags, des },
    setBlog,
    textEditor,
    setTextEditor,
    setEditorState,
  } = useContext(EditorContext);

  let { darkMode } = useContext(UserContext);
  let {
    userAuth: { access_token },
  } = useContext(UserContext);

  let { blog_id } = useParams;

  let navigate = useNavigate();

  useEffect(() => {
    if (!textEditor.isReady) {
      setTextEditor(
        new EditorJs({
          holderId: "textEditor",
          data: Array.isArray(content) ? content[0] : content,
          tools: tools,
          placeholder: "let start!",
        })
      );
    }
  }, []);

  const handleBannerUpload = (e) => {
    let image = e.target.files[0];
    if (image) {
      let loadingToast = toast.loading("Uploading...");
      uploadImage(image)
        .then((url) => {
          if (url) {
            toast.dismiss(loadingToast);
            toast.success("Uploaded!!");

            setBlog({ ...blog, banner: url });
          }
        })
        .catch((err) => {
          toast.dismiss(loadingToast);
          return toast.error(err);
        });
    }
  };

  const handleTitleKeydown = (e) => {
    if (e.keyCode == 13) {
      //the key code of enter is 13
      e.preventDefault();
    }
  };
  const handleTitleChange = (e) => {
    let input = e.target;
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
    setBlog({ ...blog, title: input.value });
  };

  const handleError = (e) => {
    let img = e.target;
    img.src = defaultBanner;
  };
  const handlePublishEvent = () => {
    if (!banner.length) {
      return toast.error("Upload a blog banner to publish it");
    }

    if (!title.length) {
      toast.error("Write blog title to publish it");
    }
    if (textEditor.isReady) {
      textEditor
        .save()
        .then((data) => {
          if (data.blocks.length) {
            setBlog({ ...blog, content: data });
            setEditorState("publish");
          } else {
            return toast.error("Write something here to publish");
          }
        })
        .catch((err) => {
          console.log(err);
        });
    }
  };
  const handleSaveDraft = (e) => {
    if (e.target.className.includes("disable")) {
      return;
    }
    if (!title.length) {
      return toast.error("Write blog title before saving it as a draft");
    }

    let loadingToast = toast.loading("Saving Draft....");

    e.target.classList.add("disable");

    if (textEditor.isReady) {
      textEditor.save().then((content) => {
        let blogObj = {
          title,
          banner,
          des,
          content,
          tags,
          draft: true,
        };
        axios
          .post(
            import.meta.env.VITE_SERVER_DOMAIN + "/create-blog",
            { ...blogObj, id: blog_id },
            {
              headers: { Authorization: `Bearer ${access_token}` },
            }
          )
          .then(() => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            toast.success("Saved");

            setTimeout(() => {
              navigate("/");
            }, 500);
          })
          .catch(({ response }) => {
            e.target.classList.remove("disable");
            toast.dismiss(loadingToast);
            return toast.error(response.data.error);
          });
      });
    }
  };

  return (
    <>
      <nav className={`navbar ${darkMode ? "bg-black " : "bg-white"}`}>
        <Link to="/" className="flex-none w-10">
          <img src={logo} className={` ${darkMode ? "filter-invert" : ""}`} />
        </Link>
        <p className="max-md:hidden text-black line-clamp-1 w-full">
          {title.length ? title : "New Blog"}
        </p>
        <div className="flex gap-4 ml-auto">
          <button className="btn-dark py-2 " onClick={handlePublishEvent}>
            Publish
          </button>
          <button onClick={handleSaveDraft} className="btn-light py-2">
            Save Draft
          </button>
        </div>
      </nav>
      <Toaster />
      <AnimationWrapper>
        <section>
          <div className="mx-auto max-w-[900px] w-full">
            <div
              className={`relative aspect-video hover:opacity-80 ${
                darkMode ? "bg-black" : "bg-white"
              } border-4 border-grey`}
            >
              <label htmlFor="uplodeBanner">
                <img
                  src={banner}
                  className={`w-full z-20 ${darkMode ? "filter-invert" : ""}`}
                  onError={handleError}
                />
                <input
                  id="uplodeBanner"
                  type="file"
                  accept=".png, .jpg,.jpeg,.bmp"
                  hidden
                  onChange={handleBannerUpload}
                />
              </label>
            </div>
            <textarea
              defaultValue={title}
              placeholder="Blog Title"
              className={`text-4xl ${
                darkMode ? "bg-black text-white" : "bg-white"
              } font-medium w-full h-20 mt-10 leading-tight
              placeholder:opacity-40`}
              onKeyDown={handleTitleKeydown}
              onChange={handleTitleChange}
            ></textarea>

            <hr className="w-full opacity-10 my-5 " />
            <div id="textEditor" className="font-gelasio"></div>
          </div>
        </section>
      </AnimationWrapper>
    </>
  );
};

export default BlogEditor;
