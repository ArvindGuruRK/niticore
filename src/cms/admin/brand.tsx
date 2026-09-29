/* eslint-disable @next/next/no-img-element -- static SVGs from /public inside the Payload admin, which next/image can't optimise */

/** The Niticore wordmark on the admin sign-in screen */
export function Logo() {
  return <img src="/logo/niticore.svg" alt="Niticore" width={156} height={38} style={{ height: 44, width: "auto" }} />;
}

/** The Niticore mark in the admin's top-left corner */
export function Icon() {
  return <img src="/logo/niticore-mark.svg" alt="Niticore" width={28} height={28} style={{ height: 28, width: "auto" }} />;
}
