export interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
}

export const generateReceiptText = (
  orderId: string | number,
  date: string | Date,
  items: ReceiptItem[],
  subtotal: number,
  discount: number,
  total: number,
  cash?: number,
  change?: number
) => {
  const padRight = (str: string, length: number) => {
    return str.length >= length ? str.substring(0, length) : str.padEnd(length, ' ');
  };
  const padLeft = (str: string, length: number) => {
    return str.length >= length ? str.substring(0, length) : str.padStart(length, ' ');
  };

  const trxId = `#TRX-${orderId.toString().padStart(5, '0')}`;
  
  // Format Date to YYYY-MM-DD HH:mm:ss
  const d = new Date(date);
  const padZ = (n: number) => n.toString().padStart(2, '0');
  const dateStr = `${d.getFullYear()}-${padZ(d.getMonth() + 1)}-${padZ(d.getDate())} ${padZ(d.getHours())}:${padZ(d.getMinutes())}:${padZ(d.getSeconds())}`;
  
  let itemsText = '';
  
  items.forEach((item) => {
    const itemName = `${item.name} x${item.quantity}`;
    const itemTotal = item.price * item.quantity;
    
    // Max name length 20 chars
    let nameToPrint = itemName;
    if (nameToPrint.length > 20) {
      nameToPrint = nameToPrint.substring(0, 17) + '...';
    }
    
    const formattedName = padRight(nameToPrint, 20);
    const formattedPrice = `Rp ${padLeft(itemTotal.toLocaleString('id-ID'), 8)}`;
    itemsText += `${formattedName} ${formattedPrice}\n`;
  });

  const header = `================================
        ALFASHOP
Jl. Sudirman No. 45, Jakarta Pusat
    ${trxId}
  ${dateStr}
================================

${itemsText.trimEnd()}

--------------------------------
SUBTOTAL                  Rp ${padLeft(subtotal.toLocaleString('id-ID'), 7)}
DISCOUNT                  Rp ${padLeft(discount.toLocaleString('id-ID'), 7)}
TOTAL                     Rp ${padLeft(total.toLocaleString('id-ID'), 7)}`;

  let paymentText = '';
  if (cash !== undefined && change !== undefined) {
    paymentText = `\nCASH                      Rp ${padLeft(cash.toLocaleString('id-ID'), 7)}
CHANGE                    Rp ${padLeft(change.toLocaleString('id-ID'), 7)}`;
  }

  const footer = `
--------------------------------

      Terima kasih!
  Barang yang sudah dibeli
  tidak dapat ditukar/dikembalikan

    |||| |||||| |||||| ||||
      ${trxId.replace('#', '')}

================================`;

  return "```\n" + header + paymentText + footer + "\n```";
};
