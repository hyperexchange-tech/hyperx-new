import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import TransactionList from "@/components/crypto/TransactionList";
import TransactionDetailModal from "@/components/modals/TransactionDetailModal";
import { useWallet } from "@/context/WalletContext";

const HistoryPage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { transactions, loadingTransactions, cryptos } = useWallet();
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  const handleTransactionClick = (transaction) => {
    setSelectedTransaction(transaction);
    setIsDetailModalOpen(true);
  };

  const handleCloseDetailModal = () => {
    setIsDetailModalOpen(false);
    setSelectedTransaction(null);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="h-screen bg-black flex flex-col overflow-hidden p-4 md:p-8"
    >
      <div className="mb-4 flex-shrink-0 pt-4">
        <Button
          variant="ghost"
          className="gap-2 mb-2"
          onClick={() => {
            if (location.state?.fromCrypto) {
              navigate("/", { state: { showCrypto: true, transactionCompleted: true } });
            } else if (location.state?.fromFiat) {
              navigate("/", { state: { showFiat: true, transactionCompleted: true } });
            } else {
              navigate(-1);
            }
          }}
        >
          <ArrowLeft className="h-4 w-4" /> Back
        </Button>
        <h1 className="text-2xl font-bold">Transaction History</h1>
        <p className="text-sm text-muted-foreground">
          View your recent cryptocurrency transactions
        </p>
      </div>

      <div className="flex-1 scrollable-area">
        {loadingTransactions ? (
          <div className="flex items-center justify-center py-8">
            <div className="text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-2"></div>
              <p className="text-sm text-muted-foreground">Loading transactions...</p>
            </div>
          </div>
        ) : (
          <TransactionList
            transactions={transactions}
            cryptos={cryptos}
            onTransactionClick={handleTransactionClick}
          />
        )}
      </div>

      <TransactionDetailModal
        isOpen={isDetailModalOpen}
        onClose={handleCloseDetailModal}
        transaction={selectedTransaction}
        cryptos={cryptos}
      />
    </motion.div>
  );
};

export default HistoryPage;