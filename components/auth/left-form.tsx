"use client";

import { motion } from "framer-motion";
import Image from "next/image";

export function LeftForm() {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="flex items-center justify-center max-w-7xl mx-auto w-full h-full md:h-[40rem] px-4">
        <motion.div
          initial={{
            opacity: 0,
            y: 20,
          }}
          animate={{
            opacity: 1,
            y: 0,
          }}
          transition={{
            duration: 1,
          }}
        >
          <div className="flex flex-col items-center">
            <h1 className="text-center lg:text-4xl text-6xl font-bold text-foreground">
              H&A Develop Experience
            </h1>
            <p className="text-center text-base md:text-lg font-normal text-neutral-500 dark:text-neutral-300 max-w-md mt-2">
              Enhance your Develop Experience with cutting-edge technologies and
              innovative solutions.
            </p>
          </div>
        </motion.div>
        <Image
          src="/LG_REINVENT_09.png"
          alt="Image"
          width="300"
          height="300"
          className="position-absolute home-footer-rotate lg:block hidden"
          style={{
            position: "absolute",
            left: "30%",
            top: "-10%",
            transform: "rotate(-10deg)",
          }}
          // Add the following line to hide the image on smaller screens
        />
        <Image
          src="/footer-star.png"
          alt="Image"
          width="50"
          height="50"
          className="position-absolute home-footer-rotate lg:block hidden transation-slow animate-pulse"
          style={{
            position: "absolute",
            left: "6%",
            top: "40%",
            transform: "rotate(-10deg)",
          }}
          // Add the following line to hide the image on smaller screens
        />
        <Image
          src="/footer-diamond.png"
          alt="Image"
          width="50"
          height="50"
          className="position-absolute home-footer-rotate lg:block hidden transation-slow animate-pulse"
          style={{
            position: "absolute",
            left: "40%",
            top: "70%",
            transform: "rotate(-10deg)",
          }}
          // Add the following line to hide the image on smaller screens
        />
      </div>
    </div>
  );
}
