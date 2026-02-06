"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, MapPin, Plus, Loader2, ShoppingBag, Truck, Check, AlertCircle, QrCode } from "lucide-react";
import { getAddresses, saveAddress } from "@/app/actions/address-actions";
import { Address } from "@/lib/types";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { confirmOrderAction } from "../actions/order-actions";
import { BackButton } from "@/components/common/BackButton";
import { checkServiceabilityAction } from "@/app/actions/pincode-actions";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
} from "@/components/ui/sheet";

export default function CheckoutPage() {
    const { cartTotal, clearCart, serviceablePincode, serviceableCity, serviceableState } = useStore();
    const router = useRouter();
    const [isSuccess, setIsSuccess] = useState(false);
    const [loading, setLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);

    // Address states
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
    const [saveForLater, setSaveForLater] = useState(true);
    const [paymentMethod, setPaymentMethod] = useState<"upi" | "cod">("upi");

    // Pincode serviceability state
    const [pincodeStatus, setPincodeStatus] = useState<"unchecked" | "checking" | "serviceable" | "unserviceable">("unchecked");
    const [pincodeMessage, setPincodeMessage] = useState("");
    const [isQRSheetOpen, setIsQRSheetOpen] = useState(false);



    // New address form state
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pincode: "",
    });
    useEffect(() => {
        if (formData.pincode && formData.pincode.length === 6 && pincodeStatus === "unchecked") {
            handlePincodeCheck(formData.pincode);
        }
    }, [formData.pincode]);
    useEffect(() => {
        const fetchSaved = async () => {
            const result = await getAddresses();
            if (result.success && result.data) {
                setSavedAddresses(result.data);
                const defaultAddr = result.data.find(a => a.is_default) || result.data[0];
                if (defaultAddr) {
                    setSelectedAddressId(defaultAddr.id);

                    // ONLY fill the form from default address if NO session pincode exists
                    // This prevents overwriting a new searched location with the default address
                    if (!useStore.getState().serviceablePincode) {
                        setFormData({
                            full_name: defaultAddr.full_name || "",
                            phone: defaultAddr.phone || "",
                            address_line_1: defaultAddr.address_line_1 || "",
                            address_line_2: defaultAddr.address_line_2 || "",
                            city: defaultAddr.city || "",
                            state: defaultAddr.state || "",
                            pincode: defaultAddr.pincode || "",
                        });
                    }
                }
            }
            setLoading(false);
        };
        fetchSaved();
    }, []);

    // Pre-fill pincode, city, and state from product details check (overrides default address if searched)
    useEffect(() => {
        if (serviceablePincode) {
            setFormData(prev => ({
                ...prev,
                pincode: serviceablePincode,
                city: serviceableCity || prev.city,
                state: serviceableState || prev.state
            }));
            // If pincode is pre-filled from product page, mark as serviceable
            if (serviceablePincode) {
                setPincodeStatus("serviceable");
            }
        }
    }, [serviceablePincode, serviceableCity, serviceableState]);

    const handleAddressSelect = (id: string) => {
        const addr = savedAddresses.find(a => a.id === id);
        if (addr) {
            setSelectedAddressId(id);
            setFormData({
                full_name: addr.full_name || "",
                phone: addr.phone || "",
                address_line_1: addr.address_line_1 || "",
                address_line_2: addr.address_line_2 || "",
                city: addr.city || "",
                state: addr.state || "",
                pincode: addr.pincode || "",
            });
            // Check serviceability for the selected address pincode
            if (addr.pincode) {
                handlePincodeCheck(addr.pincode);
            }
        }
    };

    const total = cartTotal();
    const delivery = total > 2999 ? 0 : 99;
    const finalTotal = total + delivery;

    const handlePincodeCheck = async (pincodeToCheck?: string) => {
        const checkPincode = pincodeToCheck || formData.pincode;

        if (!checkPincode || checkPincode.length !== 6) {
            toast.error("Please enter a valid 6-digit pincode");
            return;
        }

        setPincodeStatus("checking");
        const result = await checkServiceabilityAction(checkPincode);

        if (result.success) {
            if (result.serviceable) {
                setPincodeStatus("serviceable");
                setPincodeMessage(result.message || "");

                // Update city and state if provided
                if (result.city || result.state) {
                    setFormData(prev => ({
                        ...prev,
                        city: result.city || prev.city,
                        state: result.state || prev.state
                    }));
                }

                toast.success(result.message || "Delivery available to this pincode");
            } else {
                setPincodeStatus("unserviceable");
                setPincodeMessage(result.message || "");
                toast.error(result.message || "Delivery not available to this pincode");
            }
        } else {
            setPincodeStatus("unchecked");
            toast.error(result.error || "Failed to check serviceability");
        }
    };

    const handlePlaceOrder = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.full_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.state || !formData.pincode) {
            toast.error("Please fill in all shipping details");
            return;
        }

        // Check if pincode serviceability has been verified
        if (pincodeStatus !== "serviceable") {
            toast.error("Please verify pincode serviceability before placing order");
            return;
        }

        if (paymentMethod === "upi" && !isQRSheetOpen) {
            setIsQRSheetOpen(true);
            return;
        }

        setIsPlacingOrder(true);

        try {
            // If save for later checked
            if (saveForLater) {
                const saveResult = await saveAddress({
                    ...formData,
                    is_default: savedAddresses.length === 0
                });
                if (!saveResult.success) {
                    console.error("Failed to save address for later:", saveResult.error);
                }
            }

            // Call confirm-order Server Action
            const result = await confirmOrderAction({
                name: formData.full_name,
                phone: formData.phone,
                address: `${formData.address_line_1}${formData.address_line_2 ? ', ' + formData.address_line_2 : ''}, ${formData.city}, ${formData.pincode}`,
                amount: finalTotal,
                payment_method: paymentMethod
            });

            if (!result.success) {
                throw new Error(result.error || 'Failed to confirm order');
            }

            setIsSuccess(true);
            clearCart();
            toast.success("Order placed successfully!");
        } catch (error: any) {
            console.error("Order error:", error);
            toast.error(error.message || "Something went wrong. Please try again.");
        } finally {
            setIsPlacingOrder(false);
        }
    };

    if (isSuccess) {
        return (
            <div className="container mx-auto flex min-h-[85vh] flex-col items-center justify-center px-4 pt-10 pb-20">
                <div className="max-w-md w-full bg-white rounded-[3rem] border border-white/40 shadow-2xl p-8 text-center relative overflow-hidden backdrop-blur-sm">
                    {/* Decorative Background Elements */}
                    <div className="absolute -top-24 -right-24 w-48 h-48 bg-green-500/5 rounded-full blur-3xl pointer-events-none" />
                    <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ type: "spring", damping: 15, stiffness: 200 }}
                        className="mb-8 relative inline-block"
                    >
                        <div className="relative z-10 rounded-[2rem] bg-green-500 p-8 text-white shadow-xl shadow-green-500/20">
                            <Check className="h-12 w-12 stroke-[3px]" />
                        </div>
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1.2, opacity: 0.3 }}
                            transition={{ repeat: Infinity, duration: 2, repeatType: "reverse" }}
                            className="absolute inset-0 bg-green-500 rounded-[2rem] -z-10"
                        />
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.2 }}
                    >
                        <h1 className="font-serif text-3xl font-black text-foreground mb-4">Confirmed!</h1>
                        <p className="text-muted-foreground text-sm font-medium leading-relaxed px-4">
                            Your ethnic elegance is on its way. We've received your order and are preparing it with care.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.3 }}
                        className="mt-8 bg-secondary/20 rounded-2xl p-4 border border-black/5"
                    >
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 mb-1">Order Reference</p>
                        <p className="text-base font-bold font-mono text-primary">RC-{Math.floor(100000 + Math.random() * 900000)}</p>
                    </motion.div>

                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.4 }}
                        className="mt-10 flex flex-col gap-3"
                    >
                        <Link href="/orders" className="w-full">
                            <Button size="lg" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest shadow-xl shadow-primary/20 transition-all active:scale-[0.98]">
                                <Truck className="mr-2 h-4 w-4" /> Track Order Status
                            </Button>
                        </Link>

                        <Link href="/" className="w-full">
                            <Button size="lg" variant="outline" className="w-full h-14 rounded-2xl text-[11px] font-black uppercase tracking-widest border-2 transition-all active:scale-[0.98]">
                                <ShoppingBag className="mr-2 h-4 w-4" /> Continue Shopping
                            </Button>
                        </Link>
                    </motion.div>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 0.5 }}
                        transition={{ delay: 0.6 }}
                        className="mt-8 text-[9px] font-black uppercase tracking-widest text-muted-foreground"
                    >
                        Thank you for choosing Rupali Collection
                    </motion.p>
                </div>
            </div>
        )
    }

    if (total === 0 && !loading) {
        router.push("/cart");
        return null;
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-32 md:pb-16 pt-4">
            <div className="container mx-auto px-4 max-w-6xl">
                {/* <div className="mb-8 mt-2 flex items-center gap-4 px-1 md:px-0">
                    <BackButton />
                    <div>
                        <h1 className="font-serif text-2xl font-bold md:text-3xl text-foreground">Checkout</h1>
                        <p className="text-[10px] uppercase font-bold tracking-[0.2em] text-muted-foreground/60">Secure SSL Encrypted Checkout</p>
                    </div>
                </div> */}

                <form onSubmit={handlePlaceOrder} className="md:grid md:grid-cols-3 md:gap-8">
                    {/* Left Column: Shipping & Payment */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Shipping Section */}
                        <div className="rounded-2xl border border-white/40 bg-white shadow-sm overflow-hidden">
                            <div className="p-4 border-b bg-secondary/10 flex items-center justify-between">
                                <div className="flex items-center gap-2">
                                    <MapPin className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider">Shipping Address</h2>
                                </div>
                                {savedAddresses.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedAddressId(null)}
                                        className="text-[10px] font-bold text-primary uppercase"
                                    >
                                        {selectedAddressId ? "Add New" : "Reset"}
                                    </button>
                                )}
                            </div>

                            <div className="p-4">
                                {loading ? (
                                    <div className="flex h-40 items-center justify-center">
                                        <Loader2 className="h-6 w-6 animate-spin text-primary" />
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {savedAddresses.length > 0 && !selectedAddressId && (
                                            <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
                                                {savedAddresses.map((addr) => (
                                                    <button
                                                        key={addr.id}
                                                        type="button"
                                                        onClick={() => handleAddressSelect(addr.id)}
                                                        className={cn(
                                                            "flex-shrink-0 w-64 text-left p-4 rounded-xl border-2 transition-all",
                                                            selectedAddressId === addr.id
                                                                ? "border-primary bg-primary/5 shadow-md"
                                                                : "border-gray-100 hover:border-primary/30"
                                                        )}
                                                    >
                                                        <div className="flex justify-between items-start mb-2">
                                                            <p className="font-bold text-sm truncate">{addr.full_name}</p>
                                                            {addr.is_default && <Badge variant="secondary" className="text-[8px] h-4">Default</Badge>}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2 mb-1">{addr.address_line_1}, {addr.address_line_2}</p>
                                                        <p className="text-xs font-bold">{addr.city}, {addr.pincode}</p>
                                                    </button>
                                                ))}
                                            </div>
                                        )}

                                        {selectedAddressId && (
                                            <div className="rounded-xl border border-primary/20 bg-primary/5 p-4 flex justify-between items-center mb-4">
                                                <div>
                                                    <p className="font-bold text-sm">{formData.full_name}</p>
                                                    <p className="text-xs text-muted-foreground">{formData.address_line_1}, {formData.city}</p>
                                                    <div className="mt-2 flex items-center gap-2">
                                                        <span className="text-[10px] font-black bg-white px-2 py-0.5 rounded-full shadow-sm border text-primary uppercase">
                                                            Deliver to: {formData.pincode}
                                                        </span>
                                                        {pincodeStatus === "serviceable" && <Check className="h-3 w-3 text-green-500" />}
                                                    </div>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={() => setSelectedAddressId(null)}
                                                    className="h-8 px-3 rounded-lg border text-[10px] font-bold uppercase tracking-wider bg-white active:bg-gray-50 transition-colors"
                                                >
                                                    Change
                                                </button>
                                            </div>
                                        )}

                                        {(!selectedAddressId || savedAddresses.length === 0) && (
                                            <motion.div
                                                initial={{ opacity: 0, height: 0 }}
                                                animate={{ opacity: 1, height: "auto" }}
                                                className="space-y-3"
                                            >
                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Full Name</label>
                                                        <Input
                                                            required
                                                            placeholder="Name"
                                                            value={formData.full_name}
                                                            onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                                            className="h-11 rounded-xl bg-secondary/5 border-transparent focus:bg-white transition-all text-sm"
                                                        />
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Phone</label>
                                                        <Input
                                                            required
                                                            type="tel"
                                                            placeholder="Number"
                                                            value={formData.phone}
                                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                                            className="h-11 rounded-xl bg-secondary/5 border-transparent focus:bg-white transition-all text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                <div className="space-y-1">
                                                    <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">Address Details</label>
                                                    <Input
                                                        required
                                                        placeholder="House No., Building, Area"
                                                        value={formData.address_line_1}
                                                        onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                                        className="h-11 rounded-xl bg-secondary/5 border-transparent focus:bg-white transition-all text-sm"
                                                    />
                                                </div>

                                                <div className="grid grid-cols-2 gap-3">
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">PIN Code</label>
                                                        <div className="relative">
                                                            <Input
                                                                required
                                                                placeholder="6 Digits"
                                                                value={formData.pincode}
                                                                onChange={(e) => {
                                                                    const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                                    setFormData({ ...formData, pincode: val });
                                                                    if (pincodeStatus !== "unchecked") setPincodeStatus("unchecked");
                                                                    if (val.length === 6) handlePincodeCheck(val);
                                                                }}
                                                                className={cn(
                                                                    "h-11 rounded-xl bg-secondary/5 border-transparent focus:bg-white transition-all text-sm pr-10",
                                                                    pincodeStatus === "serviceable" && "border-green-200 bg-green-50/30",
                                                                    pincodeStatus === "unserviceable" && "border-red-200 bg-red-50/30"
                                                                )}
                                                            />
                                                            {pincodeStatus === "checking" && (
                                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                                </div>
                                                            )}
                                                            {pincodeStatus === "serviceable" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />}
                                                        </div>
                                                    </div>
                                                    <div className="space-y-1">
                                                        <label className="text-[9px] font-bold uppercase text-muted-foreground ml-1">City</label>
                                                        <Input
                                                            required
                                                            placeholder="City"
                                                            value={formData.city}
                                                            disabled={!!serviceableCity}
                                                            className="h-11 rounded-xl bg-secondary/5 border-transparent disabled:opacity-50 text-sm"
                                                        />
                                                    </div>
                                                </div>

                                                {pincodeStatus === "unserviceable" && (
                                                    <p className="text-[10px] font-bold text-red-500 bg-red-50 p-2 rounded-lg flex items-center gap-2">
                                                        <AlertCircle className="h-3 w-3" /> {pincodeMessage}
                                                    </p>
                                                )}

                                                <div className="flex items-center gap-2 pt-2 px-1">
                                                    <Checkbox
                                                        id="save_later"
                                                        checked={saveForLater}
                                                        onCheckedChange={(checked) => setSaveForLater(!!checked)}
                                                    />
                                                    <label htmlFor="save_later" className="text-[11px] font-medium text-muted-foreground">
                                                        Save address for future orders
                                                    </label>
                                                </div>
                                            </motion.div>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Order Summary (Sticky) */}
                    <div className="md:col-span-1" id="order-summary">
                        <div className="sticky top-24 space-y-6">
                            <div className="rounded-2xl border border-white/40 bg-white shadow-sm overflow-hidden">
                                <div className="p-4 border-b bg-secondary/10 flex items-center gap-2">
                                    <ShoppingBag className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider">Order Summary</h2>
                                </div>
                                <div className="p-4">
                                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto no-scrollbar">
                                        {useStore.getState().items.map((item) => (
                                            <div key={item.cartId} className="flex gap-4 items-center">
                                                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border bg-white shadow-sm">
                                                    <img
                                                        src={item.thumbnail_url}
                                                        alt={item.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-[11px] font-bold uppercase truncate">{item.name}</h3>
                                                    <p className="text-[9px] text-muted-foreground font-medium uppercase mt-0.5">
                                                        Size: {item.selectedSize} • Qty: {item.quantity}
                                                    </p>
                                                    <p className="text-xs font-black mt-1 text-primary">{formatPrice(item.price * item.quantity)}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-2 pt-4 border-t border-dashed">
                                        <div className="flex justify-between text-[11px] font-medium text-muted-foreground">
                                            <span>Bag Total</span>
                                            <span>{formatPrice(total)}</span>
                                        </div>
                                        <div className="flex justify-between text-[11px] font-medium">
                                            <span className="text-muted-foreground">Shipping Fee</span>
                                            <span className={delivery === 0 ? "text-green-600 font-bold" : ""}>
                                                {delivery === 0 ? "FREE" : formatPrice(delivery)}
                                            </span>
                                        </div>
                                        {delivery > 0 && (
                                            <p className="text-[9px] text-primary font-bold bg-primary/5 p-1.5 rounded-lg text-center animate-pulse mt-1">
                                                Add {formatPrice(3000 - total)} more for FREE Delivery
                                            </p>
                                        )}
                                    </div>

                                    {/* Desktop view button (moved inside summary) */}
                                    <div className="hidden md:block mt-6">
                                        <Button
                                            onClick={handlePlaceOrder}
                                            size="lg"
                                            className="w-full py-6 rounded-xl text-lg font-bold shadow-lg"
                                            loading={isPlacingOrder}
                                        >
                                            Place Order — {formatPrice(finalTotal)}
                                        </Button>
                                    </div>
                                </div>
                            </div>
                            <p className="text-[9px] text-center text-muted-foreground mt-2 uppercase tracking-widest opacity-60 px-4 hidden md:block">
                                SSL Encrypted Security • Authentic Products
                            </p>

                            {/* Payment Mode - Moved to Last */}
                            <div className="rounded-2xl border border-white/40 bg-white shadow-sm overflow-hidden mt-6">
                                <div className="p-4 border-b bg-secondary/10 flex items-center gap-2">
                                    <Truck className="h-4 w-4 text-primary" />
                                    <h2 className="text-sm font-bold uppercase tracking-wider">Payment Method</h2>
                                </div>
                                <div className="p-4 grid grid-cols-2 gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("upi")}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all text-center space-y-1",
                                            paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-gray-50"
                                        )}
                                    >
                                        <p className="text-xs font-bold">Online</p>
                                        <p className="text-[8px] text-muted-foreground uppercase font-black">Fast & Secure</p>
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => setPaymentMethod("cod")}
                                        className={cn(
                                            "p-3 rounded-xl border-2 transition-all text-center space-y-1",
                                            paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-50"
                                        )}
                                    >
                                        <p className="text-xs font-bold">COD</p>
                                        <p className="text-[8px] text-muted-foreground uppercase font-black">Pay on Delivery</p>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </form>

                {/* Desktop view button (Removed here as it's now in the sticky sidebar) */}

                {/* Mobile msg */}
                <p className="text-[9px] text-center text-muted-foreground mt-6 uppercase tracking-widest opacity-60 px-4 md:hidden">
                    SSL Encrypted Security • Authentic Products • Easy Returns
                </p>
            </div>

            {/* Mobile Sticky Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 z-[60] md:hidden">
                <div className="bg-white border-t border-primary/10 px-4 py-3 pb-safe flex items-center justify-between shadow-[0_-8px_30px_rgb(0,0,0,0.08)] backdrop-blur-md bg-white/95">
                    <div>
                        <div className="flex items-center gap-1.5" onClick={() => {
                            document.getElementById('order-summary')?.scrollIntoView({ behavior: 'smooth' });
                        }}>
                            <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-tight">To Pay</span>
                            <div className="h-1 w-1 rounded-full bg-muted-foreground/30" />
                            <span className="text-xs font-bold text-primary">View Brief</span>
                        </div>
                        <p className="text-lg font-black tracking-tight text-foreground">{formatPrice(finalTotal)}</p>
                    </div>
                    <Button
                        onClick={handlePlaceOrder}
                        disabled={isPlacingOrder || (pincodeStatus !== "serviceable" && !serviceablePincode) || !formData.full_name}
                        className="h-12 px-8 rounded-xl font-bold uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95"
                    >
                        {isPlacingOrder ? (
                            <Loader2 className="h-5 w-5 animate-spin" />
                        ) : (
                            <>
                                {paymentMethod === "cod" ? "Confirm Booking" : "Pay Now"}
                                <ArrowRight className="ml-2 h-4 w-4" />
                            </>
                        )}
                    </Button>
                </div>
            </div>

            {/* QR Code Sheet */}
            <Sheet open={isQRSheetOpen} onOpenChange={setIsQRSheetOpen}>
                <SheetContent side="bottom" className="rounded-t-[2rem] p-6 h-[70vh]">
                    <SheetHeader className="text-center">
                        <SheetTitle className="text-xl font-serif">Scan & Pay</SheetTitle>
                        <SheetDescription>
                            Scan the QR code with any UPI app to complete your payment
                        </SheetDescription>
                    </SheetHeader>

                    <div className="flex flex-col items-center justify-center py-8">
                        <div className="relative p-6 bg-white rounded-3xl shadow-xl border-2 border-primary/10 mb-6">
                            <QrCode className="h-48 w-48 text-primary" />
                            <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none">
                                <ShoppingBag className="h-24 w-24" />
                            </div>
                        </div>

                        <div className="space-y-4 w-full max-w-xs text-center">
                            <div>
                                <p className="text-[10px] uppercase font-bold text-muted-foreground tracking-widest mb-1">Amount to pay</p>
                                <p className="text-3xl font-black text-primary">{formatPrice(finalTotal)}</p>
                            </div>

                            <div className="bg-secondary/10 p-4 rounded-2xl">
                                <p className="text-xs font-medium text-muted-foreground">Once payment is complete, the order will be confirmed automatically.</p>
                            </div>

                            <Button
                                onClick={() => {
                                    setIsQRSheetOpen(false);
                                    handlePlaceOrder({ preventDefault: () => { } } as any);
                                }}
                                className="w-full h-12 rounded-xl font-bold uppercase tracking-widest"
                                loading={isPlacingOrder}
                            >
                                I Have Paid
                            </Button>
                        </div>
                    </div>
                </SheetContent>
            </Sheet>
        </div>
    );
}

const Badge = ({ children, variant, className }: any) => (
    <span className={cn(
        "px-2 py-0.5 rounded-full inline-flex items-center justify-center font-bold tracking-tight",
        variant === 'secondary' ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground",
        className
    )}>
        {children}
    </span>
);
