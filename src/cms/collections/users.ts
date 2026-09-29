import type { CollectionConfig } from "payload";
import { signedIn } from "../access";

/**
 * People who can sign in to /admin. Every user can write and publish; only signed-in users can add
 * more. The very first user is created on the admin's welcome screen.
 */
export const Users: CollectionConfig = {
  slug: "users",
  labels: { singular: "User", plural: "Users" },
  admin: {
    useAsTitle: "name",
    defaultColumns: ["name", "email", "updatedAt"],
    group: "Admin",
  },
  auth: {
    // Lock an account for 15 minutes after 5 wrong passwords in a row
    maxLoginAttempts: 5,
    lockTime: 15 * 60 * 1000,
    // Sessions last a working day
    tokenExpiration: 8 * 60 * 60,
    cookies: { secure: process.env.NODE_ENV === "production", sameSite: "Lax" },
  },
  access: { create: signedIn, read: signedIn, update: signedIn, delete: signedIn },
  fields: [{ name: "name", type: "text", required: true }],
};
