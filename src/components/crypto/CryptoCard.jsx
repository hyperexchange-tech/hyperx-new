import React from "react";
import { motion } from "framer-motion";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";

const CryptoCard = ({ crypto, onClick }) => {
  const { symbol, name, balance, price, color } = crypto;
  const value = balance * price;
  
  // Random percentage change for demo purposes
  const percentChange = (Math.random() * 10 - 5).toFixed(2);
  const isPositive = parseFloat(percentChange) >= 0;

  return (
    <motion.div
      whileHover={{ y: -5, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="crypto-card rounded-xl p-5 cursor-pointer"
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center" 
            style={{ backgroundColor: `${color}20` }}
          >
            <CryptoIcon name={crypto.id} color={color} />
          </div>
          <div>
            <h3 className="font-bold">{name}</h3>
            <p className="text-sm text-muted-foreground">{symbol}</p>
          </div>
        </div>
        <div className={cn(
          "flex items-center text-sm rounded-full px-2 py-1",
          isPositive ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
        )}>
          {isPositive ? <ArrowUpRight className="h-3 w-3 mr-1" /> : <ArrowDownRight className="h-3 w-3 mr-1" />}
          {percentChange}%
        </div>
      </div>
      <div className="space-y-1">
        <p className="text-2xl font-bold">{balance.toFixed(4)} {symbol}</p>
        <p className="text-muted-foreground">${value.toLocaleString('en-US', { maximumFractionDigits: 2 })}</p>
      </div>
    </motion.div>
  );
};

export default CryptoCard;