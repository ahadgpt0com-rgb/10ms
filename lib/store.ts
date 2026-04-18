"use client";

import { useState, useEffect } from "react";

export const getStore = (key: string) => {
  if (typeof window === "undefined") return [];
  const val = localStorage.getItem(key);
  return val ? JSON.parse(val) : [];
};

export const setStore = (key: string, val: any) => {
  localStorage.setItem(key, JSON.stringify(val));
  window.dispatchEvent(new Event("store_changed"));
};

export const localDb = {
  loginOrRegister: (pin: string) => {
    let users = getStore("users");
    let user = users.find((u: any) => u.pin === pin);
    if (!user) {
      // 9999 automatically grants admin panel access for demonstration
      const role = pin === "9999" ? "admin" : "student";
      user = { 
        uid: `u_${Date.now()}_${pin}`, 
        username: `Student ${pin}`, 
        pin, 
        role, 
        createdAt: Date.now() 
      };
      users.push(user);
      setStore("users", users);
    }
    localStorage.setItem("currentUser", JSON.stringify(user));
    window.dispatchEvent(new Event("auth_changed"));
    return user;
  },
  logout: () => {
    localStorage.removeItem("currentUser");
    window.dispatchEvent(new Event("auth_changed"));
  },
  getCurrentUser: () => {
    if (typeof window === "undefined") return null;
    const val = localStorage.getItem("currentUser");
    return val ? JSON.parse(val) : null;
  },
  addPost: (post: any) => {
    const posts = getStore("posts");
    posts.unshift({ id: `p_${Date.now()}`, createdAt: Date.now(), ...post });
    setStore("posts", posts);
  },
  deletePost: (id: string) => {
    setStore("posts", getStore("posts").filter((p: any) => p.id !== id));
  },
  deleteUser: (uid: string) => {
    setStore("users", getStore("users").filter((u: any) => u.uid !== uid));
    setStore("posts", getStore("posts").filter((p: any) => p.userId !== uid));
  },
  addFriend: (uid: string, friendId: string, friendUsername: string) => {
    const key = `friends_${uid}`;
    const friends = getStore(key);
    if (!friends.find((f: any) => f.id === friendId)) {
      friends.push({ id: friendId, friendUsername, addedAt: Date.now() });
      setStore(key, friends);
    }
  },
  removeFriend: (uid: string, friendId: string) => {
    const key = `friends_${uid}`;
    setStore(key, getStore(key).filter((f: any) => f.id !== friendId));
  },
  updateProfilePic: (uid: string, dataUrl: string) => {
    const users = getStore("users");
    const updatedUsers = users.map((u: any) => u.uid === uid ? { ...u, profilePic: dataUrl } : u);
    setStore("users", updatedUsers);

    const currentUser = localDb.getCurrentUser();
    if (currentUser?.uid === uid) {
      localStorage.setItem("currentUser", JSON.stringify({ ...currentUser, profilePic: dataUrl }));
      window.dispatchEvent(new Event("auth_changed"));
    }
  }
};

export function useStoreCollection<T>(key: string): T[] {
  const [data, setData] = useState<T[]>([]);
  useEffect(() => {
    setData(getStore(key));
    const handle = () => setData(getStore(key));
    window.addEventListener("store_changed", handle);
    return () => window.removeEventListener("store_changed", handle);
  }, [key]);
  return data;
}
