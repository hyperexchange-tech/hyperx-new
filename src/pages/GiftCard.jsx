import React from "react";
import { Gift, ShoppingCart, CreditCard, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

const GiftCard = () => {
  const giftCardCategories = [
    { name: "Gaming", icon: "🎮", color: "from-purple-500 to-pink-500" },
    { name: "Shopping", icon: "🛍️", color: "from-blue-500 to-cyan-500" },
    { name: "Entertainment", icon: "🎬", color: "from-orange-500 to-red-500" },
    { name: "Food & Dining", icon: "🍔", color: "from-green-500 to-emerald-500" },
  ];

  const popularCards = [
    { name: "Amazon", amount: "$25 - $500", discount: "5% off", image: "🛒" },
    { name: "iTunes", amount: "$10 - $200", discount: "3% off", image: "🎵" },
    { name: "Steam", amount: "$20 - $100", discount: "4% off", image: "🎮" },
    { name: "Netflix", amount: "$15 - $100", discount: "2% off", image: "📺" },
    { name: "Spotify", amount: "$10 - $50", discount: "3% off", image: "🎧" },
    { name: "Google Play", amount: "$25 - $200", discount: "4% off", image: "📱" },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Gift Cards</h1>
          <p className="text-muted-foreground">
            Buy gift cards with crypto and get instant discounts
          </p>
        </div>
        <Button variant="outline" className="gap-2">
          <Clock size={18} />
          History
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {giftCardCategories.map((category) => (
          <Card
            key={category.name}
            className={`p-6 cursor-pointer hover:scale-105 transition-transform bg-gradient-to-br ${category.color} text-white border-0`}
          >
            <div className="text-4xl mb-3">{category.icon}</div>
            <h3 className="font-semibold text-lg">{category.name}</h3>
          </Card>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold">Popular Gift Cards</h2>
          <Button variant="ghost" className="text-primary">
            View All
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularCards.map((card) => (
            <Card
              key={card.name}
              className="p-5 cursor-pointer hover:shadow-lg transition-all border border-border/50"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-16 h-16 rounded-xl bg-muted flex items-center justify-center text-3xl">
                  {card.image}
                </div>
                <span className="text-xs font-semibold text-green-600 bg-green-100 dark:bg-green-900/30 dark:text-green-400 px-2 py-1 rounded-full">
                  {card.discount}
                </span>
              </div>
              <h3 className="font-bold text-lg mb-2">{card.name}</h3>
              <p className="text-sm text-muted-foreground mb-4">{card.amount}</p>
              <Button className="w-full gap-2">
                <ShoppingCart size={16} />
                Buy Now
              </Button>
            </Card>
          ))}
        </div>
      </div>

      <Card className="p-6 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
        <div className="flex flex-col md:flex-row items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
            <Gift className="text-primary" size={32} />
          </div>
          <div className="flex-1 text-center md:text-left">
            <h3 className="font-bold text-xl mb-2">Send a Gift Card</h3>
            <p className="text-muted-foreground">
              Send gift cards to friends and family with just their email address
            </p>
          </div>
          <Button size="lg" className="gap-2 shrink-0">
            <CreditCard size={18} />
            Send Gift
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default GiftCard;
