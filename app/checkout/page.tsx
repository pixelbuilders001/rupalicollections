"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { cn, formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import { useRouter } from "next/navigation";
import { CheckCircle2, ArrowRight, MapPin, Plus, Loader2 } from "lucide-react";
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
import { Check, AlertCircle } from "lucide-react";

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
            <div className="container mx-auto flex min-h-[70vh] flex-col items-center justify-center px-4 text-center">
                <motion.div
                    initial={{ scale: 0.5, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="mb-6 rounded-full bg-green-100 p-6 text-green-600"
                >
                    <CheckCircle2 className="h-16 w-16" />
                </motion.div>
                <h1 className="font-serif text-2xl font-bold">Order Placed Successfully!</h1>
                <p className="mt-3 text-muted-foreground max-w-md text-base">
                    Thank you for shopping with Rupali Collection. Your order #RC-{Math.floor(100000 + Math.random() * 900000)} has been confirmed and will be dispatched soon.
                </p>
                <Link href="/" className="mt-8">
                    <Button size="lg" className="px-6 py-4 text-base rounded-full shadow-md hover:shadow-lg transition-all">
                        Continue Shopping
                    </Button>
                </Link>
            </div>
        )
    }

    if (total === 0 && !loading) {
        router.push("/cart");
        return null;
    }

    return (
        <div className="min-h-screen bg-secondary/5 pb-16 pt-6">
            <div className="container mx-auto px-4 max-w-2xl">
                <BackButton className="mb-4" showLabel label="Back" />


                <form onSubmit={handlePlaceOrder} className="space-y-6">

                    {/* Shipping Section */}
                    <div className="rounded-2xl border border-white/40 bg-white shadow-lg p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="rounded-lg bg-primary/10 p-1.5 text-primary">
                                    <MapPin className="h-5 w-5" />
                                </div>
                                <h2 className="font-serif text-lg font-bold">Shipping Address</h2>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex h-40 items-center justify-center">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <div className="space-y-4">
                                {savedAddresses.length > 0 && (
                                    <div className="mb-2">
                                        <label className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-1.5 block">
                                            Select Saved Address
                                        </label>
                                        <Select value={selectedAddressId || ""} onValueChange={handleAddressSelect}>
                                            <SelectTrigger className="w-full bg-secondary/5 border-primary/10 h-10">
                                                <SelectValue placeholder="Choose a saved address..." />
                                            </SelectTrigger>
                                            <SelectContent>
                                                {savedAddresses.map((addr) => (
                                                    <SelectItem key={addr.id} value={addr.id}>
                                                        {addr.full_name} - {addr.city}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                )}

                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        required
                                        placeholder="Full Name"
                                        value={formData.full_name}
                                        onChange={(e) => {
                                            setFormData({ ...formData, full_name: e.target.value });
                                            setSelectedAddressId(null);
                                        }}
                                        className="h-10 text-sm"
                                    />
                                    <Input
                                        required
                                        type="tel"
                                        placeholder="Phone Number"
                                        value={formData.phone}
                                        onChange={(e) => {
                                            setFormData({ ...formData, phone: e.target.value });
                                            setSelectedAddressId(null);
                                        }}
                                        className="h-10 text-sm"
                                    />
                                </div>
                                <Input
                                    required
                                    placeholder="Address Line 1"
                                    value={formData.address_line_1}
                                    onChange={(e) => {
                                        setFormData({ ...formData, address_line_1: e.target.value });
                                        setSelectedAddressId(null);
                                    }}
                                    className="h-10 text-sm"
                                />
                                <Input
                                    placeholder="Address Line 2 (Optional)"
                                    value={formData.address_line_2}
                                    onChange={(e) => {
                                        setFormData({ ...formData, address_line_2: e.target.value });
                                        setSelectedAddressId(null);
                                    }}
                                    className="h-10 text-sm"
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        required
                                        placeholder="City"
                                        value={formData.city}
                                        disabled={!!serviceableCity}
                                        onChange={(e) => {
                                            setFormData({ ...formData, city: e.target.value });
                                            setSelectedAddressId(null);
                                        }}
                                        className={cn("h-10 text-sm", !!serviceableCity && "bg-secondary/20")}
                                    />
                                    <div className="relative">
                                        <Input
                                            required
                                            placeholder="PIN Code"
                                            value={formData.pincode}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\D/g, "").slice(0, 6);
                                                setFormData({ ...formData, pincode: val });
                                                setSelectedAddressId(null);
                                                if (pincodeStatus !== "unchecked") setPincodeStatus("unchecked");

                                                // Auto-check when 6 digits are entered
                                                if (val.length === 6) {
                                                    handlePincodeCheck(val);
                                                }
                                            }}
                                            className={cn(
                                                "h-10 text-sm pr-10",
                                                pincodeStatus === "serviceable" ? "border-green-200 ring-green-500/10" :
                                                    pincodeStatus === "unserviceable" ? "border-red-200 ring-red-500/10" : ""
                                            )}
                                        />
                                        {pincodeStatus === "checking" && (
                                            <div className="absolute right-3 top-1/2 -translate-y-1/2 flex h-5 w-5 items-center justify-center">
                                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                                            </div>
                                        )}
                                        {pincodeStatus === "serviceable" && <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-green-500" />}
                                        {pincodeStatus === "unserviceable" && <AlertCircle className="absolute right-3 top-1/2 -translate-y-1/2 h-5 w-5 text-red-500" />}
                                    </div>
                                </div>


                                {/* Serviceability Message */}
                                {pincodeStatus !== "unchecked" && pincodeMessage && (
                                    <motion.p
                                        initial={{ opacity: 0, y: -5 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={cn(
                                            "text-[11px] font-bold tracking-tight",
                                            pincodeStatus === "serviceable" ? "text-green-600" : "text-red-500"
                                        )}
                                    >
                                        {pincodeMessage}
                                    </motion.p>
                                )}

                                <Input
                                    required
                                    placeholder="State"
                                    value={formData.state}
                                    disabled={!!serviceableState}
                                    onChange={(e) => {
                                        setFormData({ ...formData, state: e.target.value });
                                        setSelectedAddressId(null);
                                    }}
                                    className={cn("h-10 text-sm", !!serviceableState && "bg-secondary/20")}
                                />

                                <div className="flex items-center gap-2 pt-1">
                                    <Checkbox
                                        id="save_later"
                                        checked={saveForLater}
                                        onCheckedChange={(checked) => setSaveForLater(!!checked)}
                                    />
                                    <label htmlFor="save_later" className="text-xs font-medium cursor-pointer text-muted-foreground">
                                        Save this address for later
                                    </label>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Order Summary (Moved up) */}
                    <div className="rounded-2xl border border-white/40 bg-white shadow-lg p-6">
                        <h2 className="font-serif text-lg font-bold mb-4 border-b pb-3">Order Summary</h2>

                        <div className="space-y-4 mb-6">
                            {useStore.getState().items.map((item) => (
                                <div key={item.cartId} className="flex gap-4">
                                    <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-xl border border-white bg-white shadow-sm">
                                        <img
                                            src={item.thumbnail_url}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                    <div className="flex flex-1 flex-col justify-center">
                                        <h3 className="text-xs font-bold line-clamp-1">{item.name}</h3>
                                        <p className="text-[10px] text-muted-foreground">
                                            Qty: {item.quantity} • {item.selectedSize}
                                        </p>
                                    </div>
                                    <p className="text-xs font-bold flex items-center">
                                        {formatPrice(item.price * item.quantity)}
                                    </p>
                                </div>
                            ))}
                        </div>

                        <div className="space-y-2 pt-4 border-t border-dashed">
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                <span>Subtotal</span>
                                <span>{formatPrice(total)}</span>
                            </div>
                            <div className="flex justify-between text-xs text-muted-foreground font-medium">
                                <span>Delivery</span>
                                <span className={delivery === 0 ? "text-green-600 font-bold" : ""}>
                                    {delivery === 0 ? "FREE" : formatPrice(delivery)}
                                </span>
                            </div>
                            <div className="mt-3 flex justify-between text-lg font-bold pt-3 border-t border-gray-100">
                                <span className="font-serif">Grand Total</span>
                                <span className="text-primary">{formatPrice(finalTotal)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Payment Section (Now below summary) */}
                    <div className="rounded-2xl border border-white/40 bg-white shadow-lg p-6">
                        <h2 className="font-serif text-lg font-bold mb-4">Payment Method</h2>
                        <div className="space-y-3">
                            <label
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/30 ${paymentMethod === "upi" ? "border-primary bg-primary/5" : "border-gray-100"
                                    }`}
                                onClick={() => setPaymentMethod("upi")}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="h-4 w-4 accent-primary"
                                        checked={paymentMethod === "upi"}
                                        onChange={() => setPaymentMethod("upi")}
                                    />
                                    <div>
                                        <p className="font-bold text-sm">UPI / Cards / Netbanking</p>
                                        <p className="text-[11px] text-muted-foreground">Secure payment via Razorpay</p>
                                    </div>
                                </div>
                            </label>
                            <label
                                className={`flex cursor-pointer items-center justify-between gap-3 rounded-xl border-2 p-4 transition-all hover:bg-muted/30 ${paymentMethod === "cod" ? "border-primary bg-primary/5" : "border-gray-100"
                                    }`}
                                onClick={() => setPaymentMethod("cod")}
                            >
                                <div className="flex items-center gap-3">
                                    <input
                                        type="radio"
                                        name="payment"
                                        className="h-4 w-4 accent-primary"
                                        checked={paymentMethod === "cod"}
                                        onChange={() => setPaymentMethod("cod")}
                                    />
                                    <div>
                                        <p className="font-bold text-sm">Cash on Delivery</p>
                                        <p className="text-[11px] text-muted-foreground">Pay when you receive your order</p>
                                    </div>
                                </div>
                            </label>
                        </div>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full py-6 rounded-xl text-lg font-bold shadow-lg hover:shadow-xl transition-all"
                        loading={isPlacingOrder}
                    >
                        Place Order — {formatPrice(finalTotal)}
                    </Button>
                </form>

                <p className="text-[9px] text-center text-muted-foreground mt-6 uppercase tracking-widest opacity-60">
                    SSL Secure Payment • 100% Genuine Products
                </p>
            </div >
        </div >
    );
}
