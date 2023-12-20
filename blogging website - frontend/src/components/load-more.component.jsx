const LoadMoreDataBtn = ({ state, fetchDataFun }) => {
  if (state != null && state.totalDocs > state.results.length) {
    return (
      <button
        onClick={() => fetchDataFun({ page: state.page + 1 })}
        className="text-dark-grey p-2 px-3 hover:bg-grey/30 rounded-full items-center gap-2"
      >
        Load More
      </button>
    );
  }
};
export default LoadMoreDataBtn;
