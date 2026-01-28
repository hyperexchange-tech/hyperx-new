import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Globe, Search, RefreshCw, Home, ArrowRight, ArrowLeft as BackIcon, Shield, Bookmark } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

const ExplorerPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const iframeRef = useRef(null);
  
  const [url, setUrl] = useState("");
  const [currentUrl, setCurrentUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [canGoBack, setCanGoBack] = useState(false);
  const [canGoForward, setCanGoForward] = useState(false);
  const [showCustomHomePage, setShowCustomHomePage] = useState(true);

  const popularSites = [
    { name: "Google", url: "https://www.google.com", icon: "🔍" },
    { name: "CoinGecko", url: "https://www.coingecko.com", icon: "🦎" },
    { name: "CoinMarketCap", url: "https://coinmarketcap.com", icon: "📊" },
    { name: "Uniswap", url: "https://app.uniswap.org", icon: "🦄" },
    { name: "DeFiPulse", url: "https://www.defipulse.com", icon: "📈" },
    { name: "Etherscan", url: "https://etherscan.io", icon: "⛓️" },
  ];

  const handleUrlSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) {
      navigateToUrl(url);
    }
  };

  const navigateToUrl = (targetUrl) => {
    let formattedUrl = targetUrl;
    
    // Check if it's a search query or a URL
    if (!formattedUrl.startsWith('http://') && !formattedUrl.startsWith('https://')) {
      // If it doesn't contain a dot, treat it as a search query
      if (!formattedUrl.includes('.')) {
        formattedUrl = `https://duckduckgo.com/?q=${encodeURIComponent(formattedUrl)}`;
      } else {
        // Otherwise, add https:// prefix
        formattedUrl = `https://${formattedUrl}`;
      }
    }
    
    setIsLoading(true);
    setCurrentUrl(formattedUrl);
    setUrl(formattedUrl);
    setShowCustomHomePage(false);
  };

  const handleIframeLoad = () => {
    setIsLoading(false);
    try {
      // Try to access iframe content to update navigation state
      // This will fail for cross-origin content due to security policies
      const iframeDoc = iframeRef.current?.contentDocument;
      if (iframeDoc) {
        setCurrentUrl(iframeDoc.location.href);
        setUrl(iframeDoc.location.href);
      }
    } catch (error) {
      // Expected for cross-origin content
      console.log("Cannot access iframe content due to cross-origin policy");
    }
  };

  const handleIframeError = () => {
    setIsLoading(false);
    toast({
      title: "Page Load Error",
      description: "This website cannot be displayed in the browser. Some sites block embedding for security reasons.",
      variant: "destructive",
    });
  };

  const handleRefresh = () => {
    if (iframeRef.current) {
      setIsLoading(true);
      iframeRef.current.src = currentUrl;
    }
  };

  const handleGoHome = () => {
    setShowCustomHomePage(true);
    setUrl("");
    setCurrentUrl("");
    setIsLoading(false);
  };

  const handleSiteClick = (siteUrl) => {
    navigateToUrl(siteUrl);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen flex flex-col bg-background text-foreground overflow-hidden"
    >
      {/* Navigation Bar */}
      <div className="flex items-center gap-2 p-3 glass-effect border-b border-border/30">
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoBack}
            onClick={() => {
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.history.back();
              }
            }}
          >
            <BackIcon className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            disabled={!canGoForward}
            onClick={() => {
              if (iframeRef.current?.contentWindow) {
                iframeRef.current.contentWindow.history.forward();
              }
            }}
          >
            <ArrowRight className="h-4 w-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleGoHome}
          >
            <Home className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleUrlSubmit} className="flex-1 flex items-center gap-2">
          <div className="relative flex-1">
            <Input
              type="text"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter URL or search..."
              className="h-9 pl-8 pr-4 bg-card/70 border-border/50 rounded-full text-sm"
            />
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>
          <Button type="submit" size="sm" className="h-9 px-3 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground">
            Go
          </Button>
        </form>
      </div>

      {/* Popular Sites */}
      <div className="p-3 bg-card/70 border-b border-border/30 pb-3">
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          <span className="text-xs text-muted-foreground whitespace-nowrap mr-2">Quick Access:</span>
          {popularSites.map((site) => (
            <Button
              key={site.name}
              variant="outline"
              size="sm"
              className="h-8 px-3 rounded-full whitespace-nowrap text-xs hover:bg-primary/10 hover:border-primary/50"
              onClick={() => handleSiteClick(site.url)}
            >
              <span className="mr-1">{site.icon}</span>
              {site.name}
            </Button>
          ))}
        </div>
      </div>

      {/* Browser Content */}
      <div className="flex-1 relative bg-background">
        {/* Custom Home Page */}
        {showCustomHomePage && (
          <div className="w-full h-full flex flex-col items-center justify-center p-8 bg-background">
            <div className="w-full max-w-2xl text-center space-y-8">
              {/* Logo */}
              <div className="space-y-4">
                <div className="flex justify-center">
                  <img 
                    src="/my-new-logo.png" 
                    alt="HyperX Logo" 
                    className="w-24 h-24 object-contain drop-shadow-lg"
                  />
                </div>
                <h1 className="text-4xl font-bold text-foreground">HyperX Search</h1>
                <p className="text-muted-foreground">Browse the web securely from your crypto wallet</p>
              </div>

              {/* Search Bar */}
              <form onSubmit={handleUrlSubmit} className="w-full max-w-xl mx-auto">
                <div className="relative">
                  <Input
                    type="text"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="Search Google or enter a website URL..."
                    className="h-14 pl-6 pr-16 bg-card/80 border-border/50 rounded-full text-base shadow-lg focus:shadow-xl transition-shadow duration-200"
                  />
                  <Button 
                    type="submit" 
                    size="sm" 
                    className="absolute right-2 top-2 h-10 px-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground"
                  >
                    <Search className="h-4 w-4 mr-1" />
                    Search
                  </Button>
                </div>
              </form>

              {/* Quick Access Sites */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-foreground">Quick Access</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {popularSites.map((site) => (
                    <Button
                      key={site.name}
                      variant="outline"
                      className="h-12 justify-start gap-3 bg-card/50 hover:bg-card/80 border-border/50 rounded-xl transition-all duration-200"
                      onClick={() => handleSiteClick(site.url)}
                    >
                      <span className="text-lg">{site.icon}</span>
                      <span className="font-medium">{site.name}</span>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {!showCustomHomePage && isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-10">
            <div className="text-center">
              <RefreshCw className="h-8 w-8 animate-spin text-primary mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Loading...</p>
            </div>
          </div>
        )}
        
        {!showCustomHomePage && <iframe
          ref={iframeRef}
          src={currentUrl}
          className="w-full h-full border-none"
          onLoad={handleIframeLoad}
          onError={handleIframeError}
          sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation allow-modals"
          title="Web Browser"
        />}
      </div>

      {/* Security Notice */}
      <div className="p-2 bg-muted/30 border-t border-border/30">
        <div className="flex items-center justify-center gap-2 text-xs text-muted-foreground">
          <Shield className="h-3 w-3" />
          <span>Browsing in secure mode • Some sites may not load due to security policies</span>
        </div>
      </div>
    </motion.div>
  );
};

export default ExplorerPage;