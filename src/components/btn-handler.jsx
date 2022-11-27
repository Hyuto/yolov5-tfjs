import { useState, useRef } from "react";
import { Webcam } from "../utils/webcam";

const ButtonHandler = ({ cameraRef, videoRef }) => {
  const [streaming, setStreaming] = useState(null); // streaming state
  const inputRef = useRef(null); // video input reference
  const webcam = new Webcam(); // webcam handler

  // closing video streaming
  const closeVideo = () => {
    const url = videoRef.current.src;
    videoRef.current.src = ""; // restore video source
    URL.revokeObjectURL(url); // revoke url

    setStreaming(null); // set streaming to null
    inputRef.current.value = ""; // reset input video
    videoRef.current.style.display = "none"; // hide video
  };

  return (
    <div className="btn-container">
      <input
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const url = URL.createObjectURL(e.target.files[0]); // create blob url
          videoRef.current.src = url; // set video source
          videoRef.current.addEventListener("ended", () => closeVideo()); // add ended video listener
          videoRef.current.style.display = "block"; // show video
          setStreaming("video"); // set streaming to video
        }}
        ref={inputRef}
      />
      <button
        onClick={() => {
          if (streaming === null) inputRef.current.click();
          // if not streaming
          else if (streaming === "video") closeVideo();
          // closing video streaming
          else alert(`Can't handle more than 1 stream\nCurrently streaming : ${streaming}`); // if streaming webcam
        }}
      >
        {streaming === "video" ? "Close" : "Open"} Video
      </button>
      <button
        onClick={() => {
          if (streaming === null) {
            // if not streaming
            webcam.open(cameraRef.current); // open webcam
            cameraRef.current.style.display = "block"; // show camera
            setStreaming("camera"); // set streaming to camera
          } else if (streaming === "camera") {
            // closing video streaming
            webcam.close(cameraRef.current);
            cameraRef.current.style.display = "none";
            setStreaming(null);
          } else alert(`Can't handle more than 1 stream\nCurrently streaming : ${streaming}`); // if streaming video
        }}
      >
        {streaming === "camera" ? "Close" : "Open"} Webcam
      </button>
    </div>
  );
};

export default ButtonHandler;
