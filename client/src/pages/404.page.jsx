import { Link } from "react-router-dom";
import PageNotFoundImage from "../imgs/404.png";
import fullLogo from "../imgs/full-logo.png";

const PageNotFound = () => {
  return (
    <section className="h-cover relative p-10 flex flex-col items-center gap-20 text-center">
      <img
        src={PageNotFoundImage}
        className="select-none border-3 border-grey w-72 aspect-square object-cover rounded"
      />
      <h1 className="text-4xl font-gelasio leading-7 ">Page not found</h1>
      <p className="text-dark-grey text-xl leading-7 -mt-8">
        {" "}
        the page you are looking does not exists. Head back to the{" "}
        <Link to="/" className="text-black underline">
          {" "}
          Home Page
        </Link>
      </p>

      <div className="mt-auto">
        <img
          src={fullLogo}
          className="h-8 object-contain block mx-auto select-none"
        />
        <p className="mt-5 text-dark-grey">Read the story around world !</p>
      </div>
    </section>
  );
};

export default PageNotFound;
