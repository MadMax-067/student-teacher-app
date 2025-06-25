import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from "firebase/auth";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { logAction } from "@/lib/logging";

export async function registerUser(email, password, name, role) {
  if (!["student", "admin"].includes(role)) {
    throw new Error("Invalid role specified");
  }

  try {
    console.log("Starting registration process for:", email, role);
    
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const uid = userCredential.user.uid;
    console.log("User created in Auth with UID:", uid);

    await setDoc(doc(db, "users", uid), {
      email,
      name,
      role,
      approved: role === "admin" ? true : false,
      createdAt: new Date(),
    });
    console.log("User document created in Firestore");

    await logAction(uid, `User registered as ${role}`);
    
    await signOut(auth);
    console.log("User signed out after registration");

    return uid;
  } catch (error) {
    console.error("Registration error:", error);
    throw error;
  }
}

export async function loginUser(email, password) {
  try {
    console.log("Attempting login for:", email);
    
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("Login successful for UID:", userCredential.user.uid);
    
    await logAction(userCredential.user.uid, "User logged in");
    
    return userCredential;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
}

export async function logoutUser() {
  try {
    const uid = auth.currentUser?.uid;
    if (uid) {
      await logAction(uid, "User logged out");
    }
    return await signOut(auth);
  } catch (error) {
    console.error("Logout error:", error);
    throw error;
  }
}

export async function getUserRole(uid) {
  try {
    console.log("Getting role for UID:", uid);
    
    const userDoc = await getDoc(doc(db, "users", uid));
    
    if (!userDoc.exists()) {
      console.error("User document not found for UID:", uid);
      throw new Error("User not found");
    }
    
    const userData = userDoc.data();
    console.log("User data retrieved:", {
      role: userData.role,
      approved: userData.approved,
      name: userData.name
    });
    
    return {
      role: userData.role,
      approved: userData.approved,
      name: userData.name || "",
    };
  } catch (error) {
    console.error("Get user role error:", error);
    throw error;
  }
}

export async function changePassword(currentPassword, newPassword) {
  if (!auth.currentUser) {
    throw new Error("No user is currently logged in");
  }

  try {
    const credential = EmailAuthProvider.credential(
      auth.currentUser.email,
      currentPassword
    );
    
    await reauthenticateWithCredential(auth.currentUser, credential);
    
    await updatePassword(auth.currentUser, newPassword);
    
    await logAction(auth.currentUser.uid, "User changed password");
    
    return true;
  } catch (error) {
    console.error("Change password error:", error);
    
    if (error.code === "auth/wrong-password") {
      throw new Error("Current password is incorrect");
    } else if (error.code === "auth/weak-password") {
      throw new Error("New password is too weak");
    } else {
      throw new Error("Failed to change password");
    }
  }
}
