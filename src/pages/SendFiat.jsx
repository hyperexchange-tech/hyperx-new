import React, { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Building2, Users, User, Mail, CheckCircle2, Loader2, XCircle, Search, X, Lightbulb } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { useWallet } from "@/context/WalletContext";
import { walletAPI } from "@/lib/api";
import { suggestBanks, batchCheckBanks } from "@/utils/bankSuggestions";
import bankIconsData from "@/data/bank-icons.json";
import NumericKeyboard from "@/components/NumericKeyboard";

const SendFiat = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  const { fiatBalances } = useWallet();

  const [activeTab, setActiveTab] = useState("bank");
  const [selectedCurrency, setSelectedCurrency] = useState("NGN");
  const [amount, setAmount] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [selectedBank, setSelectedBank] = useState("");
  const [verifiedAccountName, setVerifiedAccountName] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState("");
  const [recipientId, setRecipientId] = useState("");
  const [recipientEmail, setRecipientEmail] = useState("");
  const [hyperxTab, setHyperxTab] = useState("userid");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [bankSearchQuery, setBankSearchQuery] = useState("");
  const [suggestedBanks, setSuggestedBanks] = useState([]);
  const suggestTokenRef = useRef(0);
  const [banks, setBanks] = useState([]);
  const [showAmountKeyboard, setShowAmountKeyboard] = useState(false);
  const [showAccountKeyboard, setShowAccountKeyboard] = useState(false);

  // Convert bank icons data to the format needed
  useEffect(() => {
    setBanks(bankIconsData.map(bank => ({
      code: bank.code,
      name: bank.name,
      logo: bank.logo
    })));
  }, []);

  // Sample banks (you can expand this based on the selected currency)
  const sampleBanks = [
    { code: "40195", name: "78 Finance Company Ltd" },
    { code: "120001", name: "9mobile 9Payment Service Bank" },
    { code: "404", name: "Abbey Mortgage Bank" },
    { code: "51204", name: "Above Only MFB" },
    { code: "51312", name: "Abulesoro MFB" },
    { code: "044", name: "Access Bank" },
    { code: "063", name: "Access Bank (Diamond)" },
    { code: "602", name: "Accion Microfinance Bank" },
    { code: "50315", name: "Aella MFB" },
    { code: "90077", name: "AG Mortgage Bank" },
    { code: "50036", name: "Ahmadu Bello University Microfinance Bank" },
    { code: "120004", name: "Airtel Smartcash PSB" },
    { code: "51336", name: "AKU Microfinance Bank" },
    { code: "090561", name: "Akuchukwu Microfinance Bank Limited" },
    { code: "50055", name: "Al-Barakah Microfinance Bank" },
    { code: "035A", name: "ALAT by WEMA" },
    { code: "108", name: "Alpha Morgan Bank" },
    { code: "000304", name: "Alternative bank" },
    { code: "090629", name: "Amegy Microfinance Bank" },
    { code: "50926", name: "Amju Unique MFB" },
    { code: "50083", name: "Aramoko MFB" },
    { code: "401", name: "ASO Savings and Loans" },
    { code: "50092", name: "Assets Microfinance Bank" },
    { code: "MFB50094", name: "Astrapolaris MFB LTD" },
    { code: "090478", name: "AVUENEGBE MICROFINANCE BANK" },
    { code: "51351", name: "AWACASH MICROFINANCE BANK" },
    { code: "51337", name: "AZTEC MICROFINANCE BANK LIMITED" },
    { code: "51229", name: "Bainescredit MFB" },
    { code: "50117", name: "Banc Corp Microfinance Bank" },
    { code: "11072", name: "Bank78 Microfinance Bank" },
    { code: "50572", name: "BANKIT MICROFINANCE BANK LTD" },
    { code: "51341", name: "BANKLY MFB" },
    { code: "MFB50992", name: "Baobab Microfinance Bank" },
    { code: "51100", name: "BellBank Microfinance Bank" },
    { code: "51267", name: "Benysta Microfinance Bank Limited" },
    { code: "50122", name: "Berachah Microfinance Bank Ltd." },
    { code: "50123", name: "Beststar Microfinance Bank" },
    { code: "50725", name: "BOLD MFB" },
    { code: "650", name: "Bosak Microfinance Bank" },
    { code: "50931", name: "Bowen Microfinance Bank" },
    { code: "FC40163", name: "Branch International Finance Company Limited" },
    { code: "90070", name: "Brent Mortgage bank" },
    { code: "50645", name: "BuyPower MFB" },
    { code: "565", name: "Carbon" },
    { code: "51353", name: "Cashbridge Microfinance Bank Limited" },
    { code: "865", name: "CASHCONNECT MFB" },
    { code: "50823", name: "CEMCS Microfinance Bank" },
    { code: "50171", name: "Chanelle Microfinance Bank Limited" },
    { code: "312", name: "Chikum Microfinance bank" },
    { code: "023", name: "Citibank Nigeria" },
    { code: "070027", name: "CITYCODE MORTAGE BANK" },
    { code: "50910", name: "Consumer Microfinance Bank" },
    { code: "51458", name: "Cool Microfinance Bank Limited" },
    { code: "50204", name: "Corestep MFB" },
    { code: "559", name: "Coronation Merchant Bank" },
    { code: "FC40128", name: "County Finance Limited" },
    { code: "40119", name: "Credit Direct Limited" },
    { code: "51297", name: "Crescent MFB" },
    { code: "090560", name: "Crust Microfinance Bank" },
    { code: "50216", name: "CRUTECH MICROFINANCE BANK LTD" },
    { code: "51368", name: "Dash Microfinance Bank" },
    { code: "51334", name: "Davenport MICROFINANCE BANK" },
    { code: "51450", name: "Dillon Microfinance Bank" },
    { code: "50162", name: "Dot Microfinance Bank" },
    { code: "50922", name: "EBSU Microfinance Bank" },
    { code: "050", name: "Ecobank Nigeria" },
    { code: "50263", name: "Ekimogun MFB" },
    { code: "098", name: "Ekondo Microfinance Bank" },
    { code: "090678", name: "EXCEL FINANCE BANK" },
    { code: "50126", name: "Eyowo" },
    { code: "51318", name: "Fairmoney Microfinance Bank" },
    { code: "50298", name: "Fedeth MFB" },
    { code: "070", name: "Fidelity Bank" },
    { code: "51314", name: "Firmus MFB" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "090164", name: "FIRST ROYAL MICROFINANCE BANK" },
    { code: "51333", name: "FIRSTMIDAS MFB" },
    { code: "413", name: "FirstTrust Mortgage Bank Nigeria" },
    { code: "D53", name: "Fortress MFB" },
    { code: "501", name: "FSDH Merchant Bank Limited" },
    { code: "832", name: "FUTMINNA MICROFINANCE BANK" },
    { code: "MFB51093", name: "Garun Mallam MFB" },
    { code: "812", name: "Gateway Mortgage Bank LTD" },
    { code: "00103", name: "Globus Bank" },
    { code: "090574", name: "Goldman MFB" },
    { code: "100022", name: "GoMoney" },
    { code: "090664", name: "GOOD SHEPHERD MICROFINANCE BANK" },
    { code: "50739", name: "Goodnews Microfinance Bank" },
    { code: "562", name: "Greenwich Merchant Bank" },
    { code: "51276", name: "GROOMING MICROFINANCE BANK" },
    { code: "50368", name: "GTI MFB" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "51251", name: "Hackman Microfinance Bank" },
    { code: "50383", name: "Hasal Microfinance Bank" },
    { code: "51364", name: "Hayat Trust MFB" },
    { code: "120002", name: "HopePSB" },
    { code: "51211", name: "IBANK Microfinance Bank" },
    { code: "51279", name: "IBBU MFB" },
    { code: "51244", name: "Ibile Microfinance Bank" },
    { code: "90012", name: "Ibom Mortgage Bank" },
    { code: "50439", name: "Ikoyi Osun MFB" },
    { code: "50442", name: "Ilaro Poly Microfinance Bank" },
    { code: "50453", name: "Imowo MFB" },
    { code: "415", name: "IMPERIAL HOMES MORTAGE BANK" },
    { code: "51392", name: "INDULGE MFB" },
    { code: "50457", name: "Infinity MFB" },
    { code: "070016", name: "Infinity trust Mortgage Bank" },
    { code: "090701", name: "ISUA MFB" },
    { code: "301", name: "Jaiz Bank" },
    { code: "50502", name: "Kadpoly MFB" },
    { code: "51308", name: "KANOPOLY MFB" },
    { code: "5129", name: "Kayvee Microfinance Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "899", name: "Kolomoni MFB" },
    { code: "100025", name: "KONGAPAY (Kongapay Technologies Limited)(formerly Zinternet)" },
    { code: "50200", name: "Kredi Money MFB LTD" },
    { code: "50211", name: "Kuda Bank" },
    { code: "90052", name: "Lagos Building Investment Company Plc." },
    { code: "090420", name: "Letshego Microfinance Bank" },
    { code: "50549", name: "Links MFB" },
    { code: "031", name: "Living Trust Mortgage Bank" },
    { code: "50491", name: "LOMA MFB" },
    { code: "303", name: "Lotus Bank" },
    { code: "51444", name: "Maal MFB" },
    { code: "090171", name: "MAINSTREET MICROFINANCE BANK" },
    { code: "50563", name: "Mayfair MFB" },
    { code: "50570", name: "Mega Microfinance Bank" },
    { code: "50304", name: "Mint MFB" },
    { code: "09", name: "MINT-FINEX MFB" },
    { code: "946", name: "Money Master PSB" },
    { code: "50515", name: "Moniepoint MFB" },
    { code: "120003", name: "MTN Momo PSB" },
    { code: "090190", name: "MUTUAL BENEFITS MICROFINANCE BANK" },
    { code: "090679", name: "NDCC MICROFINANCE BANK" },
    { code: "51361", name: "NET MICROFINANCE BANK" },
    { code: "51142", name: "Nigerian Navy Microfinance Bank Limited" },
    { code: "51304", name: "NIRSAL MICROFINANCE" },
    { code: "50072", name: "Nombank MFB" },
    { code: "561", name: "NOVA BANK" },
    { code: "51371", name: "Novus MFB" },
    { code: "50629", name: "NPF MICROFINANCE BANK" },
    { code: "51261", name: "NSUK MICROFINANACE BANK" },
    { code: "50689", name: "Olabisi Onabanjo University Microfinance Bank" },
    { code: "50697", name: "OLUCHUKWU MICROFINANCE BANK LTD" },
    { code: "999992", name: "OPay Digital Services Limited (OPay)" },
    { code: "107", name: "Optimus Bank Limited" },
    { code: "100002", name: "Paga" },
    { code: "999991", name: "PalmPay" },
    { code: "104", name: "Parallex Bank" },
    { code: "311", name: "Parkway - ReadyCash" },
    { code: "090680", name: "PATHFINDER MICROFINANCE BANK LIMITED" },
    { code: "51457", name: "Paystack MFB" },
    { code: "100039", name: "Paystack-Titan" },
    { code: "50743", name: "Peace Microfinance Bank" },
    { code: "51226", name: "PECANTRUST MICROFINANCE BANK LIMITED" },
    { code: "51146", name: "Personal Trust MFB" },
    { code: "50746", name: "Petra Mircofinance Bank Plc" },
    { code: "MFB51452", name: "Pettysave MFB" },
    { code: "050021", name: "PFI FINANCE COMPANY LIMITED" },
    { code: "268", name: "Platinum Mortgage Bank" },
    { code: "00716", name: "Pocket App" },
    { code: "076", name: "Polaris Bank" },
    { code: "50864", name: "Polyunwana MFB" },
    { code: "105", name: "PremiumTrust Bank" },
    { code: "50739", name: "Prospa Capital Microfinance Bank" },
    { code: "050023", name: "PROSPERIS FINANCE LIMITED" },
    { code: "101", name: "Providus Bank" },
    { code: "51293", name: "QuickFund MFB" },
    { code: "502", name: "Rand Merchant Bank" },
    { code: "090496", name: "RANDALPHA MICROFINANCE BANK" },
    { code: "90067", name: "Refuge Mortgage Bank" },
    { code: "50761", name: "REHOBOTH MICROFINANCE BANK" },
    { code: "50994", name: "Rephidim Microfinance Bank" },
    { code: "51375", name: "Retrust Mfb" },
    { code: "51286", name: "Rigo Microfinance Bank Limited" },
    { code: "50767", name: "ROCKSHIELD MICROFINANCE BANK" },
    { code: "125", name: "Rubies MFB" },
    { code: "51113", name: "Safe Haven MFB" },
    { code: "40165", name: "SAGE GREY FINANCE LIMITED" },
    { code: "50582", name: "Shield MFB" },
    { code: "106", name: "Signature Bank Ltd" },
    { code: "51062", name: "Solid Allianze MFB" },
    { code: "50800", name: "Solid Rock MFB" },
    { code: "51310", name: "Sparkle Microfinance Bank" },
    { code: "51429", name: "Springfield Microfinance Bank" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "068", name: "Standard Chartered Bank" },
    { code: "090162", name: "STANFORD MICROFINANCE BANK" },
    { code: "50809", name: "STATESIDE MICROFINANCE BANK" },
    { code: "070022", name: "STB Mortgage Bank" },
    { code: "51253", name: "Stellas MFB" },
    { code: "232", name: "Sterling Bank" },
    { code: "00305", name: "Summit Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "50968", name: "Supreme MFB" },
    { code: "51056", name: "Sycamore Microfinance Bank" },
    { code: "302", name: "TAJ Bank" },
    { code: "51269", name: "Tangerine Money" },
    { code: "51403", name: "TENN" },
    { code: "677", name: "Think Finance Microfinance Bank" },
    { code: "102", name: "Titan Bank" },
    { code: "090708", name: "TransPay MFB" },
    { code: "51118", name: "TRUSTBANC J6 MICROFINANCE BANK" },
    { code: "50840", name: "U&C Microfinance Bank Ltd (U AND C MFB)" },
    { code: "090706", name: "UCEE MFB" },
    { code: "51322", name: "Uhuru MFB" },
    { code: "51080", name: "Ultraviolet Microfinance Bank" },
    { code: "50870", name: "Unaab Microfinance Bank Limited" },
    { code: "51447", name: "UNIABUJA MFB" },
    { code: "50871", name: "Unical MFB" },
    { code: "51316", name: "Unilag Microfinance Bank" },
    { code: "50875", name: "UNIMAID MICROFINANCE BANK" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "033", name: "United Bank For Africa" },
    { code: "215", name: "Unity Bank" },
    { code: "50880", name: "UNIUYO Microfinance Bank Ltd" },
    { code: "50894", name: "Uzondu Microfinance Bank Awka Anambra State" },
    { code: "050020", name: "Vale Finance Limited" },
    { code: "566", name: "VFD Microfinance Bank Limited" },
    { code: "51355", name: "Waya Microfinance Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "51386", name: "Weston Charis MFB" },
    { code: "100040", name: "Xpress Wallet" },
    { code: "594", name: "Yes MFB" },
    { code: "00zap", name: "Zap" },
    { code: "057", name: "Zenith Bank" },
    { code: "51373", name: "Zitra MFB" }
  ];

  useEffect(() => {
    const verifyAccount = async () => {
      if (accountNumber.length === 10 && selectedBank) {
        setIsVerifying(true);
        setVerificationError("");
        setVerifiedAccountName("");

        try {
          const data = await walletAPI.resolvePayoutBank(accountNumber, selectedBank);

          const accountName =
            data?.accountName || data?.account_name || data?.name || data?.data?.accountName || data?.data?.account_name;

          if (accountName) {
            setVerifiedAccountName(accountName);
          } else {
            setVerificationError(data?.message || "Could not verify account");
          }
        } catch (error) {
          setVerificationError(error?.message || "Failed to verify account. Please try again.");
        } finally {
          setIsVerifying(false);
        }
      } else {
        setVerifiedAccountName("");
        setVerificationError("");
      }
    };

    verifyAccount();
  }, [accountNumber, selectedBank]);

  // New effect: show suggestions immediately, then verify in background
  useEffect(() => {
    if (accountNumber.length !== 10) {
      // clear suggestions when not a full account number
      setSuggestedBanks([]);
      return;
    }

    const token = ++suggestTokenRef.current;
    let mounted = true;

    // Show initial suggestions immediately
    const initialSuggestions = suggestBanks(accountNumber) || [];
    if (mounted && suggestTokenRef.current === token) {
      setSuggestedBanks(initialSuggestions);
    }

    // Then verify them in background
    (async () => {
      const bankCodes = initialSuggestions.map((b) => b.code);
      const verified = await batchCheckBanks(accountNumber, bankCodes, walletAPI.resolvePayoutBank);

      if (mounted && suggestTokenRef.current === token) {
        // Update with verified banks or keep initial if any verified
        setSuggestedBanks(verified.length > 0 ? verified : []);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [accountNumber]);

  const handleAmountChange = (e) => {
    const value = e.target.value.replace(/[^0-9.]/g, "");
    setAmount(value);
  };

  const handleMaxAmount = () => {
    const currency = fiatBalances.find((c) => c.code === selectedCurrency);
    if (currency) {
      setAmount(currency.balance.toString());
    }
  };

  const handleBankSubmit = (e) => {
    e.preventDefault();

    if (!verifiedAccountName || !accountNumber || !selectedBank) {
      toast({
        title: "Missing Information",
        description: "Please verify the account details first.",
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
    if (parseFloat(amount) > selectedCurrencyData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCurrencyData.code}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate bank transfer
    setTimeout(() => {
      toast({
        title: "Transfer Initiated",
        description: `Bank transfer of ${selectedCurrencyData.symbol}${amount} to ${verifiedAccountName} has been initiated.`,
      });

      setIsSubmitting(false);
      setAmount("");
      setVerifiedAccountName("");
      setAccountNumber("");
      setSelectedBank("");

      setTimeout(() => {
        navigate("/", { state: { showFiat: true, transactionCompleted: true } });
      }, 1500);
    }, 2000);
  };

  const handleHyperXSubmit = (e) => {
    e.preventDefault();

    const recipient = hyperxTab === "userid" ? recipientId : recipientEmail;

    if (!recipient) {
      toast({
        title: "Missing Recipient",
        description: `Please enter a ${hyperxTab === "userid" ? "User ID" : "email address"}.`,
        variant: "destructive",
      });
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount.",
        variant: "destructive",
      });
      return;
    }

    const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
    if (parseFloat(amount) > selectedCurrencyData.balance) {
      toast({
        title: "Insufficient Balance",
        description: `You don't have enough ${selectedCurrencyData.code}.`,
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    // Simulate internal transfer
    setTimeout(() => {
      toast({
        title: "Transfer Successful",
        description: `Sent ${selectedCurrencyData.symbol}${amount} to ${recipient}`,
      });

      setIsSubmitting(false);
      setAmount("");
      setRecipientId("");
      setRecipientEmail("");

      setTimeout(() => {
        navigate("/", { state: { showFiat: true, transactionCompleted: true } });
      }, 1500);
    }, 1000);
  };

  const selectedCurrencyData = fiatBalances.find((c) => c.code === selectedCurrency);
  const maxAmount = selectedCurrencyData ? selectedCurrencyData.balance : 0;

  const filteredBanks = banks.filter(
    (bank) =>
      bank.name.toLowerCase().includes(bankSearchQuery.toLowerCase()) ||
      bank.code.toLowerCase().includes(bankSearchQuery.toLowerCase())
  );

  const handleSelectBank = (bankCode) => {
    setSelectedBank(bankCode);
    setShowBankModal(false);
    setBankSearchQuery("");
  };

  const handleSelectBankFromSuggestion = (bankCode) => {
    setSelectedBank(bankCode);
  };

  const getBankLogo = (bankCode) => {
    const bank = banks.find(b => b.code === bankCode);
    return bank?.logo || null;
  };

  const getSelectedBankName = () => {
    return banks.find((b) => b.code === selectedBank)?.name || "Select bank";
  };

  const getBankIconClass = (bankCode) => {
    return `nbi nbi-${bankCode}`;
  };

  return (
    <div className="min-h-screen bg-black flex flex-col hide-scrollbar pb-24">
      {/* Header */}
      <div className="px-5 pt-3 pb-3">
        <button
          onClick={() => navigate("/", { state: { showFiat: true } })}
          className="text-white/80 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={22} />
        </button>
        <div className="text-center">
          <h1 className="text-xl font-semibold text-white mb-0.5">Send Fiat</h1>
          <p className="text-xs text-white/60">Transfer to banks or HyperX users</p>
        </div>
      </div>

      {/* Content */}
      <div className="px-5">
        <div className="space-y-4 pb-4">
          {/* Tabs */}
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-white/[0.06]">
              <TabsTrigger value="bank" className="text-sm text-white">To Bank</TabsTrigger>
              <TabsTrigger value="hyperx" className="text-sm text-white">To HyperX</TabsTrigger>
            </TabsList>

            <TabsContent value="bank" className="space-y-4 mt-4">
              {/* Currency Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h2 className="text-xs font-normal text-white/70">Select Currency</h2>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                    <SelectValue placeholder="Choose currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {fiatBalances.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                            {currency.flag}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-base">{currency.code}</p>
                            <p className="text-sm text-white/60">{currency.name}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Amount Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-normal text-white/70">Amount</h2>
                  {selectedCurrencyData && (
                    <p className="text-xs text-white/70">
                      Balance: {selectedCurrencyData.symbol}{maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-center mb-4">
                    <input
                      type="text"
                      onFocus={() => setShowAmountKeyboard(true)}
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full text-center text-4xl font-light bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20"
                      readOnly
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.25).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.5).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.75).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Recipient Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-2"
              >
                <h2 className="text-xs font-normal text-white/70">Recipient Details</h2>
                <div className="space-y-3">
                  <input
                    onFocus={() => setShowAccountKeyboard(true)}
                    value={accountNumber}
                    onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, "").slice(0, 10))}
                    placeholder="Account number"
                    maxLength={10}
                    className="w-full h-12 px-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                    readOnly
                  />

                  {/* Bank Suggestions */}
                  <AnimatePresence>
                    {accountNumber.length === 10 && suggestedBanks.length > 0 && !selectedBank && (
                      <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="space-y-2"
                      >
                        <div className="flex items-center gap-2 px-2">
                          <Lightbulb className="h-4 w-4 text-amber-400" />
                          <p className="text-xs text-white/60">Suggested banks</p>
                        </div>
                        <div className={`grid gap-2 ${
                          suggestedBanks.length === 4 ? 'grid-cols-4' :
                          suggestedBanks.length === 3 ? 'grid-cols-3' : 
                          'grid-cols-2'
                        }`}>
                          {suggestedBanks.map((bank) => (
                            <motion.button
                              key={bank.code}
                              type="button"
                              onClick={() => handleSelectBankFromSuggestion(bank.code)}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className="p-3 rounded-xl border border-white/10 bg-white/[0.06] hover:bg-white/[0.08] transition-all"
                            >
                              <img 
                                src={getBankLogo(bank.code)} 
                                alt={bank.name}
                                className="h-8 w-8 rounded object-cover mx-auto mb-2"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                }}
                              />
                              <p className="text-xs font-medium text-white text-center truncate">{bank.name}</p>
                            </motion.button>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Custom Bank Selection Button */}
                  <button
                    type="button"
                    onClick={() => setShowBankModal(true)}
                    className="w-full h-12 px-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors flex items-center justify-between group"
                  >
                    <div className="flex items-center gap-3">
                      {selectedBank ? (
                        <img 
                          src={getBankLogo(selectedBank)} 
                          alt={getSelectedBankName()}
                          className="h-8 w-8 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <Building2 className="h-5 w-5 text-white/60 group-hover:text-white/80 transition-colors" />
                      )}
                      <span className={selectedBank ? "text-white" : "text-white/40"}>
                        {selectedBank ? getSelectedBankName() : "Select bank"}
                      </span>
                    </div>
                  </button>

                  {/* Verification Status */}
                  {accountNumber.length === 10 && selectedBank && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3"
                    >
                      {isVerifying && (
                        <div className="flex items-center gap-2 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl">
                          <Loader2 className="h-4 w-4 text-blue-400 animate-spin" />
                          <span className="text-sm text-blue-400">Verifying account...</span>
                        </div>
                      )}

                      {!isVerifying && verifiedAccountName && (
                        <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-xl">
                          <CheckCircle2 className="h-4 w-4 text-green-400" />
                          <div className="flex-1">
                            <p className="text-xs text-green-400 mb-0.5">Account Verified</p>
                            <p className="text-sm font-semibold text-white">{verifiedAccountName}</p>
                          </div>
                        </div>
                      )}

                      {!isVerifying && verificationError && (
                        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl">
                          <XCircle className="h-4 w-4 text-red-400" />
                          <span className="text-sm text-red-400">{verificationError}</span>
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              </motion.div>

              {/* Transaction Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-2 pt-1"
              >
                <h3 className="text-sm font-semibold text-white">Transaction Details</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70">Transfer Fee</span>
                    <span className="text-xs font-medium text-orange-500">
                      {selectedCurrencyData?.symbol}50
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70">Processing Time</span>
                    <span className="text-xs text-white/70">Instant</span>
                  </div>
                </div>
              </motion.div>

              {/* Total Amount */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="border-t border-white/10 pt-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-white/90">Total Amount</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedCurrencyData?.symbol}{amount ? (parseFloat(amount) + 50).toLocaleString() : "50"}
                  </span>
                </div>
              </motion.div>
            </TabsContent>

            <TabsContent value="hyperx" className="space-y-4 mt-4">
              {/* HyperX Transfer Content */}
              {/* Currency Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="space-y-2"
              >
                <h2 className="text-xs font-normal text-white/70">Select Currency</h2>
                <Select value={selectedCurrency} onValueChange={setSelectedCurrency}>
                  <SelectTrigger className="h-14 bg-white/[0.06] border-white/10 rounded-2xl text-white hover:bg-white/[0.08] transition-colors">
                    <SelectValue placeholder="Choose currency" />
                  </SelectTrigger>
                  <SelectContent className="bg-[#1a1a1a] border-white/10">
                    {fiatBalances.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code} className="text-white hover:bg-white/10 focus:bg-white/10">
                        <div className="flex items-center gap-3 py-1">
                          <div className="w-10 h-10 rounded-lg bg-white/10 flex items-center justify-center text-2xl">
                            {currency.flag}
                          </div>
                          <div>
                            <p className="font-semibold text-white text-base">{currency.code}</p>
                            <p className="text-sm text-white/60">{currency.name}</p>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </motion.div>

              {/* Amount Input */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.1 }}
                className="space-y-2"
              >
                <div className="flex items-center justify-between">
                  <h2 className="text-xs font-normal text-white/70">Amount</h2>
                  {selectedCurrencyData && (
                    <p className="text-xs text-white/70">
                      Balance: {selectedCurrencyData.symbol}{maxAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                  )}
                </div>

                <div className="pt-2">
                  <div className="text-center mb-4">
                    <input
                      type="text"
                      value={amount}
                      onChange={handleAmountChange}
                      placeholder="0.00"
                      className="w-full text-center text-4xl font-light bg-transparent border-none outline-none focus:ring-0 text-white placeholder:text-white/20"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.25).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      25%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.5).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      50%
                    </button>
                    <button
                      type="button"
                      onClick={() => setAmount((maxAmount * 0.75).toString())}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      75%
                    </button>
                    <button
                      type="button"
                      onClick={handleMaxAmount}
                      className="flex-1 py-2 rounded-full border border-white/20 bg-transparent text-white hover:bg-white/5 transition-colors text-xs font-medium"
                    >
                      MAX
                    </button>
                  </div>
                </div>
              </motion.div>

              {/* Recipient Selection */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.2 }}
                className="space-y-2"
              >
                <h2 className="text-xs font-normal text-white/70">Send To</h2>
                <div className="space-y-3">
                  <Tabs value={hyperxTab} onValueChange={setHyperxTab} className="w-full">
                    <TabsList className="grid w-full grid-cols-2 bg-white/[0.06]">
                      <TabsTrigger value="userid" className="text-sm text-white">User ID</TabsTrigger>
                      <TabsTrigger value="email" className="text-sm text-white">Email</TabsTrigger>
                    </TabsList>

                    <TabsContent value="userid" className="mt-4">
                      <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          value={recipientId}
                          onChange={(e) => setRecipientId(e.target.value)}
                          placeholder="Enter User ID (e.g., @john_doe)"
                          className="w-full h-12 pl-12 pr-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-2 text-center">
                        Enter the recipient's HyperX User ID
                      </p>
                    </TabsContent>

                    <TabsContent value="email" className="mt-4">
                      <div className="relative">
                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                        <input
                          type="email"
                          value={recipientEmail}
                          onChange={(e) => setRecipientEmail(e.target.value)}
                          placeholder="Enter email address"
                          className="w-full h-12 pl-12 pr-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20"
                        />
                      </div>
                      <p className="text-xs text-white/60 mt-2 text-center">
                        Enter the recipient's registered email address
                      </p>
                    </TabsContent>
                  </Tabs>
                </div>
              </motion.div>

              {/* Transaction Details */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.3 }}
                className="space-y-2 pt-1"
              >
                <h3 className="text-sm font-semibold text-white">Transaction Details</h3>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70">Transfer Fee</span>
                    <span className="text-xs font-medium text-green-500">FREE</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-white/70">Processing Time</span>
                    <span className="text-xs text-[hsl(180,60%,60%)]">Instant</span>
                  </div>
                </div>
              </motion.div>

              {/* You will send */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.4 }}
                className="border-t border-white/10 pt-3"
              >
                <div className="flex justify-between items-center">
                  <span className="text-sm font-normal text-white/90">You will send</span>
                  <span className="text-sm font-semibold text-white">
                    {selectedCurrencyData?.symbol}{amount || "0"}
                  </span>
                </div>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Bank Selection Modal */}
      <AnimatePresence>
        {showAmountKeyboard && (
          <NumericKeyboard
            value={amount}
            onChange={setAmount}
            onClose={() => setShowAmountKeyboard(false)}
            allowDecimal={true}
            maxLength={10}
          />
        )}

        {showAccountKeyboard && (
          <NumericKeyboard
            value={accountNumber}
            onChange={setAccountNumber}
            onClose={() => setShowAccountKeyboard(false)}
            allowDecimal={false}
            maxLength={10}
          />
        )}

         {showBankModal && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowBankModal(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            />

            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-0 left-0 right-0 z-50 rounded-t-3xl bg-[#0a0a0a] border-t border-white/10 max-h-[90vh] overflow-hidden flex flex-col"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Select Bank</h2>
                <button
                  onClick={() => setShowBankModal(false)}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X size={20} className="text-white/60" />
                </button>
              </div>

              {/* Search Bar */}
              <div className="px-5 py-3 border-b border-white/10">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white/60" />
                  <input
                    type="text"
                    placeholder="Search by bank name or code..."
                    value={bankSearchQuery}
                    onChange={(e) => setBankSearchQuery(e.target.value)}
                    className="w-full h-12 pl-12 pr-4 bg-white/[0.06] border border-white/10 rounded-2xl text-white placeholder:text-white/40 focus:outline-none focus:ring-1 focus:ring-white/20 transition-all"
                  />
                  {bankSearchQuery && (
                    <button
                      onClick={() => setBankSearchQuery("")}
                      className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <X size={18} className="text-white/60" />
                    </button>
                  )}
                </div>
              </div>

              {/* Bank List */}
              <div className="overflow-y-auto flex-1 hide-scrollbar">
                {filteredBanks.length > 0 ? (
                  <div className="space-y-1 p-4">
                    {filteredBanks.map((bank) => (
                      <motion.button
                        key={bank.code}
                        type="button"
                        onClick={() => handleSelectBank(bank.code)}
                        whileHover={{ x: 4 }}
                        whileTap={{ scale: 0.98 }}
                        className={`w-full flex items-center gap-3 p-4 rounded-2xl transition-all ${
                          selectedBank === bank.code
                            ? "bg-[hsl(180,60%,45%)]/20 border border-[hsl(180,60%,45%)]/40"
                            : "bg-white/[0.06] border border-white/10 hover:bg-white/[0.08] hover:border-white/20"
                        }`}
                      >
                        <img 
                          src={bank.logo} 
                          alt={bank.name}
                          className="h-10 w-10 rounded object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                        <div className="flex-1 text-left">
                          <p className="text-sm font-medium text-white">{bank.name}</p>
                          <p className="text-xs text-white/60">{bank.code}</p>
                        </div>
                        {selectedBank === bank.code && (
                          <CheckCircle2 className="h-5 w-5 text-[hsl(180,60%,45%)] flex-shrink-0" />
                        )}
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center justify-center py-12 px-4">
                    <p className="text-center text-white/60">
                      No banks found for "{bankSearchQuery}"
                    </p>
                  </div>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Bottom Action Buttons */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-3 pb-5 bg-black border-t border-white/10">
        <div className="flex gap-2.5">
          <button
            onClick={() => navigate("/", { state: { showFiat: true } })}
            className="px-6 py-3 rounded-2xl border border-white/20 bg-white/[0.06] hover:bg-white/10 text-white transition-colors font-medium text-sm"
          >
            Cancel
          </button>
          {activeTab === "bank" ? (
            <button
              onClick={handleBankSubmit}
              disabled={!selectedCurrency || !amount || !verifiedAccountName || !accountNumber || !selectedBank || isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Building2 size={18} />
                  Send to Bank
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleHyperXSubmit}
              disabled={!selectedCurrency || !amount || (!recipientId && !recipientEmail) || isSubmitting}
              className="flex-1 py-3 rounded-2xl bg-[hsl(180,60%,45%)] hover:bg-[hsl(180,60%,40%)] disabled:bg-[hsl(180,60%,25%)] disabled:text-white/50 text-white font-medium text-sm transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="h-5 w-5 border-2 border-transparent border-t-white rounded-full"
                  />
                  Processing...
                </>
              ) : (
                <>
                  <Users size={18} />
                  Send to HyperX
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SendFiat;