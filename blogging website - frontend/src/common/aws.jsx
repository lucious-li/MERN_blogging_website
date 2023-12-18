import axios from "axios";

export const uploadImage = async (img) => {
  let imgUrl = null;

  await axios
    .get(import.meta.env.VITE_SERVER_DOMAIN + "/get-upload-url")
    .then(async ({ data: { uploadURL } }) => {
      await axios({
        method: "PUT",
        url: uploadURL,
        headers: { "Content-Type": "image/jpeg" },
        data: img,
      })
        .then(() => {
          imgUrl = uploadURL.split("?")[0];
        })
        .catch((error) => {
          console.error("Error uploading image:", error.message);
          console.error("Response data:", error.response.data);
        });
    })
    .catch((error) => {
      console.error("Error getting upload URL:", error.message);
      console.error("Response data:", error.response.data);
    });

  return imgUrl;
};
