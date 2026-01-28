import React, { useState, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, ArrowUpRight, ArrowDownLeft, TrendingUp, TrendingDown, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CryptoIcon } from "@/components/crypto/CryptoIcon";
import { cn } from "@/lib/utils";

const ChartTimeframes = ["1H", "24H", "1W", "1M", "1Y", "All"];

const AssetChart = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const crypto = location.state?.crypto;

  const [selectedTimeframe, setSelectedTimeframe] = useState("24H");
  const [isFavorite, setIsFavorite] = useState(false);

  if (!crypto) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">No asset selected</p>
          <Button onClick={() => navigate("/")}>Back to Dashboard</Button>
        </div>
      </div>
    );
  }

  const { symbol, name, balance, price, color, id } = crypto;
  const value = balance * price;

  const percentChange = useMemo(() => {
    const changes = { "1H": 1.2, "24H": 3.45, "1W": -2.1, "1M": 12.8, "1Y": 45.2, "All": 234.5 };
    return changes[selectedTimeframe] || 0;
  }, [selectedTimeframe]);

  const isPositive = percentChange >= 0;

  const chartData = useMemo(() => {
    const points = selectedTimeframe === "1H" ? 60 : selectedTimeframe === "24H" ? 96 : 100;
    const basePrice = price;
    const volatility = basePrice * 0.03;

    let data = [];
    let currentPrice = basePrice * (1 - (percentChange / 100) / 2);

    for (let i = 0; i < points; i++) {
      const progress = i / points;
      const trend = (percentChange / 100) * basePrice * progress;
      const noise = (Math.random() - 0.5) * volatility;
      currentPrice = basePrice - trend + noise;
      data.push(currentPrice);
    }

    return data;
  }, [selectedTimeframe, price, percentChange]);

  const maxPrice = Math.max(...chartData);
  const minPrice = Math.min(...chartData);
  const priceRange = maxPrice - minPrice;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          className="rounded-full"
        >
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsFavorite(!isFavorite)}
          className="rounded-full"
        >
          <Star className={cn("h-5 w-5", isFavorite && "fill-yellow-500 text-yellow-500")} />
        </Button>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-4"
      >
        <div className="flex items-center gap-3">
          <div
            className="w-14 h-14 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${color}20` }}
          >
            <CryptoIcon name={id} color={color} size={28} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">{name}</h1>
            <p className="text-muted-foreground">{symbol}</p>
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-2">
            <h2 className="text-4xl font-bold">${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</h2>
            <div className={cn("flex items-center gap-1 text-sm font-medium", isPositive ? "text-green-500" : "text-red-500")}>
              {isPositive ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
              {isPositive ? "+" : ""}{percentChange.toFixed(2)}%
            </div>
          </div>
          <p className="text-muted-foreground mt-1">
            Balance: {balance.toFixed(id === 'bitcoin' ? 8 : 4)} {symbol} (${value.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })})
          </p>
        </div>

        <Card className="crypto-card border-none">
          <CardContent className="p-3">
            <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
              {ChartTimeframes.map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe)}
                  className={cn(
                    "rounded-full text-xs px-4 whitespace-nowrap",
                    selectedTimeframe === timeframe
                      ? "bg-primary text-primary-foreground"
                      : "bg-transparent hover:bg-muted"
                  )}
                >
                  {timeframe}
                </Button>
              ))}
            </div>

            <div className="relative h-80 w-full">
              <svg
                viewBox={`0 0 ${chartData.length} 100`}
                className="w-full h-full"
                preserveAspectRatio="none"
              >
                <defs>
                  <linearGradient id={`gradient-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                  </linearGradient>
                </defs>

                <path
                  d={`M 0,${100 - ((chartData[0] - minPrice) / priceRange) * 100} ${chartData
                    .map((price, i) => `L ${i},${100 - ((price - minPrice) / priceRange) * 100}`)
                    .join(" ")} L ${chartData.length},100 L 0,100 Z`}
                  fill={`url(#gradient-${id})`}
                />

                <path
                  d={`M 0,${100 - ((chartData[0] - minPrice) / priceRange) * 100} ${chartData
                    .map((price, i) => `L ${i},${100 - ((price - minPrice) / priceRange) * 100}`)
                    .join(" ")}`}
                  fill="none"
                  stroke={color}
                  strokeWidth="2"
                  vectorEffect="non-scaling-stroke"
                />
              </svg>
            </div>

            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              <span>${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-4">
          <Button
            onClick={() => navigate("/send", { state: { selectedCrypto: crypto } })}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 rounded-xl font-semibold text-base"
          >
            <ArrowUpRight className="h-5 w-5 mr-2" />
            Send
          </Button>
          <Button
            onClick={() => navigate("/receive", { state: { selectedCrypto: crypto } })}
            variant="outline"
            className="w-full py-6 rounded-xl font-semibold text-base border-2"
          >
            <ArrowDownLeft className="h-5 w-5 mr-2" />
            Receive
          </Button>
        </div>

        <Tabs defaultValue="stats" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-card crypto-card border-none">
            <TabsTrigger value="stats" className="data-[state=active]:bg-muted/70">Stats</TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-muted/70">About</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-3 mt-4">
            <Card className="crypto-card border-none">
              <CardContent className="p-4 space-y-3">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Market Cap</span>
                  <span className="font-semibold">${(price * balance * 1000000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Volume</span>
                  <span className="font-semibold">${(price * balance * 500000).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h High</span>
                  <span className="font-semibold">${maxPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">24h Low</span>
                  <span className="font-semibold">${minPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 4 })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Your Holdings</span>
                  <span className="font-semibold">{balance.toFixed(id === 'bitcoin' ? 8 : 4)} {symbol}</span>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="mt-4">
            <Card className="crypto-card border-none">
              <CardContent className="p-4">
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {name} is a {id === 'bitcoin' ? 'decentralized digital currency' : 'cryptocurrency'} that enables
                  peer-to-peer transactions on a decentralized network.
                  {id === 'bitcoin' && ' Bitcoin is the first and most widely recognized cryptocurrency, often referred to as digital gold.'}
                  {id === 'ethereum' && ' Ethereum is a decentralized platform that runs smart contracts and decentralized applications.'}
                  {id === 'solana' && ' Solana is a high-performance blockchain supporting builders around the world creating crypto apps that scale.'}
                </p>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
};

export default AssetChart;
