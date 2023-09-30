import { LoadingSpinner } from "components/loading";
import React from "react";
import PropTypes from "prop-types";

const Loading = () => {
  return (
    <div className="flex items-start justify-center mt-10 mx-auto">
      <LoadingSpinner
        size="50px"
        className="!border-green-500 !border-t-transparent"
      ></LoadingSpinner>
    </div>
  );
};

Loading.propTypes = {
  list: PropTypes.string,
};
export default Loading;
