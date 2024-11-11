"use client";

import { motion, useAnimation } from "framer-motion";
import { useEffect, useState } from "react";
import useSound from "use-sound";

interface ClawMachineProps {
  onClose: () => void;
  onWin: (item: string) => void;
}

interface Item {
  id: number;
  name: string;
  image: string;
  position: { x: number; y: number };
  isGrabbed?: boolean;
}

export function ClawMachine({ onClose, onWin }: ClawMachineProps) {
  const [playClawTheme] = useSound("/sounds/clawmachinetheme.mp3");
  const [winningItem, setWinningItem] = useState<string | null>(null);
  // Initial items in a pile formation

  useEffect(() => {
    // Play theme on load
    playClawTheme();
  }, []);

  const [items, setItems] = useState<Item[]>([
    {
      id: 12312,
      name: "Cat",
      image: "/plushies/cat.png",
      position: { x: 20, y: 370 },
    },
    {
      id: 22323,
      name: "Hippo",
      image: "/plushies/hippo.png",
      position: { x: 130, y: 320 },
    },
    {
      id: 321312,
      name: "Frog",
      image: "/plushies/frog.png",
      position: { x: 150, y: 370 },
    },
    {
      id: 44123421,
      name: "Dog",
      image: "/plushies/dog.png",
      position: { x: 80, y: 370 },
    },
    {
      id: 512312,
      name: "Giraffe",
      image: "/plushies/giraffe.png",
      position: { x: 200, y: 370 },
    },
  ]);

  const [clawPosition, setClawPosition] = useState(200);
  const [isDropping, setIsDropping] = useState(false);
  const [grabbedItem, setGrabbedItem] = useState<Item | null>(null);
  const clawControls = useAnimation();
  const itemControls = useAnimation();
  const [clawTilt, setClawTilt] = useState(0);
  const [isClawOpen, setIsClawOpen] = useState(true);
  const [successPopup, setSuccessPopup] = useState<Item | null>(null);

  // Helper function to render different shapes
  const renderItem = (item: Item) => {
    return (
      <img
        src={item.image}
        alt="plushie"
        className="w-24 h-24 object-contain"
      />
    );
  };

  const moveLeft = async () => {
    if (isDropping) return;
    const newPosition = Math.max(40, clawPosition - 20);
    setClawPosition(newPosition);

    setClawTilt(-15);

    await clawControls.start({
      left: newPosition,
      rotate: -15,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    });

    const timeoutId = setTimeout(() => {
      clawControls.start({
        rotate: 0,
        transition: { type: "spring", damping: 8, stiffness: 100 },
      });
      setClawTilt(0);
    }, 200);

    await itemControls.start({
      left: newPosition,
      top: 116,
      transition: { type: "spring", damping: 20, stiffness: 300 },
    });
  };

  const moveRight = async () => {
    if (isDropping) return;
    const newPosition = Math.min(360, clawPosition + 20);
    setClawPosition(newPosition);

    setClawTilt(15);

    await clawControls.start({
      left: newPosition,
      rotate: 15,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    });

    const timeoutId = setTimeout(() => {
      clawControls.start({
        rotate: 0,
        transition: { type: "spring", damping: 8, stiffness: 100 },
      });
      setClawTilt(0);
    }, 200);

    await itemControls.start({
      left: newPosition,
      top: 116,
      transition: { type: "spring", damping: 20, stiffness: 300 },
    });
  };

  const dropClaw = async () => {
    if (isDropping) return;
    setIsDropping(true);

    setClawTilt(0);
    await clawControls.start({
      rotate: 0,
      transition: { type: "spring", damping: 12, stiffness: 200 },
    });

    // Drop animation
    await clawControls.start({
      top: 320,
      transition: { type: "spring", damping: 20, stiffness: 100 },
    });

    // Close the claw
    setIsClawOpen(false);

    // Find closest item to grab
    const closestItem = items.find(
      (item) => !item.isGrabbed && Math.abs(item.position.x - clawPosition) < 30
    );

    if (closestItem) {
      // Mark item as grabbed
      setItems(
        items.map((item) =>
          item.id === closestItem.id ? { ...item, isGrabbed: true } : item
        )
      );
      setGrabbedItem(closestItem);

      // Wait a frame to ensure the grabbed item is rendered
      await new Promise(requestAnimationFrame);

      // Now the itemControls will be properly initialized
      // First, move item to claw position
      //   await itemControls.start({
      //     left: clawPosition,
      //     top: 300, // Match the claw's dropped position
      //     transition: { duration: 0.2 },
      //   });

      // Then return up together
      await Promise.all([
        itemControls.start({
          top: 180,
          transition: { type: "spring", damping: 20, stiffness: 100 },
        }),
        clawControls.start({
          top: 130,
          transition: { type: "spring", damping: 20, stiffness: 100 },
        }),
      ]);

      // Move to bin together
      await Promise.all([
        clawControls.start({
          left: 280,
          transition: { type: "spring", damping: 20, stiffness: 200 },
        }),
        itemControls.start({
          left: 280,
          transition: { type: "spring", damping: 20, stiffness: 200 },
        }),
      ]);

      // Drop in bin
      setIsClawOpen(true);
      await itemControls.start({
        top: 400,
        transition: { type: "spring", damping: 15, stiffness: 100 },
      });

      // Show success popup when item is dropped
      if (closestItem) {
        setSuccessPopup(closestItem);
      }

      // Remove item from game
      setItems(items.filter((item) => item.id !== closestItem.id));
      setGrabbedItem(null);
    }

    // Reset claw position and open it again
    await clawControls.start({
      left: 200,
      top: 100,
      transition: { type: "spring", damping: 20, stiffness: 200 },
    });
    setClawPosition(200);
    setIsClawOpen(true);
    setIsDropping(false);
  };

  return (
    <motion.div
      initial={{ y: "100%" }}
      animate={{ y: 0 }}
      exit={{ y: "100%" }}
      transition={{ type: "spring", damping: 20, stiffness: 300 }}
      className="fixed inset-0 bg-[#4ECAFF] z-30"
    >
      <div className="relative w-full h-full flex justify-center">
        <div className="relative w-[400px] h-full bg-gradient-to-b from-blue-400 to-blue-600">
          {/* Header */}
          <div className="p-4">
            <button
              onClick={onClose}
              className="flex items-center gap-2 text-white"
            >
              <img src="/icons/exit.png" alt="back" className="w-10 h-10" />
              <span>Back</span>
            </button>
          </div>

          {/* Game area */}
          <div className="relative h-[600px]">
            {/* Claw machine frame */}
            <div className="absolute inset-x-4 top-20 bottom-32 border-8 border-blue-300 bg-blue-900/50 rounded-lg">
              <div className="absolute top-0 left-0 right-0 h-2 bg-blue-400" />
            </div>

            {/* Claw */}
            <motion.div
              animate={clawControls}
              initial={{ top: 100, left: 200 }}
              className="absolute z-20"
              style={{ transformOrigin: "top center" }}
            >
              <img
                src={
                  isClawOpen
                    ? "/plushies/claw_open.png"
                    : "/plushies/claw_closed.png"
                }
                alt="claw"
                className="w-24 h-24 object-contain"
              />
              {/* <div className="relative">
                <div className="absolute top-0 left-1/2 w-1 h-32 bg-[#E96330]" />
                <div className="absolute top-12 left-1/2 -translate-x-1/2">
                 
                </div>
              </div> */}
            </motion.div>

            {/* Items in pile - don't show if grabbed */}
            {items.map(
              (item) =>
                !item.isGrabbed && ( // Only show if not grabbed
                  <motion.div
                    key={item.id}
                    className="absolute z-10"
                    style={{
                      left: item.position.x,
                      top: item.position.y,
                    }}
                  >
                    {renderItem(item)}
                  </motion.div>
                )
            )}

            {/* Grabbed item */}
            {grabbedItem && (
              <motion.div
                animate={itemControls}
                initial={{
                  top: grabbedItem.position.y,
                  left: grabbedItem.position.x,
                }}
                className="absolute z-10"
              >
                {renderItem(grabbedItem)}
              </motion.div>
            )}

            {/* Bin */}
            <div className="absolute bottom-40 right-8 w-20 h-20 border-4 border-white rounded-lg" />

            {/* Controls */}
            <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-4">
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={moveLeft}
                disabled={isDropping}
                className="bg-white px-8 py-4 rounded-xl shadow-lg disabled:opacity-50"
              >
                ⬅️
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={dropClaw}
                disabled={isDropping}
                className="bg-white px-8 py-4 rounded-xl shadow-lg disabled:opacity-50"
              >
                🪝
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={moveRight}
                disabled={isDropping}
                className="bg-white px-8 py-4 rounded-xl shadow-lg disabled:opacity-50"
              >
                ➡️
              </motion.button>
            </div>
          </div>
        </div>

        {/* Success Popup */}
        {successPopup && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="fixed inset-0 flex items-center justify-center z-50"
          >
            <div className="bg-white rounded-xl p-8 shadow-lg text-center relative">
              <h2 className="text-2xl font-bold mb-4">Congratulations! 🎉</h2>
              <p className="mb-4">You won a plushie!</p>
              <div className="relative">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                  className="absolute inset-0 flex items-center justify-center w-128 h-128"
                >
                  <img
                    src="/plushies/background.png"
                    alt="star"
                    className="w-128 h-128"
                  />
                </motion.div>
                <img
                  src={successPopup.image}
                  alt="won plushie"
                  className="w-48 h-48 object-contain mx-auto relative z-10"
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => {
                  setSuccessPopup(null);
                  if (successPopup.name) {
                    onWin(successPopup.name);
                  }
                  onClose();
                }}
                className="mt-6 px-6 py-3 bg-yellow-500 text-white rounded-lg font-bold shadow-lg hover:bg-blue-600 transition-colors"
              >
                Claim Plushie!
              </motion.button>
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
