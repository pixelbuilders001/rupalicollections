"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store";
import {
    Package,
    MapPin,
    Heart,
    LogOut,
    Settings,
    User,
    ChevronRight,
    CreditCard,
    Bell,
    Pencil
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { useEffect, useState } from "react";
import { getUserProfile, updateUserProfile, uploadProfilePhoto } from "@/app/actions/user-actions";
import Image from "next/image";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { BackButton } from "@/components/common/BackButton";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UserProfile {
    id: string;
    email: string | undefined;
    name: string | undefined;
    avatar_url: string | undefined;
    phone: string | undefined;
}

export default function AccountPage() {
    const router = useRouter();
    const [user, setUser] = useState<UserProfile | null>(null);
    const [loading, setLoading] = useState(true);
    const [isEditOpen, setIsEditOpen] = useState(false);
    const [formData, setFormData] = useState({ name: "", phone: "", email: "" });
    const [saving, setSaving] = useState(false);
    const [isLoggingOut, setIsLoggingOut] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const result = await getUserProfile();
            if (!result.success || !result.data) {
                router.push("/login");
                return;
            }

            const profile = result.data;
            setUser(profile);
            setFormData({
                name: profile.name || "",
                phone: profile.phone || "",
                email: profile.email || ""
            });
            if (profile.avatar_url) setPreviewUrl(profile.avatar_url);
            setLoading(false);
        };

        getUser();
    }, [router]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setSelectedFile(file);
            const url = URL.createObjectURL(file);
            setPreviewUrl(url);
        }
    };

    const handleLogout = async () => {
        setIsLoggingOut(true);
        try {
            await createClient().auth.signOut();
            useStore.getState().clearCart();
            router.refresh();
            router.push("/login");
        } finally {
            setIsLoggingOut(false);
        }
    };

    const handleSaveChanges = async () => {
        if (!user) return;
        setSaving(true);
        try {
            let avatar_url = user.avatar_url;

            // Handle Photo Upload if selected
            if (selectedFile) {
                const uploadFormData = new FormData();
                uploadFormData.append('file', selectedFile);

                const uploadResult = await uploadProfilePhoto(uploadFormData);

                if (uploadResult.success && uploadResult.data) {
                    avatar_url = uploadResult.data;
                } else {
                    toast.error("Failed to upload photo: " + uploadResult.error);
                    setSaving(false);
                    return;
                }
            }

            const updates = {
                full_name: formData.name,
                phone_number: formData.phone,
                profile_image: avatar_url,
                email: formData.email
            };

            const result = await updateUserProfile(updates);

            if (result.success) {
                setUser(prev => prev ? ({ ...prev, name: formData.name, phone: formData.phone, avatar_url }) : null);
                setPreviewUrl(avatar_url || null);
                setSelectedFile(null);
                setIsEditOpen(false);
                toast.success("Profile updated successfully!");
                router.refresh();
            } else {
                console.error("Error updating profile:", result.error);
                toast.error("Failed to update profile. Please try again.");
            }
        } catch (error) {
            console.error("Profile update error:", error);
            toast.error("An unexpected error occurred.");
        } finally {
            setSaving(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: "spring" as const, stiffness: 300, damping: 24 }
        }
    };

    const menuItems = [
        { icon: Package, label: "Orders", desc: "Check your order status", href: "/orders", color: "text-blue-600", bg: "bg-blue-50" },
        { icon: Heart, label: "Wishlist", desc: "Your favorite items", href: "/wishlist", color: "text-pink-600", bg: "bg-pink-50" },
        { icon: MapPin, label: "Addresses", desc: "Manage delivery addresses", href: "/addresses", color: "text-green-600", bg: "bg-green-50" },
        // { icon: CreditCard, label: "Payments", desc: "Manage payment methods", href: "/payments", color: "text-purple-600", bg: "bg-purple-50" },
        // { icon: Bell, label: "Notifications", desc: "Offers and updates", href: "/notifications", color: "text-amber-600", bg: "bg-amber-50" },
        { icon: Settings, label: "Settings", desc: "Profile and security", href: "/settings", color: "text-slate-600", bg: "bg-slate-50" },
    ];

    if (loading) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-background">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-12 w-12 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
                    <p className="animate-pulse text-sm text-muted-foreground font-serif">Loading Profile...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/20 pb-20 pt-4 md:pb-8">
            {/* Decorative Background Blob */}
            <div className="fixed -left-40 -top-40 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
            <div className="fixed -bottom-40 -right-40 h-96 w-96 rounded-full bg-pink-500/5 blur-3xl" />

            <div className="container relative mx-auto max-w-5xl px-4">
                {/* <BackButton className="mb-4" showLabel label="Back" /> */}

                {/* Header Section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 flex items-center justify-between"
                >
                    <div>
                        <h1 className="font-serif text-2xl font-bold text-foreground md:text-4xl">My Account</h1>
                    </div>
                </motion.div>

                <div className="grid gap-6 lg:grid-cols-12">
                    {/* Left Column: Redesigned Profile Card */}
                    <div className="lg:col-span-4">
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="sticky top-24 overflow-hidden rounded-[2rem] border border-white/40 bg-white/40 shadow-2xl backdrop-blur-2xl"
                        >
                            <div className="relative p-8 flex flex-col items-center">
                                {/* Edit Button - Top Right */}
                                <div className="absolute top-4 right-4">
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-10 w-10 rounded-xl bg-primary/5 text-primary hover:bg-primary/10 transition-all active:scale-95"
                                        onClick={() => setIsEditOpen(true)}
                                    >
                                        <Pencil className="h-4.5 w-4.5" />
                                    </Button>
                                </div>

                                {/* Centered Photo */}
                                <div className="relative mb-6 h-24 w-24 overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
                                    {previewUrl ? (
                                        <Image
                                            src={previewUrl}
                                            alt={user?.name || "User"}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center bg-primary/5 text-primary">
                                            <User className="h-10 w-10" />
                                        </div>
                                    )}
                                </div>



                                {/* Info List */}
                                <div className="w-full space-y-4 pt-6 border-t border-black/5">
                                    <div className="flex items-center gap-4 group">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <User className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 leading-none mb-1.5">Full Name</span>
                                            <span className="text-sm font-semibold text-gray-700 truncate">{user?.name}</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 group">
                                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                            <Bell className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 leading-none mb-1.5">Email Address</span>
                                            <span className="text-sm font-semibold text-gray-700 truncate">{user?.email}</span>
                                        </div>
                                    </div>

                                    {user?.phone && (
                                        <div className="flex items-center gap-4 group">
                                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary/30 text-muted-foreground group-hover:bg-primary/5 group-hover:text-primary transition-colors">
                                                <CreditCard className="h-5 w-5" />
                                            </div>
                                            <div className="flex flex-col min-w-0">
                                                <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground/60 leading-none mb-1.5">Phone Number</span>
                                                <span className="text-sm font-semibold text-gray-700">{user.phone}</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: Dashboard Grid */}
                    <div className="lg:col-span-8">
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                            className="grid gap-4 sm:grid-cols-2"
                        >
                            {menuItems.map((item) => (
                                <motion.div key={item.label} variants={itemVariants}>
                                    <Link
                                        href={item.href}
                                        className="group relative flex h-full items-center gap-4 overflow-hidden rounded-2xl border border-white/50 bg-white/40 p-5 shadow-sm backdrop-blur-sm transition-all hover:-translate-y-1 hover:shadow-xl hover:border-primary/20"
                                    >
                                        <div className={`rounded-xl p-3 shadow-sm ${item.bg} ${item.color} transition-transform group-hover:scale-110 duration-300`}>
                                            <item.icon className="h-6 w-6" />
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-bold text-gray-800 group-hover:text-primary transition-colors">{item.label}</h3>
                                            <p className="text-xs text-muted-foreground/80">{item.desc}</p>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 transition-all group-hover:translate-x-1 group-hover:text-primary" />
                                    </Link>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>
            </div>

            <div className="mt-8 flex justify-center pb-8">
                <Button
                    variant="outline"
                    onClick={handleLogout}
                    className="w-full max-w-sm rounded-2xl border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 h-12 font-bold uppercase tracking-widest text-[11px]"
                    loading={isLoggingOut}
                >
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                </Button>
            </div>

            {/* Edit Profile Modal */}
            <Dialog open={isEditOpen} onOpenChange={setIsEditOpen}>
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                        {/* <DialogDescription>
                            Make changes to your profile here. Click save when you're done.
                        </DialogDescription> */}
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="flex flex-col items-center justify-center gap-4 mb-4">
                            <div className="relative h-20 w-20 overflow-hidden rounded-full border bg-muted">
                                {previewUrl ? (
                                    <Image
                                        src={previewUrl}
                                        alt="Preview"
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <User className="h-10 w-10 m-auto text-muted-foreground" />
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="text-xs h-8"
                                onClick={() => document.getElementById('modal-avatar-input')?.click()}
                            >
                                <Pencil className="h-3 w-3 mr-2" /> Change Photo
                            </Button>
                            <input
                                id="modal-avatar-input"
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleFileChange}
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="email" className="text-right text-sm font-medium">
                                Email
                            </label>
                            <Input
                                id="email"

                                value={formData.email}
                                disabled
                                className="col-span-3 bg-muted "
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="name" className="text-right text-sm font-medium">
                                Name
                            </label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="col-span-3"
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <label htmlFor="phone" className="text-right text-sm font-medium">
                                Phone
                            </label>
                            <Input
                                id="phone"
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="col-span-3"
                                placeholder="+91 00000 00000"
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button type="submit" onClick={handleSaveChanges} loading={saving}>
                            Save changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}
