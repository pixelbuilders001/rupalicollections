"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    MapPin,
    Plus,
    Trash2,
    Pencil,
    CheckCircle2,
    Loader2,
    ChevronLeft,
    MoreVertical
} from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    getAddresses,
    saveAddress,
    deleteAddress,
    setDefaultAddress
} from "@/app/actions/address-actions";
import { Address } from "@/lib/types";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

export default function AddressesPage() {
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);
    const [isSettingDefault, setIsSettingDefault] = useState<string | null>(null);

    // Form state
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
    const [formData, setFormData] = useState({
        full_name: "",
        phone: "",
        address_line_1: "",
        address_line_2: "",
        city: "",
        state: "",
        pincode: "",
        is_default: false
    });

    useEffect(() => {
        setIsMounted(true);
        fetchAddresses();
    }, []);

    const fetchAddresses = async () => {
        setLoading(true);
        const result = await getAddresses();
        if (result.success && result.data) {
            setAddresses(result.data);
        } else if (result.error === "Not authenticated") {
            router.push("/login");
        }
        setLoading(false);
    };

    const handleOpenModal = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData({
                full_name: address.full_name,
                phone: address.phone,
                address_line_1: address.address_line_1,
                address_line_2: address.address_line_2 || "",
                city: address.city,
                state: address.state,
                pincode: address.pincode,
                is_default: address.is_default
            });
        } else {
            setEditingAddress(null);
            setFormData({
                full_name: "",
                phone: "",
                address_line_1: "",
                address_line_2: "",
                city: "",
                state: "",
                pincode: "",
                is_default: addresses.length === 0 // First address is default
            });
        }
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        // Validation
        if (!formData.full_name || !formData.phone || !formData.address_line_1 || !formData.city || !formData.state || !formData.pincode) {
            toast.error("Please fill in all required fields");
            return;
        }

        setIsSaving(true);
        const result = await saveAddress({
            ...formData,
            id: editingAddress?.id
        });

        if (result.success) {
            toast.success(editingAddress ? "Address updated" : "Address added");
            setIsModalOpen(false);
            fetchAddresses();
        } else {
            toast.error("Failed to save address");
        }
        setIsSaving(false);
    };

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        const result = await deleteAddress(id);
        if (result.success) {
            toast.success("Address removed");
            setAddresses(prev => prev.filter(a => a.id !== id));
        } else {
            toast.error("Failed to remove address");
        }
        setIsDeleting(null);
    };

    const handleSetDefault = async (id: string) => {
        setIsSettingDefault(id);
        const result = await setDefaultAddress(id);
        if (result.success) {
            toast.success("Default address updated");
            fetchAddresses();
        } else {
            toast.error("Failed to update default address");
        }
        setIsSettingDefault(null);
    };

    if (!isMounted) return null;

    return (
        <div className="min-h-screen bg-secondary/20 pb-20 pt-8 md:pb-8">
            <div className="container mx-auto max-w-4xl px-4">
                {/* Header */}
                <div className="mb-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => router.back()}
                            className="rounded-full bg-white shadow-sm"
                        >
                            <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <h1 className="font-serif text-3xl font-bold">My Addresses</h1>
                    </div>
                    <Button onClick={() => handleOpenModal()} className="gap-2 shadow-lg">
                        <Plus className="h-4 w-4" /> Add New
                    </Button>
                </div>

                {loading ? (
                    <div className="flex h-64 flex-col items-center justify-center gap-4">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                        <p className="text-muted-foreground font-serif">Fetching your addresses...</p>
                    </div>
                ) : addresses.length === 0 ? (
                    <div className="flex h-80 flex-col items-center justify-center rounded-3xl border-2 border-dashed border-white/50 bg-white/30 backdrop-blur-sm text-center p-8">
                        <div className="mb-4 rounded-full bg-primary/10 p-6">
                            <MapPin className="h-10 w-10 text-primary" />
                        </div>
                        <h2 className="font-serif text-xl font-bold">No Addresses Found</h2>
                        <p className="mt-2 text-muted-foreground">Add your delivery address to proceed with checkout faster.</p>
                        <Button onClick={() => handleOpenModal()} className="mt-6">Add My First Address</Button>
                    </div>
                ) : (
                    <div className="grid gap-4 sm:grid-cols-2">
                        <AnimatePresence mode="popLayout">
                            {addresses.map((address) => (
                                <motion.div
                                    key={address.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    className={`relative overflow-hidden rounded-2xl border bg-white/80 p-6 shadow-sm backdrop-blur-sm transition-all hover:shadow-md ${address.is_default ? "border-primary/40 ring-1 ring-primary/20" : "border-white/50"
                                        }`}
                                >
                                    {address.is_default && (
                                        <Badge className="absolute right-4 top-4 bg-primary/10 text-primary hover:bg-primary/20 border-none">
                                            Default
                                        </Badge>
                                    )}

                                    <div className="mb-4 flex items-start gap-4">
                                        <div className={`rounded-full p-2 ${address.is_default ? "bg-primary/10 text-primary" : "bg-secondary text-muted-foreground"}`}>
                                            <MapPin className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900">{address.full_name}</h3>
                                            <p className="text-sm font-medium text-muted-foreground">{address.phone}</p>
                                        </div>
                                    </div>

                                    <div className="mb-6 space-y-1 text-sm text-gray-600">
                                        <p>{address.address_line_1}</p>
                                        {address.address_line_2 && <p>{address.address_line_2}</p>}
                                        <p>{address.city}, {address.state} - {address.pincode}</p>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleOpenModal(address)}
                                            className="h-9 gap-2 text-xs"
                                        >
                                            <Pencil className="h-3 w-3" /> Edit
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleDelete(address.id)}
                                            className="h-9 gap-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-600"
                                            loading={isDeleting === address.id}
                                        >
                                            <Trash2 className="h-3 w-3" /> Remove
                                        </Button>
                                        {!address.is_default && (
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={() => handleSetDefault(address.id)}
                                                className="h-9 ml-auto text-xs text-primary underline underline-offset-4"
                                                loading={isSettingDefault === address.id}
                                            >
                                                Set as Default
                                            </Button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Address Form Modal */}
            <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                <DialogContent className="sm:max-w-[500px]">
                    <DialogHeader>
                        <DialogTitle className="font-serif text-2xl">
                            {editingAddress ? "Edit Address" : "Add New Address"}
                        </DialogTitle>
                        <DialogDescription>
                            Enter your shipping details below for accurate delivery.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Full Name</label>
                                <Input
                                    value={formData.full_name}
                                    onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                                    placeholder="Rajeev Kumar"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Phone Number</label>
                                <Input
                                    value={formData.phone}
                                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                    placeholder="+91 00000 00000"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address Line 1</label>
                            <Input
                                value={formData.address_line_1}
                                onChange={(e) => setFormData({ ...formData, address_line_1: e.target.value })}
                                placeholder="House No, Building Name, Street"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Address Line 2 (Optional)</label>
                            <Input
                                value={formData.address_line_2}
                                onChange={(e) => setFormData({ ...formData, address_line_2: e.target.value })}
                                placeholder="Landmark, Area"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">City</label>
                                <Input
                                    value={formData.city}
                                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                    placeholder="New Delhi"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Pincode</label>
                                <Input
                                    value={formData.pincode}
                                    onChange={(e) => setFormData({ ...formData, pincode: e.target.value })}
                                    placeholder="110001"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">State</label>
                            <Input
                                value={formData.state}
                                onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                placeholder="Delhi"
                            />
                        </div>

                        <div className="flex items-center gap-2 pt-2">
                            <input
                                type="checkbox"
                                id="is_default"
                                checked={formData.is_default}
                                onChange={(e) => setFormData({ ...formData, is_default: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                disabled={addresses.length === 0}
                            />
                            <label htmlFor="is_default" className="text-sm font-medium">Set as default address</label>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsModalOpen(false)} disabled={isSaving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={isSaving}>
                            {editingAddress ? "Update Address" : "Save Address"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
