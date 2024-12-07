import React, { createContext, useContext, useState } from 'react';

const VoucherContext = createContext();

export const useVoucher = () => useContext(VoucherContext);

export const VoucherProvider = ({ children }) => {
  const [selectedVoucher, setSelectedVoucher] = useState({ name: '-30% for bill over $50', value: 15 });

  const updateVoucher = (name, value, voucher_id) => {
    setSelectedVoucher({ name, value, voucher_id});
  };

  return (
    <VoucherContext.Provider value={{ selectedVoucher, updateVoucher }}>
      {children}
    </VoucherContext.Provider>
  );
};
