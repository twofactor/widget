// this is the component for the widget guy
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export default function Widget({
  taskType,
  isCelebrating,
  purchasedItems,
  stretchStage,
}: {
  taskType: string | null;
  isCelebrating: boolean;
  purchasedItems: string[];
  stretchStage?: string;
}) {
  if (!purchasedItems) return null;
  const determineImage = () => {
    if (isCelebrating) {
      return "/character/wow.gif";
    }
    if (taskType === "BRUSH") {
      return "/character/brush.gif";
    }
    if (taskType === "LAUNDRY") {
      return "/character/laundry.gif";
    }
    if (taskType === "EXCERCISE") {
      if (stretchStage === "LEFT") return "/character/stretcha.gif";
      if (stretchStage === "RIGHT") return "/character/stretchb.gif";
      if (stretchStage === "FORWARD") return "/character/stretchc.gif";
      return "/character/excercise.gif";
    }
    if (taskType === "COOK") {
      return "/character/cook.gif";
    }
    return "/character/idle.gif";
  };
  return (
    <div className="relative w-full h-full max-w-[400px] max-h-[400px]">
      {/* Centered Image */}
      <motion.div
        className="absolute flex justify-center items-center w-full h-full"
        style={{ zIndex: 50 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.7,
        }}
      >
        <img
          src={determineImage()}
          alt="Centered Image"
          className="w-[164px] mt-[80px] z-50"
        />
      </motion.div>
      {/* Room Background */}
      <motion.div
        className="absolute inset-0"
        style={{ zIndex: 0 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      />
      {/* Eames Chair */}
      <motion.div
        className="absolute left-[5%] top-[30%]"
        style={{ zIndex: 1 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.2,
        }}
      >
        {purchasedItems.includes("chair") ? (
          <img src="/stuff/chair.png" alt="Eames Chair" className="w-48" />
        ) : (
          <img
            src="/stuff/oldchair.png"
            alt="Eames Chair"
            className="w-12 mt-16 ml-6"
          />
        )}
      </motion.div>
      {/* Mattress/Mat */}
      <motion.div
        className="absolute left-[5%] top-[68%]"
        style={{ zIndex: 1 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.3,
        }}
      >
        {purchasedItems.includes("mattress") ? (
          <img src="/stuff/mattress.png" alt="Mattress" className="w-32" />
        ) : (
          <img src="/stuff/trash.png" alt="Trash" className="w-12" />
        )}
      </motion.div>
      {/* Desk with Computer */}
      <motion.div
        className="absolute right-[5%] top-[40%]"
        style={{ zIndex: 1 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.4,
        }}
      >
        {purchasedItems.includes("desk") ? (
          <img src="/stuff/desk.png" alt="Desk" className="w-36" />
        ) : (
          <img src="/stuff/laptop.png" alt="Desk" className="w-12 mt-12 mr-6" />
        )}

        {purchasedItems.includes("computer") && (
          <motion.img
            src="/stuff/computer.png"
            alt="Computer"
            className="absolute top-[-65px] right-2 w-24"
            style={{ zIndex: 2 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.3 }}
          />
        )}
        {purchasedItems.includes("boba") && (
          <motion.img
            src="/stuff/boba.png"
            alt="Boba Tea"
            className="absolute top-[-20px] right-24 w-8"
            style={{ zIndex: 2 }}
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.3 }}
          />
        )}
      </motion.div>
      {/* Plushies */} {/* // plushies */}
      <motion.div
        className="absolute right-[5%] top-[40%]"
        style={{ zIndex: 1 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.4,
        }}
      >
        <div className="flex gap-0 z-50">
          {purchasedItems.includes("Dog") && (
            <img
              src="/plushies/dog.png"
              alt="Dog"
              className="w-12 mt-24 mr-0"
            />
          )}
          {purchasedItems.includes("Cat") && (
            <img
              src="/plushies/cat.png"
              alt="Cat"
              className="w-12 mt-24 mr-0"
            />
          )}
          {purchasedItems.includes("Hippo") && (
            <img
              src="/plushies/hippo.png"
              alt="Hippo"
              className="w-12 mt-24 mr-0"
            />
          )}
          {purchasedItems.includes("Frog") && (
            <img
              src="/plushies/frog.png"
              alt="Frog"
              className="w-12 mt-24 mr-0"
            />
          )}
          {purchasedItems.includes("Giraffe") && (
            <img
              src="/plushies/giraffe.png"
              alt="Giraffe"
              className="w-12 mt-24 mr-0"
            />
          )}
        </div>
      </motion.div>
      {/* poster Logo on Wall */}
      <motion.div
        className="absolute top-[15%] right-[60%]"
        style={{ zIndex: 1 }}
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{
          type: "spring",
          damping: 8,
          stiffness: 100,
          delay: 0.1,
        }}
      >
        {purchasedItems.includes("poster") ? (
          <img src="/stuff/poster.png" alt="Cursor Logo" className="w-16" />
        ) : (
          <img src="/stuff/stains.png" alt="Cursor Logo" className="w-16" />
        )}
      </motion.div>
    </div>
  );
}
