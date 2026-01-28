import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Delete } from "lucide-react";

const NumericKeyboard = ({ value, onChange, onClose, allowDecimal = false, maxLength = null }) => {
  const handleKeyPress = (key) => {
    if (key === "backspace") {
      onChange(value.slice(0, -1));
    } else if (key === "." && allowDecimal) {
      if (!value.includes(".")) {
        onChange(value + ".");
      }
    } else if (key !== ".") {
      const newValue = value + key;
      if (!maxLength || newValue.length <= maxLength) {
        onChange(newValue);
      }
    }
  };

  const keys = [
    ["1", "2", "3"],
    ["4", "5", "6"],
    ["7", "8", "9"],
    [allowDecimal ? "." : "", "0", "backspace"],
  ];

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="fixed inset-0 bg-black/40 z-30"
      />

      {/* Keyboard */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 20 }}
        className="fixed bottom-0 left-0 right-0 bg-[#0a0a0a] border-t border-white/10 rounded-t-3xl p-5 z-40"
      >
        {/* Keyboard */}
        <div className="space-y-3">
          {keys.map((row, rowIdx) => (
            <div key={rowIdx} className="grid grid-cols-3 gap-3">
              {row.map((key, keyIdx) => (
                <motion.button
                  key={keyIdx}
                  onClick={() => handleKeyPress(key)}
                  whileHover={{ scale: key ? 1.05 : 1 }}
                  whileTap={{ scale: key ? 0.95 : 1 }}
                  disabled={!key}
                  className={`py-4 rounded-2xl font-medium text-lg transition-all ${
                    !key
                      ? "bg-transparent"
                      : key === "backspace"
                      ? "bg-red-500/20 border border-red-500/30 hover:bg-red-500/30 text-red-400"
                      : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.1] text-white"
                  }`}
                >
                  {key === "backspace" ? (
                    <Delete size={20} className="mx-auto" />
                  ) : (
                    key
                  )}
                </motion.button>
              ))}
            </div>
          ))}
        </div>
      </motion.div>
    </>
  );
};

export default NumericKeyboard;
