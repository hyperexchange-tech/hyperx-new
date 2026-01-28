import React from "react";
import { Coins, DollarSign, Zap, CircleDollarSign } from "lucide-react";

export const CryptoIcon = ({ name, color, size = 20 }) => {
  if (!name) {
    return <Coins size={size} color={color} />;
  }

  const normalizedName = name.toLowerCase();

  if (normalizedName.includes('btc') || normalizedName === 'bitcoin') {
    return (
      <img
        src="/Assets/Icon/Crypto%20icons/cryptocurrency-color_btc.svg"
        alt="Bitcoin"
        style={{ width: size, height: size }}
      />
    );
  }

  if (normalizedName.includes('eth') || normalizedName === 'ethereum') {
    return (
      <img
        src="/Assets/Icon/Crypto%20icons/cryptocurrency-color_eth.svg"
        alt="Ethereum"
        style={{ width: size, height: size }}
      />
    );
  }

  if (normalizedName.includes('sol') || normalizedName === 'solana') {
    return <Zap size={size} color={color} />;
  }

  if (normalizedName.includes('usdt') || normalizedName === 'tether') {
    return <CircleDollarSign size={size} color="#26A17B" />;
  }

  if (normalizedName.includes('bnb') || normalizedName === 'binance') {
    return (
      <img
        src="/Assets/Icon/Crypto%20icons/cryptocurrency-color_bnb.svg"
        alt="BNB"
        style={{ width: size, height: size }}
      />
    );
  }

  if (normalizedName.includes('pol') || normalizedName === 'polygon' || normalizedName.includes('matic')) {
    return (
      <img
        src="/Assets/Icon/Crypto%20icons/token-branded_polc.svg"
        alt="Polygon"
        style={{ width: size, height: size }}
      />
    );
  }

  if (normalizedName.includes('usdc')) {
    return <DollarSign size={size} color={color} />;
  }

  if (normalizedName === 'plume') {
    return <Zap size={size} color={color} />;
  }

  if (normalizedName === 'ngn' || normalizedName === 'zar' || normalizedName === 'ghs' || normalizedName === 'kes') {
    return <DollarSign size={size} color={color} />;
  }

  return <Coins size={size} color={color} />;
};