"use server";

import { signIn, signOut } from "@/lib/auth";

export async function loginAction(formData: FormData) {
  // Call NextAuth signIn
}

export async function logoutAction() {
  await signOut();
}
