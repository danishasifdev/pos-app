import { Receipt, StoreSettings } from "@/lib/types";

export function ReceiptPrintable({
  receipt,
  settings,
}: {
  receipt: Receipt;
  settings: Pick<StoreSettings, "storeName" | "address" | "phone" | "currencySymbol" | "receiptFooter">;
}) {
  const c = settings.currencySymbol;
  const date = new Date(receipt.createdAt);

  return (
    <div
      id="printable-receipt"
      className="mx-auto w-[80mm] bg-white p-3 font-mono text-[11px] leading-tight text-black"
    >
      <div className="text-center">
        <p className="text-sm font-bold">{settings.storeName}</p>
        <p>{settings.address}</p>
        <p>{settings.phone}</p>
      </div>
      <Divider />
      <div className="flex justify-between">
        <span>Receipt #{receipt.number}</span>
        <span>{date.toLocaleDateString()}</span>
      </div>
      <div className="flex justify-between">
        <span>{receipt.cashier}</span>
        <span>{date.toLocaleTimeString()}</span>
      </div>
      <Divider />
      {receipt.items.map((item, i) => (
        <div key={i} className="mb-1">
          <div className="flex justify-between">
            <span className="truncate pr-2">{item.name}</span>
            <span>
              {c}
              {(item.price * item.quantity).toFixed(2)}
            </span>
          </div>
          <div className="text-[10px] text-gray-600">
            {item.quantity} x {c}
            {item.price.toFixed(2)}
          </div>
        </div>
      ))}
      <Divider />
      <Row label="Subtotal" value={`${c}${receipt.subtotal.toFixed(2)}`} />
      <Row label={`Tax (${receipt.taxRate}%)`} value={`${c}${receipt.taxTotal.toFixed(2)}`} />
      {receipt.discount > 0 && (
        <Row label="Discount" value={`-${c}${receipt.discount.toFixed(2)}`} />
      )}
      <div className="my-1 flex justify-between border-t border-dashed border-black pt-1 text-sm font-bold">
        <span>TOTAL</span>
        <span>
          {c}
          {receipt.total.toFixed(2)}
        </span>
      </div>
      <Row label="Paid via" value={receipt.paymentMethod.toUpperCase()} />
      {receipt.paymentMethod === "cash" && (
        <>
          <Row label="Tendered" value={`${c}${receipt.amountTendered.toFixed(2)}`} />
          <Row label="Change" value={`${c}${receipt.changeDue.toFixed(2)}`} />
        </>
      )}
      <Divider />
      <p className="text-center">{settings.receiptFooter}</p>
      {receipt.voided && (
        <p className="mt-2 text-center text-sm font-bold">*** VOIDED ***</p>
      )}
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}

function Divider() {
  return <div className="my-1 border-t border-dashed border-black" />;
}
