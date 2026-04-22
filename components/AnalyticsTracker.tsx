"use client";

import { useEffect } from "react";
import { db } from "@/lib/firebase";
import { doc, increment, setDoc } from "firebase/firestore";

export function AnalyticsTracker() {
  useEffect(() => {
    // Check if we already counted this visitor
    if (typeof window !== "undefined") {
      const hasVisited = localStorage.getItem("hasVisitedPlatform");
      if (!hasVisited) {
        // Increment visitor count
        const analyticsRef = doc(db, "settings", "analytics");
        setDoc(analyticsRef, { totalViews: increment(1) }, { merge: true })
        .then(() => {
          localStorage.setItem("hasVisitedPlatform", "true");
        })
        .catch((e) => {
          console.error("Could not record analytics: ", e);
        });
      }
    }
  }, []);

  return null;
}
