import type { Access } from "payload";

/** Signed-in editors only. Payload's default too, restated so each collection reads plainly. */
export const signedIn: Access = ({ req }) => Boolean(req.user);

/** Anyone, including visitors: only for media files, which the public pages show. */
export const anyone: Access = () => true;
