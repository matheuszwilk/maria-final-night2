"use client";
import React, { useEffect, useRef, useState } from "react";
import createGlobe from "cobe";

const Earth: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    let phi = 0;

    const globe = createGlobe(canvasRef.current!, {
      devicePixelRatio: 2,
      width: 550 * 2,
      height: 550 * 2,
      phi: 0,
      theta: 0.25,
      dark: 1,
      diffuse: 1.2,
      mapSamples: 30000,
      mapBrightness: 6,
      baseColor: [10, 0.5, 3],
      markerColor: [5.1, 0.8, 1], // Customize marker color here
      glowColor: [1, 1, 2],
      opacity: 1,
      offset: [0, 0],
      markers: [
        // longitude latitude
      ],
      onRender: (state: Record<string, any>) => {
        // Called on every animation frame.
        // `state` will be an empty object, return updated params.\
        state.phi = phi;
        phi += 0.003;
      },
    });

    return () => {
      globe.destroy();
    };
  }, []);

  return (
    <div className="flex items-center justify-center m-4">
      <canvas
        ref={canvasRef}
        style={{ width: 550, height: 550, maxWidth: "100%", aspectRatio: "1" }}
      />
    </div>
  );
};

export default Earth;
