import React from "react";
import { Coffee, Heart } from "lucide-react";

/**
 * Site footer
 */
export const Footer = () => {
  return (
    <div className="min-h-0 py-5 px-1 mb-11 lg:mb-0">
      <div className="w-full">
        <ul className="menu menu-horizontal w-full">
          <div className="flex justify-center items-center gap-2 text-sm w-full">
            <div className="flex justify-center items-center gap-2">
              <p className="m-0 text-center">
                Built with <Heart className="inline-block h-4 w-4" /> & <Coffee className="inline-block h-4 w-4" /> at
              </p>
              <a
                className="flex justify-center items-center gap-1"
                href="https://web108.xyz/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="link">Web108</span>
              </a>
            </div>
          </div>
        </ul>
      </div>
    </div>
  );
};
