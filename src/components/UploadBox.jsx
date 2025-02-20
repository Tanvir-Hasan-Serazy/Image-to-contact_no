"use client";
import React, { useState, useRef } from "react";
import Tesseract from "tesseract.js";
import Webcam from "react-webcam";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const UploadBox = () => {
  const [image, setImage] = useState(null);
  const [phoneNumber, setPhoneNumber] = useState("");
  const webcamRef = useRef(null);

  //Taking Images
  const videoConstraints = {
    width: 720,
    height: 360,
    facingMode: "user",
  };

  // Converting it To Data Type
  const dataURLtoFile = (dataurl, filename) => {
    const arr = dataurl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new File([u8arr], filename, { type: mime });
  };

  //Handling The Uploaded Image
  const handleImageUpload = (event) => {
    if (event.target.files && event.target.files[0]) {
      setImage(event.target.files[0]);
    }
  };

  // Extracting Number From the Image
  const extractPhoneNumber = async () => {
    if (!image) return alert("Please upload an image first.");

    const reader = new FileReader();
    reader.readAsDataURL(image);

    reader.onload = async () => {
      const imgData = reader.result;
      const { data } = await Tesseract.recognize(imgData, "eng", {
        logger: (m) => console.log(m),
        // Logs Progress - optional
        tessedit_char_whitelist: "0123456789+() -",
        tessedit_pageseg_mode: 7,
      });

      const extractedText = data.text;
      console.log("Extracted Text:", extractedText);

      //Tried These parameters but they both failed in some scenarions
      //   const phoneRegex = /(\+?\d{1,4})?(\(?\d{3}\))?\d{3}[\s-]?\d{4}/;
      //   const phoneRegex =/(\+?\d{1,4}\s?-?)?(\(?\d{2,4}\)?\s?-?)?\d{3,4}\s?-?\d{3,4}/g;

      const phoneRegex =
        /(\+?\d{1,4}[\s-]?)?(\(?\d{1,5}\)?[\s-]?)?\d{3,5}[\s-]?\d{3,5}/g;
      const matches = extractedText.match(phoneRegex);
      if (matches) {
        setPhoneNumber(matches[0].replace(/[-\s]/g, ""));
      } else {
        alert("No phone number found.");
      }
    };
  };

  return (
    <>
      <div className="h-[500px] w-fit mx-auto my-auto ">
        <div className="">
          {/* Using Webcam */}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            videoConstraints={videoConstraints}
            className="w-full rounded-lg"
          >
            {({ getScreenshot }) => (
              <Button
                className="mt-2"
                onClick={() => {
                  const imageSrc = getScreenshot();
                  const file = dataURLtoFile(imageSrc, "screenshot.jpg");
                  setImage(file);
                }}
              >
                Capture photo
              </Button>
            )}
          </Webcam>
        </div>

        <Card className="w-full max-w-2xl">
          <CardContent className="flex flex-col gap-4 p-4">
            <div className="grid w-full items-center gap-1.5">
              {/* You Can Also Upload Your Image from Local Device */}
              <Label>Upload an Image</Label>
              <Input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
            </div>

            {/* Preview the Image */}
            {image && (
              <div className="mt-4">
                <Label>Preview</Label>
                <img
                  src={URL.createObjectURL(image)}
                  alt="Preview"
                  className="w-full h-48 object-contain rounded-lg border"
                />
              </div>
            )}

            <Button onClick={extractPhoneNumber}>Extract Phone Number</Button>
            <div>Extracted Phone: {phoneNumber}</div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default UploadBox;
