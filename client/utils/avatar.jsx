// src/utils/avatar.js
const getAvatar = (name) => {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();

  return `https://ui-avatars.com/api/?name=${initials}&background=random&color=fff`;
};

export default getAvatar;
