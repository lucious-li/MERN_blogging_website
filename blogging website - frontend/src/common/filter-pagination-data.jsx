import axios from "axios";

export const filterPaginationData = async ({
  state,
  data,
  page,
  counteRoute,
  data_to_send = {},
  create_new_arr = false,
}) => {
  let obj;
  if (state != null && !create_new_arr) {
    obj = { ...state, results: [...state.results, ...data], page: page };
  } else {
    await axios
      .post(import.meta.env.VITE_SERVER_DOMAIN + counteRoute, data_to_send)
      .then(({ data: { totalDocs } }) => {
        obj = { results: data, page: 1, totalDocs };
      })
      .catch((err) => {
        console.log(err);
      });
  }

  return obj;
};
