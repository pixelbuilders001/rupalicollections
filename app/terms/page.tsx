"use client";

import { motion } from "framer-motion";
import { Navbar } from "@/components/layout/Navbar";
import { DesktopNavbar } from "@/components/layout/DesktopNavbar";
import { Footer } from "@/components/layout/Footer";
import { BottomNav } from "@/components/layout/BottomNav";

export default function TermsPage() {
    return (
        <div className="min-h-screen bg-background">
            <Navbar />
            <DesktopNavbar />

            <main className="container mx-auto px-4 py-12 md:py-24 max-w-4xl">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    <h1 className="font-serif text-3xl md:text-5xl font-bold mb-8 text-primary">Terms of Service</h1>
                    <p className="text-muted-foreground mb-8 text-sm italic">Last Updated: February 6, 2026</p>

                    <div className="prose prose-sm md:prose-base max-w-none text-foreground/80 space-y-8">
                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">1. Introduction</h2>
                            <p>
                                Welcome to Rupali Collections. These Terms of Service ("Terms") govern your use of our website and services. By accessing or using our website, you agree to be bound by these Terms and our Privacy Policy.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">2. Use of Our Services</h2>
                            <p>
                                You must be at least 18 years old or the age of majority in your jurisdiction to use our services. You agree to use our website only for lawful purposes and in a way that does not infringe the rights of others.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">3. Orders and Payments</h2>
                            <p>
                                All orders are subject to acceptance and availability. Prices are subject to change without notice. We reserva the right to refuse any order you place with us. Payment must be received in full before your order is processed.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">4. Shipping and Delivery</h2>
                            <p>
                                We aim to deliver items within the estimated timeframe; however, delays can occur. Ownership and risk of loss pass to you upon delivery to the carrier. Shipping costs are calculated at checkout.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">5. Returns and Refunds</h2>
                            <p>
                                Our return policy is available on our Returns page. Items must be returned in their original condition, unworn and with tags attached, within the specified timeframe. Refunds will be issued to the original payment method.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">6. Intellectual Property</h2>
                            <p>
                                All content on this website, including text, graphics, logos, and images, is the property of Rupali Collections and is protected by intellectual property laws. You may not reproduce or distribute any content without our prior written consent.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">7. Limitation of Liability</h2>
                            <p>
                                Rupali Collections shall not be liable for any indirect, incidental, or consequential damages arising out of your use of our services or products purchased from us.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">8. Governing Law</h2>
                            <p>
                                These Terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of the courts in New Delhi.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-bold text-foreground mb-4 font-serif">9. Changes to Terms</h2>
                            <p>
                                We reserve the right to modify these Terms at any time. Changes will be effective immediately upon posting on our website. Your continued use of the website constitutes acceptance of the modified Terms.
                            </p>
                        </section>
                    </div>
                </motion.div>
            </main>

            <Footer />
            <BottomNav />
        </div>
    );
}
