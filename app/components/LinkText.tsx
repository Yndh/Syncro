import React from "react";

interface LinkTextProps {
  text: string;
}

const urlRegex = /((https?:\/\/)[^\s]+)/gi;
export const LinkText = ({ text }: LinkTextProps) => {
  const parts = [];
  let lastIndex = 0;

  text.replace(urlRegex, (url, match, scheme, offset) => {
    if (offset > lastIndex) {
      parts.push(text.slice(lastIndex, offset));
    }

    parts.push(
      <a
        key={offset}
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        style={{ color: "cornflowerblue", textDecoration: "underline" }}
      >
        {url}
      </a>
    );

    lastIndex = offset + url.length;
    return url;
  });

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return <span>{parts}</span>;
};
